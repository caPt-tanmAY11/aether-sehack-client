import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { leaveApi } from '../../api/leave.api';
import { handleViewPdf } from '../../utils/pdf';
import { useTheme } from '../../hooks/ThemeContext';
import AppHeader from '../../components/AppHeader';

export default function LeaveApprovalsScreen() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remarkText, setRemarkText] = useState('');
  const [activeRequest, setActiveRequest] = useState(null);
  const { theme: T } = useTheme();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await leaveApi.getPending();
      setRequests(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    try {
      setLoading(true);
      await leaveApi.review(id, status, remarkText);
      Alert.alert('Success', `Leave request ${status}`);
      setRemarkText('');
      setActiveRequest(null);
      fetchRequests();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to review request');
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="Leave Approvals" showBack />

      {loading && requests.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={T.accent} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          {requests.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Ionicons name="checkmark-done-circle-outline" size={56} color={T.muted} />
              <Text style={{ color: T.text, fontSize: 18, fontWeight: '900', marginTop: 16 }}>All Caught Up</Text>
              <Text style={{ color: T.muted, textAlign: 'center', marginTop: 8 }}>
                No pending leave requests.
              </Text>
            </View>
          ) : (
            requests.map(req => (
              <View key={req._id} style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ color: T.text, fontSize: 16, fontWeight: '900', flex: 1 }}>{req.facultyId?.name}</Text>
                  <TouchableOpacity onPress={() => {
                    handleViewPdf(`/leave/faculty/${req._id}/pdf`, `Faculty_Leave_${req._id}`).catch(err => Alert.alert('Error', err.message));
                  }} style={[s.pdfBtn, { backgroundColor: T.iconBg, borderColor: T.border }]}>
                    <Ionicons name="document-text-outline" size={20} color={T.accent} />
                  </TouchableOpacity>
                </View>
                
                <Text style={{ color: T.accent, fontWeight: '900', textTransform: 'capitalize', marginBottom: 12 }}>
                  {req.leaveType} Leave
                </Text>
                
                <Text style={[s.label, { color: T.muted }]}>Duration</Text>
                <Text style={{ color: T.textSub, fontSize: 13, marginBottom: 12 }}>
                  {new Date(req.fromDate).toLocaleDateString()} – {new Date(req.toDate).toLocaleDateString()} ({req.totalDays || 1} day{req.totalDays > 1 ? 's' : ''})
                </Text>
                
                <Text style={[s.label, { color: T.muted }]}>Reason</Text>
                <Text style={{ color: T.textSub, fontSize: 13, marginBottom: 16 }}>{req.reason}</Text>

                {activeRequest === req._id ? (
                  <View style={{ borderTopWidth: 1, borderTopColor: T.border, paddingTop: 16 }}>
                    <TextInput
                      style={[s.textArea, { backgroundColor: T.bg, color: T.text, borderColor: T.border }]}
                      placeholder="Add remarks (optional)..."
                      placeholderTextColor={T.muted}
                      value={remarkText}
                      onChangeText={setRemarkText}
                      multiline
                    />
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                      <TouchableOpacity onPress={() => setActiveRequest(null)} style={{ paddingHorizontal: 12, paddingVertical: 10 }}>
                        <Text style={{ color: T.muted, fontWeight: '800' }}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleReview(req._id, 'rejected')} 
                        style={[s.actionBtn, { backgroundColor: `${T.error}20`, borderColor: `${T.error}50` }]}
                      >
                        <Text style={{ color: T.error, fontWeight: '900' }}>Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleReview(req._id, 'approved')} 
                        style={[s.actionBtn, { backgroundColor: `${T.success}20`, borderColor: `${T.success}50` }]}
                      >
                        <Text style={{ color: T.success, fontWeight: '900' }}>Approve</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity 
                    onPress={() => setActiveRequest(req._id)}
                    style={[s.reviewBtn, { backgroundColor: T.bg, borderColor: T.border }]}
                  >
                    <Text style={{ color: T.text, fontWeight: '900' }}>Review Request</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 16,
  },
  pdfBtn: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginLeft: 12,
  },
  label: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  textArea: {
    borderRadius: 12, borderWidth: 1, padding: 12, fontSize: 14, minHeight: 60, marginBottom: 12,
  },
  actionBtn: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1,
  },
  reviewBtn: {
    paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
});
