import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, Modal, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { leaveApi } from '../../api/leave.api';
import { apiClient } from '../../api/client';
import CalendarPicker from '../../components/CalendarPicker';

const LEAVE_TYPES = ['medical', 'personal', 'family', 'other'];

export default function LeaveApplicationScreen() {
  const navigation = useNavigation();
  const [faculty, setFaculty] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveType, setLeaveType] = useState('personal');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [fRes, lRes] = await Promise.all([
        apiClient.get('/auth/users', { params: { role: 'faculty' } }).catch(() => ({ data: { data: [] } })),
        leaveApi.studentMyLeaves().catch(() => [])
      ]);
      setFaculty(fRes.data?.data || []);
      setMyLeaves(lRes || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!selectedFaculty || !fromDate || !toDate || !reason.trim()) {
      Alert.alert('Incomplete', 'Please fill in all fields.');
      return;
    }
    setSubmitting(true);
    try {
      await leaveApi.studentApply({ facultyId: selectedFaculty._id, fromDate, toDate, reason: reason.trim(), leaveType });
      Alert.alert('✅ Submitted', 'Leave application submitted!');
      setShowForm(false);
      setFromDate(''); setToDate(''); setReason(''); setSelectedFaculty(null);
      fetchAll();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to submit leave');
    } finally { setSubmitting(false); }
  };

  const STATUS_COLOR = { pending: '#f59e0b', approved: '#22c55e', rejected: '#ef4444' };

  if (loading) {
    return <View className="flex-1 bg-surface justify-center items-center"><ActivityIndicator color="#6366f1" size="large" /></View>;
  }

  return (
    <ScrollView className="flex-1 bg-surface px-4 pt-6">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Leave Application</Text>
      </View>

      <TouchableOpacity
        onPress={() => setShowForm(!showForm)}
        className="bg-primary p-4 rounded-2xl mb-6 flex-row items-center justify-center"
      >
        <Ionicons name={showForm ? 'chevron-up' : 'add-circle'} size={20} color="white" />
        <Text className="text-white font-bold text-lg ml-2">{showForm ? 'Collapse Form' : 'Apply for Leave'}</Text>
      </TouchableOpacity>

      {showForm && (
        <View className="bg-card p-4 rounded-2xl border border-border mb-6">
          <Text className="text-muted text-sm font-bold mb-2">Select Faculty</Text>
          <View className="bg-surface border border-border rounded-xl overflow-hidden mb-4">
            {faculty.length === 0 ? (
              <Text className="text-muted text-sm p-3">No faculty found.</Text>
            ) : (
              faculty.map((f, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelectedFaculty(f)}
                  className={`flex-row items-center p-3 ${i < faculty.length - 1 ? 'border-b border-border/50' : ''} ${selectedFaculty?._id === f._id ? 'bg-primary/20' : ''}`}
                >
                  <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center mr-3">
                    <Text className="text-primary text-xs font-bold">{f.name?.[0]?.toUpperCase()}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className={`font-bold text-sm ${selectedFaculty?._id === f._id ? 'text-primary' : 'text-white'}`}>{f.name}</Text>
                    <Text className="text-muted text-xs">{f.departmentId?.name}</Text>
                  </View>
                  {selectedFaculty?._id === f._id && <Ionicons name="checkmark-circle" size={18} color="#6366f1" />}
                </TouchableOpacity>
              ))
            )}
          </View>

          <Text className="text-muted text-sm font-bold mb-2">Leave Type</Text>
          <View className="flex-row flex-wrap mb-4">
            {LEAVE_TYPES.map(lt => (
              <TouchableOpacity
                key={lt}
                onPress={() => setLeaveType(lt)}
                className={`mr-2 mb-2 px-3 py-1.5 rounded-full border ${leaveType === lt ? 'bg-primary border-primary' : 'bg-surface border-border'}`}
              >
                <Text className={`text-xs font-bold capitalize ${leaveType === lt ? 'text-white' : 'text-muted'}`}>{lt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Calendar pickers */}
          <CalendarPicker label="From Date" value={fromDate} onChange={setFromDate} />
          <CalendarPicker label="To Date" value={toDate} onChange={setToDate} />

          <Text className="text-muted text-sm font-bold mb-2">Reason</Text>
          <TextInput
            className="bg-surface text-white p-3 rounded-xl border border-border mb-4"
            placeholder="Describe your reason..." placeholderTextColor="#64748b"
            value={reason} onChangeText={setReason} multiline numberOfLines={3} textAlignVertical="top"
          />

          <TouchableOpacity
            onPress={handleSubmit} disabled={submitting}
            className="bg-primary p-4 rounded-xl items-center"
          >
            {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Submit Application</Text>}
          </TouchableOpacity>
        </View>
      )}

      <Text className="text-white text-lg font-bold mb-4">My Leave History</Text>
      {myLeaves.length === 0 ? (
        <Text className="text-muted text-center">No leave applications yet.</Text>
      ) : (
        myLeaves.map((lv, i) => (
          <View key={i} className="bg-card p-4 rounded-2xl border border-border mb-4">
            <View className="flex-row justify-between mb-1">
              <Text className="text-white font-bold capitalize">{lv.leaveType} Leave</Text>
              <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: `${STATUS_COLOR[lv.status]}20` }}>
                <Text className="text-xs font-bold uppercase" style={{ color: STATUS_COLOR[lv.status] }}>{lv.status}</Text>
              </View>
            </View>
            <Text className="text-muted text-xs mb-1">To: {lv.facultyId?.name}</Text>
            <Text className="text-slate-300 text-sm mb-2">{lv.reason}</Text>
            <Text className="text-muted text-xs">
              {new Date(lv.fromDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} →{' '}
              {new Date(lv.toDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </Text>
            {lv.remarks ? <Text className="text-muted text-xs mt-1 italic">Remarks: {lv.remarks}</Text> : null}
          </View>
        ))
      )}
      <View className="h-10" />
    </ScrollView>
  );
}
