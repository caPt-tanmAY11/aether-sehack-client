import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { leaveApi } from '../../api/leave.api';

export default function LeaveApprovalsScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remarkText, setRemarkText] = useState('');
  const [activeRequest, setActiveRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await leaveApi.getPending();
      setRequests(data);
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
    <View className="flex-1 bg-surface">
      <View className="px-4 pt-12 pb-4 bg-card border-b border-border flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 bg-surface rounded-full">
          <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Leave Approvals</Text>
      </View>

      <ScrollView className="p-4 flex-1">
        {loading ? (
          <ActivityIndicator color="#6366f1" size="large" className="mt-10" />
        ) : requests.length === 0 ? (
          <View className="items-center mt-10">
            <Ionicons name="checkmark-done-circle" size={48} color="#22c55e" className="mb-4" />
            <Text className="text-muted text-lg">No pending leave requests.</Text>
          </View>
        ) : (
          requests.map(req => (
            <View key={req._id} className="bg-card p-4 rounded-2xl border border-border mb-4">
              <Text className="text-white text-lg font-bold mb-1">{req.facultyId?.name}</Text>
              <Text className="text-primary font-bold capitalize mb-3">{req.leaveType} Leave</Text>
              
              <Text className="text-muted text-xs mb-1">Duration</Text>
              <Text className="text-slate-300 mb-3">{new Date(req.fromDate).toLocaleDateString()} – {new Date(req.toDate).toLocaleDateString()} ({req.totalDays || 1} day{req.totalDays > 1 ? 's' : ''})</Text>
              
              <Text className="text-muted text-xs mb-1">Reason</Text>
              <Text className="text-slate-300 mb-4">{req.reason}</Text>

              {activeRequest === req._id ? (
                <View className="border-t border-border pt-4 mt-2">
                  <TextInput
                    className="bg-surface text-white p-3 rounded-xl border border-border mb-4"
                    placeholder="Add remarks (optional)..."
                    placeholderTextColor="#64748b"
                    value={remarkText}
                    onChangeText={setRemarkText}
                  />
                  <View className="flex-row justify-end space-x-3">
                    <TouchableOpacity onPress={() => setActiveRequest(null)} className="px-4 py-2">
                      <Text className="text-muted font-bold">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleReview(req._id, 'rejected')} className="bg-error/20 border border-error/50 px-4 py-2 rounded-lg mr-2">
                      <Text className="text-error font-bold">Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleReview(req._id, 'approved')} className="bg-success/20 border border-success/50 px-4 py-2 rounded-lg">
                      <Text className="text-success font-bold">Approve</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity 
                  onPress={() => setActiveRequest(req._id)}
                  className="bg-surface border border-border p-3 rounded-xl items-center"
                >
                  <Text className="text-white font-bold">Review Request</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
