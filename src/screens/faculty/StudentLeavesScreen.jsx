import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { leaveApi } from '../../api/leave.api';
import { handleViewPdf } from '../../utils/pdf';

export default function StudentLeavesScreen() {
  const navigation = useNavigation();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('approved');
  const [remarks, setRemarks] = useState('');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => { fetchLeaves(); }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await leaveApi.studentIncoming();
      setLeaves(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openModal = (lv) => {
    setSelected(lv);
    setStatus('approved');
    setRemarks('');
    setModal(true);
  };

  const submitReview = async () => {
    setReviewing(true);
    try {
      await leaveApi.studentReview(selected._id, status, remarks);
      Alert.alert('Done', `Leave ${status}!`);
      setModal(false);
      fetchLeaves();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Review failed');
    } finally { setReviewing(false); }
  };

  const STATUS_COLORS = { pending: '#f59e0b', approved: '#22c55e', rejected: '#ef4444' };

  if (loading) return <View className="flex-1 bg-surface justify-center items-center"><ActivityIndicator color="#6366f1" /></View>;

  return (
    <ScrollView className="flex-1 bg-surface px-4 pt-6">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Student Leave Requests</Text>
      </View>

      {leaves.length === 0 ? (
        <Text className="text-muted text-center mt-10">No student leave requests.</Text>
      ) : (
        leaves.map((lv, i) => (
          <View key={i} className="bg-card p-4 rounded-2xl border border-border mb-4">
            <View className="flex-row justify-between mb-2 items-center">
              <View className="flex-1">
                <Text className="text-white font-bold">{lv.studentId?.name}</Text>
                <View className="px-2 py-0.5 rounded-full mt-1 self-start" style={{ backgroundColor: `${STATUS_COLORS[lv.status]}20` }}>
                  <Text className="text-xs font-bold uppercase" style={{ color: STATUS_COLORS[lv.status] }}>{lv.status}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => {
                handleViewPdf(`/leave/student/${lv._id}/pdf`, `Student_Leave_${lv._id}`).catch(err => Alert.alert('Error', err.message));
              }} className="p-2 bg-surface rounded-full border border-border ml-2">
                <Ionicons name="document-text-outline" size={20} color="#818cf8" />
              </TouchableOpacity>
            </View>
            <Text className="text-muted text-xs mb-1">{lv.studentId?.enrollmentNo} · Div {lv.studentId?.division} · Sem {lv.studentId?.semester}</Text>
            <Text className="text-slate-300 text-sm mb-2">{lv.reason}</Text>
            <Text className="text-muted text-xs">{new Date(lv.fromDate).toLocaleDateString()} → {new Date(lv.toDate).toLocaleDateString()} · {lv.leaveType}</Text>
            {lv.remarks ? <Text className="text-muted text-xs mt-1 italic">Your remarks: {lv.remarks}</Text> : null}

            <View className="flex-row gap-3 mt-3">
              {lv.status === 'pending' && (
                <TouchableOpacity onPress={() => openModal(lv)} className="flex-1 bg-primary/20 border border-primary/50 py-2 rounded-xl items-center">
                  <Text className="text-primary font-bold text-sm">Review</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => navigation.navigate('FacultyChat', { studentId: lv.studentId?._id, studentName: lv.studentId?.name })}
                className="flex-1 bg-success/20 border border-success/50 py-2 rounded-xl items-center flex-row justify-center"
              >
                <Ionicons name="chatbubble-outline" size={14} color="#22c55e" />
                <Text className="text-success font-bold text-sm ml-1">Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <View className="h-10" />

      <Modal visible={modal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-card rounded-t-3xl p-6">
            <Text className="text-white text-xl font-bold mb-1">Review Leave</Text>
            <Text className="text-muted text-sm mb-6">{selected?.studentId?.name} — {selected?.reason}</Text>

            <View className="flex-row mb-4">
              <TouchableOpacity onPress={() => setStatus('approved')} className={`flex-1 mr-2 py-3 rounded-xl border items-center ${status === 'approved' ? 'bg-success/20 border-success' : 'bg-surface border-border'}`}>
                <Text className={status === 'approved' ? 'text-success font-bold' : 'text-muted'}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setStatus('rejected')} className={`flex-1 py-3 rounded-xl border items-center ${status === 'rejected' ? 'bg-error/20 border-error' : 'bg-surface border-border'}`}>
                <Text className={status === 'rejected' ? 'text-error font-bold' : 'text-muted'}>Reject</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              className="bg-surface text-white p-3 rounded-xl border border-border mb-6"
              placeholder="Add remarks..." placeholderTextColor="#64748b"
              value={remarks} onChangeText={setRemarks}
            />

            <View className="flex-row gap-3">
              <TouchableOpacity onPress={() => setModal(false)} className="flex-1 p-4 rounded-xl border border-border items-center">
                <Text className="text-muted font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitReview} disabled={reviewing} className="flex-1 bg-primary p-4 rounded-xl items-center">
                {reviewing ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Confirm</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
