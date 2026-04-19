import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, Modal, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { clubsApi } from '../../api/clubs.api';
import { useAuthStore } from '../../store/auth.store';
import { useTheme } from '../../hooks/ThemeContext';

export default function ClubsScreen({ navigation }) {
  const { theme: T } = useTheme();
  const [activeTab, setActiveTab] = useState('all');
  const [clubs, setClubs] = useState([]);
  const [myClubs, setMyClubs] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestModal, setRequestModal] = useState({ visible: false, clubId: null, clubName: '' });
  const [requestMessage, setRequestMessage] = useState('');
  const user = useAuthStore(state => state.user);

  useEffect(() => { fetchData(); }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'all')           setClubs(await clubsApi.listClubs());
      else if (activeTab === 'my')       setMyClubs(await clubsApi.getMyClubs());
      else if (activeTab === 'requests') setPendingRequests(await clubsApi.getPendingRequests());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isActiveMember = (club) =>
    club.members?.some(m => (m.userId?._id || m.userId)?.toString() === user?._id?.toString() && m.isActive);

  const hasPendingRequest = (club) =>
    club.joinRequests?.some(r => (r.userId?._id || r.userId)?.toString() === user?._id?.toString() && r.status === 'pending');

  const openRequestModal = (club) => {
    setRequestModal({ visible: true, clubId: club._id, clubName: club.name });
    setRequestMessage('');
  };

  const handleRequestJoin = async () => {
    try {
      setLoading(true);
      setRequestModal(m => ({ ...m, visible: false }));
      await clubsApi.requestJoinClub(requestModal.clubId, requestMessage);
      Alert.alert('Request Sent', `Your request to join ${requestModal.clubName} has been sent.`);
      fetchData();
    } catch (err) {
      Alert.alert('Failed', err?.response?.data?.message || 'Failed to send request');
      setLoading(false);
    }
  };

  const handleLeave = async (id) => {
    try {
      setLoading(true);
      await clubsApi.leaveClub(id);
      Alert.alert('Left', 'You have left the club.');
      fetchData();
    } catch (err) {
      Alert.alert('Failed', err?.response?.data?.message || 'Failed to leave club');
      setLoading(false);
    }
  };

  const handleReview = async (clubId, requestId, decision) => {
    try {
      setLoading(true);
      await clubsApi.reviewJoinRequest(clubId, requestId, decision);
      Alert.alert('Done', `Request ${decision}.`);
      fetchData();
    } catch (err) {
      Alert.alert('Failed', err?.response?.data?.message || 'Failed to review request');
      setLoading(false);
    }
  };

  const TABS = [
    { key: 'all',      label: 'All Clubs' },
    { key: 'my',       label: 'My Clubs' },
    { key: 'requests', label: 'Requests' },
  ];

  return (
    <View style={[s.root, { backgroundColor: T.bg }]}>

      {/* Header */}
      <View style={[s.header, { backgroundColor: T.card, borderBottomColor: T.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[s.backBtn, { backgroundColor: T.iconBg }]}>
          <Ionicons name="chevron-back" size={20} color={T.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: T.text }]}>Campus Clubs</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Tabs */}
      <View style={[s.tabBar, { backgroundColor: T.card, borderColor: T.border }]}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[s.tab, activeTab === tab.key && { backgroundColor: T.accent }]}
            activeOpacity={0.8}
          >
            <Text style={[s.tabText, { color: activeTab === tab.key ? '#ffffff' : T.muted }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {loading ? (
          <ActivityIndicator color={T.accent} size="large" style={{ marginTop: 40 }} />
        ) : activeTab === 'all' ? (
          clubs.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="people-outline" size={48} color={T.muted} />
              <Text style={[s.emptyText, { color: T.muted }]}>No clubs found.</Text>
            </View>
          ) : clubs.map(club => (
            <View key={club._id} style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
              <View style={s.cardTitleRow}>
                <Text style={[s.cardTitle, { color: T.text }]}>{club.name}</Text>
                <View style={[s.catBadge, { backgroundColor: T.accentSoft, borderColor: T.accent }]}>
                  <Text style={[s.catText, { color: T.accent }]}>{club.category}</Text>
                </View>
              </View>
              <Text style={[s.cardDesc, { color: T.textSub }]}>{club.description}</Text>
              {club.facultyAdvisorId?.name && (
                <Text style={[s.advisor, { color: T.muted }]}>Advisor: {club.facultyAdvisorId.name}</Text>
              )}
              <View style={[s.cardFooter, { borderTopColor: T.border }]}>
                <Text style={[s.memberCount, { color: T.muted }]}>
                  {club.members?.filter(m => m.isActive).length || 0} Members
                </Text>
                {isActiveMember(club) ? (
                  <TouchableOpacity
                    onPress={() => handleLeave(club._id)}
                    style={[s.actionBtn, { backgroundColor: T.iconBg, borderColor: T.border }]}
                  >
                    <Text style={[s.actionBtnText, { color: T.muted }]}>Leave</Text>
                  </TouchableOpacity>
                ) : hasPendingRequest(club) ? (
                  <View style={[s.actionBtn, { backgroundColor: `${T.warning}18`, borderColor: `${T.warning}50` }]}>
                    <Text style={[s.actionBtnText, { color: T.warning }]}>Pending</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => openRequestModal(club)}
                    style={[s.actionBtn, { backgroundColor: `${T.success}18`, borderColor: `${T.success}50` }]}
                  >
                    <Text style={[s.actionBtnText, { color: T.success }]}>Request to Join</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        ) : activeTab === 'my' ? (
          myClubs.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="people-circle-outline" size={48} color={T.muted} />
              <Text style={[s.emptyText, { color: T.muted }]}>You haven't joined any clubs yet.</Text>
            </View>
          ) : myClubs.map(club => (
            <View key={club._id} style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
              <Text style={[s.cardTitle, { color: T.text }]}>{club.name}</Text>
              <Text style={[s.cardDesc, { color: T.textSub }]}>{club.description}</Text>
              <TouchableOpacity
                onPress={() => handleLeave(club._id)}
                style={[s.leaveBtn, { backgroundColor: `${T.error}10`, borderColor: `${T.error}40` }]}
              >
                <Text style={[s.actionBtnText, { color: T.error }]}>Leave Club</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          pendingRequests.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="checkmark-circle-outline" size={48} color={T.muted} />
              <Text style={[s.emptyText, { color: T.muted }]}>No pending join requests.</Text>
            </View>
          ) : pendingRequests.map(entry => (
            <View key={entry.clubId} style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
              <Text style={[s.cardTitle, { color: T.text }]}>{entry.clubName}</Text>
              {entry.requests.map(req => (
                <View key={req._id} style={[s.reqItem, { backgroundColor: T.iconBg, borderColor: T.border }]}>
                  <Text style={[s.reqName, { color: T.text }]}>{req.userId?.name || 'Unknown'}</Text>
                  <Text style={[s.reqEmail, { color: T.muted }]}>{req.userId?.email}</Text>
                  {req.message && (
                    <Text style={[s.reqMsg, { color: T.textSub }]}>"{req.message}"</Text>
                  )}
                  <View style={s.reqActions}>
                    <TouchableOpacity
                      onPress={() => handleReview(entry.clubId, req._id, 'approved')}
                      style={[s.actionBtn, { flex: 1, backgroundColor: `${T.success}18`, borderColor: `${T.success}50`, justifyContent: 'center' }]}
                    >
                      <Text style={[s.actionBtnText, { color: T.success }]}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleReview(entry.clubId, req._id, 'rejected')}
                      style={[s.actionBtn, { flex: 1, backgroundColor: `${T.error}10`, borderColor: `${T.error}40`, justifyContent: 'center' }]}
                    >
                      <Text style={[s.actionBtnText, { color: T.error }]}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* Request Join Modal */}
      <Modal
        visible={requestModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setRequestModal(m => ({ ...m, visible: false }))}
      >
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, { backgroundColor: T.card, borderColor: T.border }]}>
            <Text style={[s.modalTitle, { color: T.text }]}>Request to Join</Text>
            <Text style={[s.modalSub, { color: T.muted }]}>{requestModal.clubName}</Text>
            <Text style={[s.modalLabel, { color: T.muted }]}>Message (optional)</Text>
            <TextInput
              style={[s.modalInput, { backgroundColor: T.bg, color: T.text, borderColor: T.border }]}
              placeholder="Why do you want to join?"
              placeholderTextColor={T.muted}
              value={requestMessage}
              onChangeText={setRequestMessage}
              multiline
              textAlignVertical="top"
            />
            <View style={s.modalActions}>
              <TouchableOpacity
                onPress={() => setRequestModal(m => ({ ...m, visible: false }))}
                style={[s.modalBtn, { backgroundColor: T.iconBg, borderColor: T.border }]}
              >
                <Text style={[s.modalBtnText, { color: T.muted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRequestJoin}
                style={[s.modalBtn, { backgroundColor: T.accent }]}
              >
                <Text style={[s.modalBtnText, { color: '#ffffff' }]}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 160 },

  header: {
    paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },

  tabBar: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 12, marginBottom: 4,
    borderRadius: 16, borderWidth: 2, padding: 4, gap: 4,
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 12, alignItems: 'center' },
  tabText: { fontSize: 12, fontWeight: '800' },

  empty:     { alignItems: 'center', paddingTop: 48, gap: 12 },
  emptyText: { fontSize: 15, fontWeight: '700' },

  card: {
    borderRadius: 20, borderWidth: 2, padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 0, elevation: 3,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '900', flex: 1, marginRight: 8 },
  cardDesc:  { fontSize: 13, lineHeight: 18, marginBottom: 6 },
  advisor:   { fontSize: 12, fontWeight: '600', marginBottom: 10 },

  catBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, borderWidth: 1.5,
  },
  catText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },

  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 12, marginTop: 4,
  },
  memberCount: { fontSize: 13, fontWeight: '600' },
  actionBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 10, borderWidth: 1.5,
    flexDirection: 'row', alignItems: 'center',
  },
  actionBtnText: { fontSize: 13, fontWeight: '800' },

  leaveBtn: {
    alignSelf: 'flex-end', paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 10, borderWidth: 1.5, marginTop: 8,
  },

  reqItem: { borderRadius: 14, borderWidth: 1.5, padding: 12, marginTop: 10 },
  reqName:    { fontSize: 15, fontWeight: '800', marginBottom: 2 },
  reqEmail:   { fontSize: 12, marginBottom: 6 },
  reqMsg:     { fontSize: 13, fontStyle: 'italic', marginBottom: 10 },
  reqActions: { flexDirection: 'row', gap: 8 },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24,
  },
  modalCard: { width: '100%', borderRadius: 24, borderWidth: 2, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', marginBottom: 4 },
  modalSub:   { fontSize: 13, marginBottom: 16 },
  modalLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  modalInput: {
    borderWidth: 2, borderRadius: 14,
    padding: 12, height: 80, fontSize: 14,
    marginBottom: 16,
  },
  modalActions:  { flexDirection: 'row', gap: 10 },
  modalBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 12,
    borderWidth: 2, alignItems: 'center',
  },
  modalBtnText: { fontSize: 15, fontWeight: '800' },
});
