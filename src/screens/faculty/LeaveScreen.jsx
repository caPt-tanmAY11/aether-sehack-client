import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { leaveApi } from '../../api/leave.api';
import { handleViewPdf } from '../../utils/pdf';

export default function LeaveScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('history'); // 'history' or 'apply'
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const [leaveType, setLeaveType] = useState('casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (activeTab === 'history') fetchLeaves();
  }, [activeTab]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await leaveApi.getMyLeaves();
      setLeaves(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      setLoading(true);
      await leaveApi.apply({
        leaveType,
        fromDate: new Date(startDate).toISOString(),
        toDate: new Date(endDate).toISOString(),
        reason
      });
      Alert.alert('Success', 'Leave request submitted for review');
      setStartDate('');
      setEndDate('');
      setReason('');
      setActiveTab('history');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to submit leave request');
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-surface">
      <View className="px-4 pt-12 pb-4 bg-card border-b border-border">
        <Text className="text-white text-xl font-bold">Leave Management</Text>
      </View>

      <View className="flex-row mx-4 mt-4 mb-2 bg-card rounded-xl p-1 border border-border">
        <TouchableOpacity 
          onPress={() => setActiveTab('history')}
          className={`flex-1 py-2 items-center rounded-lg ${activeTab === 'history' ? 'bg-primary' : 'bg-transparent'}`}
        >
          <Text className={activeTab === 'history' ? 'text-white font-bold' : 'text-muted font-bold'}>My History</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('apply')}
          className={`flex-1 py-2 items-center rounded-lg ${activeTab === 'apply' ? 'bg-primary' : 'bg-transparent'}`}
        >
          <Text className={activeTab === 'apply' ? 'text-white font-bold' : 'text-muted font-bold'}>Apply</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="p-4 flex-1">
        {activeTab === 'history' ? (
          loading ? (
            <ActivityIndicator color="#6366f1" size="large" className="mt-10" />
          ) : leaves.length === 0 ? (
            <View className="items-center mt-10"><Text className="text-muted text-lg">No leave requests found.</Text></View>
          ) : (
            leaves.map(leave => (
              <View key={leave._id} className="bg-card p-4 rounded-2xl border border-border mb-4">
                <View className="flex-row justify-between mb-2 items-center">
                  <View className="flex-1">
                    <Text className="text-white text-lg font-bold capitalize">{leave.leaveType} Leave</Text>
                    <View className={`px-2 py-1 rounded-md border mt-1 self-start ${leave.status === 'approved' ? 'bg-success/20 border-success/50' : leave.status === 'rejected' ? 'bg-error/20 border-error/50' : 'bg-warning/20 border-warning/50'}`}>
                      <Text className={`${leave.status === 'approved' ? 'text-success' : leave.status === 'rejected' ? 'text-error' : 'text-warning'} text-xs font-bold capitalize`}>{leave.status}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => {
                    handleViewPdf(`/leave/faculty/${leave._id}/pdf`, `Faculty_Leave_${leave._id}`).catch(err => Alert.alert('Error', err.message));
                  }} className="p-2 bg-surface rounded-full border border-border ml-2">
                    <Ionicons name="document-text-outline" size={20} color="#818cf8" />
                  </TouchableOpacity>
                </View>
                <Text className="text-muted text-xs mb-3">
                  {new Date(leave.fromDate).toLocaleDateString()} to {new Date(leave.toDate).toLocaleDateString()}
                </Text>
                <Text className="text-slate-300">{leave.reason}</Text>
                {leave.hodRemarks && (
                  <View className="mt-3 p-3 bg-surface rounded-xl border border-border">
                    <Text className="text-muted text-xs font-bold mb-1">HOD Remarks:</Text>
                    <Text className="text-slate-400 text-sm">{leave.hodRemarks}</Text>
                  </View>
                )}
              </View>
            ))
          )
        ) : (
          <View className="bg-card p-4 rounded-2xl border border-border mb-8">
            <Text className="text-muted text-sm font-bold mb-2">Leave Type (casual, medical, earned, duty, maternity, paternity, unpaid)</Text>
            <TextInput
              className="bg-surface text-white p-3 rounded-xl border border-border mb-4 capitalize"
              value={leaveType}
              onChangeText={setLeaveType}
            />

            <Text className="text-muted text-sm font-bold mb-2">Start Date (YYYY-MM-DD)</Text>
            <TextInput
              className="bg-surface text-white p-3 rounded-xl border border-border mb-4"
              placeholder="2026-10-15"
              placeholderTextColor="#64748b"
              value={startDate}
              onChangeText={setStartDate}
            />

            <Text className="text-muted text-sm font-bold mb-2">End Date (YYYY-MM-DD)</Text>
            <TextInput
              className="bg-surface text-white p-3 rounded-xl border border-border mb-4"
              placeholder="2026-10-16"
              placeholderTextColor="#64748b"
              value={endDate}
              onChangeText={setEndDate}
            />

            <Text className="text-muted text-sm font-bold mb-2">Reason</Text>
            <TextInput
              className="bg-surface text-white p-3 rounded-xl border border-border mb-6 h-24"
              placeholder="Details..."
              placeholderTextColor="#64748b"
              value={reason}
              onChangeText={setReason}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity 
              onPress={handleApply}
              disabled={loading}
              className="bg-primary p-4 rounded-xl flex-row justify-center items-center"
            >
              {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Submit Request</Text>}
            </TouchableOpacity>
          </View>
        )}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
