import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { leaveApi } from '../../api/leave.api';
import { handleViewPdf } from '../../utils/pdf';
import { useTheme } from '../../hooks/ThemeContext';

export default function LeaveScreen({ navigation }) {
  const { theme: T } = useTheme();
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
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <View style={{ backgroundColor: T.card, borderBottomColor: T.border, borderBottomWidth: 1 }} className="px-4 pt-12 pb-4">
        <Text style={{ color: T.text }} className="text-xl font-bold">Leave Management</Text>
      </View>

      <View style={{ backgroundColor: T.card, borderColor: T.border }} className="flex-row mx-4 mt-4 mb-2 rounded-xl p-1 border">
        <TouchableOpacity 
          onPress={() => setActiveTab('history')}
          style={{ backgroundColor: activeTab === 'history' ? T.accent : 'transparent' }}
          className="flex-1 py-2 items-center rounded-lg"
        >
          <Text style={{ color: activeTab === 'history' ? '#ffffff' : T.muted }} className="font-bold">My History</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('apply')}
          style={{ backgroundColor: activeTab === 'apply' ? T.accent : 'transparent' }}
          className="flex-1 py-2 items-center rounded-lg"
        >
          <Text style={{ color: activeTab === 'apply' ? '#ffffff' : T.muted }} className="font-bold">Apply</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="p-4 flex-1">
        {activeTab === 'history' ? (
          loading ? (
            <ActivityIndicator color={T.accent} size="large" className="mt-10" />
          ) : leaves.length === 0 ? (
            <View className="items-center mt-10"><Text style={{ color: T.muted }} className="text-lg">No leave requests found.</Text></View>
          ) : (
            leaves.map(leave => {
              const sColor = leave.status === 'approved' ? T.success : leave.status === 'rejected' ? T.error : T.warning;
              return (
                <View key={leave._id} style={{ backgroundColor: T.card, borderColor: T.border }} className="p-4 rounded-2xl border mb-4">
                  <View className="flex-row justify-between mb-2 items-center">
                    <View className="flex-1">
                      <Text style={{ color: T.text }} className="text-lg font-bold capitalize">{leave.leaveType} Leave</Text>
                      <View style={{ backgroundColor: `${sColor}20`, borderColor: `${sColor}50` }} className="px-2 py-1 rounded-md border mt-1 self-start">
                        <Text style={{ color: sColor }} className="text-xs font-bold capitalize">{leave.status}</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => {
                      handleViewPdf(`/leave/faculty/${leave._id}/pdf`, `Faculty_Leave_${leave._id}`).catch(err => Alert.alert('Error', err.message));
                    }} style={{ backgroundColor: T.bg, borderColor: T.border }} className="p-2 rounded-full border ml-2">
                      <Ionicons name="document-text-outline" size={20} color={T.accent} />
                    </TouchableOpacity>
                  </View>
                  <Text style={{ color: T.muted }} className="text-xs mb-3">
                    {new Date(leave.fromDate).toLocaleDateString()} to {new Date(leave.toDate).toLocaleDateString()}
                  </Text>
                  <Text style={{ color: T.textSub }}>{leave.reason}</Text>
                  {leave.hodRemarks && (
                    <View style={{ backgroundColor: T.bg, borderColor: T.border }} className="mt-3 p-3 rounded-xl border">
                      <Text style={{ color: T.muted }} className="text-xs font-bold mb-1">HOD Remarks:</Text>
                      <Text style={{ color: T.textSub }} className="text-sm">{leave.hodRemarks}</Text>
                    </View>
                  )}
                </View>
              );
            })
          )
        ) : (
          <View style={{ backgroundColor: T.card, borderColor: T.border }} className="p-4 rounded-2xl border mb-8">
            <Text style={{ color: T.muted }} className="text-sm font-bold mb-2">Leave Type (casual, medical, earned, duty, maternity, paternity, unpaid)</Text>
            <TextInput
              style={{ backgroundColor: T.bg, color: T.text, borderColor: T.border }}
              className="p-3 rounded-xl border mb-4 capitalize"
              value={leaveType}
              onChangeText={setLeaveType}
            />

            <Text style={{ color: T.muted }} className="text-sm font-bold mb-2">Start Date (YYYY-MM-DD)</Text>
            <TextInput
              style={{ backgroundColor: T.bg, color: T.text, borderColor: T.border }}
              className="p-3 rounded-xl border mb-4"
              placeholder="2026-10-15"
              placeholderTextColor={T.muted}
              value={startDate}
              onChangeText={setStartDate}
            />

            <Text style={{ color: T.muted }} className="text-sm font-bold mb-2">End Date (YYYY-MM-DD)</Text>
            <TextInput
              style={{ backgroundColor: T.bg, color: T.text, borderColor: T.border }}
              className="p-3 rounded-xl border mb-4"
              placeholder="2026-10-16"
              placeholderTextColor={T.muted}
              value={endDate}
              onChangeText={setEndDate}
            />

            <Text style={{ color: T.muted }} className="text-sm font-bold mb-2">Reason</Text>
            <TextInput
              style={{ backgroundColor: T.bg, color: T.text, borderColor: T.border }}
              className="p-3 rounded-xl border mb-6 h-24"
              placeholder="Details..."
              placeholderTextColor={T.muted}
              value={reason}
              onChangeText={setReason}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity 
              onPress={handleApply}
              disabled={loading}
              style={{ backgroundColor: T.accent }}
              className="p-4 rounded-xl flex-row justify-center items-center"
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Submit Request</Text>}
            </TouchableOpacity>
          </View>
        )}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
