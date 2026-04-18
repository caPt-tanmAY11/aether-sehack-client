import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { clubsApi } from '../../api/clubs.api';
import { useAuthStore } from '../../store/auth.store';

export default function ClubsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('all');
  const [clubs, setClubs] = useState([]);
  const [myClubs, setMyClubs] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestModal, setRequestModal] = useState({ visible: false, clubId: null, clubName: '' });
  const [requestMessage, setRequestMessage] = useState('');
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'all') {
        const data = await clubsApi.listClubs();
        setClubs(data);
      } else if (activeTab === 'my') {
        const data = await clubsApi.getMyClubs();
        setMyClubs(data);
      } else if (activeTab === 'requests') {
        const data = await clubsApi.getPendingRequests();
        setPendingRequests(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isActiveMember = (club) =>
    club.members?.some(
      m => (m.userId?._id || m.userId)?.toString() === user?._id?.toString() && m.isActive
    );

  const hasPendingRequest = (club) =>
    club.joinRequests?.some(
      r => (r.userId?._id || r.userId)?.toString() === user?._id?.toString() && r.status === 'pending'
    );

  const openRequestModal = (club) => {
    setRequestModal({ visible: true, clubId: club._id, clubName: club.name });
    setRequestMessage('');
  };

  const handleRequestJoin = async () => {
    try {
      setLoading(true);
      setRequestModal(m => ({ ...m, visible: false }));
      await clubsApi.requestJoinClub(requestModal.clubId, requestMessage);
      Alert.alert('Request Sent', `Your request to join ${requestModal.clubName} has been sent to the club president for approval.`);
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

  return (
    <View className="flex-1 bg-surface">
      <View className="px-4 pt-12 pb-4 bg-card border-b border-border flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 bg-surface rounded-full">
          <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Campus Clubs</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row mx-4 mt-4 mb-2 bg-card rounded-xl p-1 border border-border">
        {['all', 'my', 'requests'].map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-2 items-center rounded-lg ${activeTab === tab ? 'bg-primary' : 'bg-transparent'}`}
          >
            <Text className={`text-xs font-bold ${activeTab === tab ? 'text-white' : 'text-muted'}`}>
              {tab === 'all' ? 'All Clubs' : tab === 'my' ? 'My Clubs' : 'Requests'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="p-4 flex-1">
        {loading ? (
          <ActivityIndicator color="#6366f1" size="large" className="mt-10" />
        ) : activeTab === 'all' ? (
          clubs.length === 0 ? (
            <Text className="text-muted text-center mt-10">No clubs found.</Text>
          ) : clubs.map(club => (
            <View key={club._id} className="bg-card p-4 rounded-2xl border border-border mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-white text-lg font-bold flex-1 mr-2">{club.name}</Text>
                <View className="bg-primary/20 px-2 py-1 rounded-md border border-primary/30">
                  <Text className="text-primary text-xs font-bold uppercase">{club.category}</Text>
                </View>
              </View>
              <Text className="text-slate-300 mb-1 text-sm">{club.description}</Text>
              {club.facultyAdvisorId?.name && (
                <Text className="text-muted text-xs mb-3">Advisor: {club.facultyAdvisorId.name}</Text>
              )}
              <View className="flex-row items-center justify-between border-t border-border pt-3 mt-1">
                <Text className="text-muted text-sm">
                  {club.members?.filter(m => m.isActive).length || 0} Members
                </Text>
                {isActiveMember(club) ? (
                  <TouchableOpacity
                    onPress={() => handleLeave(club._id)}
                    className="bg-surface border border-border px-4 py-1.5 rounded-lg"
                  >
                    <Text className="text-muted font-bold text-sm">Leave</Text>
                  </TouchableOpacity>
                ) : hasPendingRequest(club) ? (
                  <View className="bg-warning/20 border border-warning/30 px-4 py-1.5 rounded-lg">
                    <Text className="text-warning font-bold text-sm">Pending</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => openRequestModal(club)}
                    className="bg-success/20 border border-success/30 px-4 py-1.5 rounded-lg"
                  >
                    <Text className="text-success font-bold text-sm">Request to Join</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        ) : activeTab === 'my' ? (
          myClubs.length === 0 ? (
            <Text className="text-muted text-center mt-10">You haven't joined any clubs yet.</Text>
          ) : myClubs.map(club => (
            <View key={club._id} className="bg-card p-4 rounded-2xl border border-border mb-4">
              <Text className="text-white text-lg font-bold mb-1">{club.name}</Text>
              <Text className="text-slate-300 text-sm mb-4">{club.description}</Text>
              <TouchableOpacity
                onPress={() => handleLeave(club._id)}
                className="self-end bg-error/10 border border-error/30 px-4 py-1.5 rounded-lg"
              >
                <Text className="text-error font-bold text-sm">Leave Club</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          /* Pending join requests — visible to president/advisor */
          pendingRequests.length === 0 ? (
            <View className="items-center mt-10">
              <Ionicons name="checkmark-circle-outline" size={48} color="#64748b" />
              <Text className="text-muted text-center mt-3">No pending join requests.</Text>
            </View>
          ) : pendingRequests.map(entry => (
            <View key={entry.clubId} className="bg-card p-4 rounded-2xl border border-border mb-4">
              <Text className="text-white text-lg font-bold mb-3">{entry.clubName}</Text>
              {entry.requests.map(req => (
                <View key={req._id} className="bg-surface p-3 rounded-xl border border-border mb-3">
                  <Text className="text-white font-bold">{req.userId?.name || 'Unknown'}</Text>
                  <Text className="text-muted text-xs mb-1">{req.userId?.email}</Text>
                  {req.message ? (
                    <Text className="text-slate-300 text-sm mb-3">"{req.message}"</Text>
                  ) : null}
                  <View className="flex-row gap-2 mt-1">
                    <TouchableOpacity
                      onPress={() => handleReview(entry.clubId, req._id, 'approved')}
                      className="flex-1 bg-success/20 border border-success/30 py-2 rounded-lg items-center"
                    >
                      <Text className="text-success font-bold text-sm">Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleReview(entry.clubId, req._id, 'rejected')}
                      className="flex-1 bg-error/10 border border-error/30 py-2 rounded-lg items-center ml-2"
                    >
                      <Text className="text-error font-bold text-sm">Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
        <View className="h-20" />
      </ScrollView>

      {/* Request to Join Modal */}
      <Modal
        visible={requestModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setRequestModal(m => ({ ...m, visible: false }))}
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-card w-full p-5 rounded-2xl border border-border">
            <Text className="text-white text-lg font-bold mb-1">Request to Join</Text>
            <Text className="text-muted text-sm mb-4">{requestModal.clubName}</Text>
            <Text className="text-muted text-xs font-bold mb-2">Message (optional)</Text>
            <TextInput
              className="bg-surface text-white p-3 rounded-xl border border-border mb-5 h-20"
              placeholder="Why do you want to join?"
              placeholderTextColor="#64748b"
              value={requestMessage}
              onChangeText={setRequestMessage}
              multiline
              textAlignVertical="top"
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setRequestModal(m => ({ ...m, visible: false }))}
                className="flex-1 bg-surface border border-border py-3 rounded-xl items-center"
              >
                <Text className="text-muted font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRequestJoin}
                className="flex-1 bg-primary py-3 rounded-xl items-center ml-2"
              >
                <Text className="text-white font-bold">Send Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
