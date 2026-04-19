import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { leaveApi } from '../../api/leave.api';
import { handleViewPdf } from '../../utils/pdf';
import { useTheme } from '../../hooks/ThemeContext';

export default function StudentLeavesScreen() {
  const navigation = useNavigation();
  const { theme: T } = useTheme();
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

  const STATUS_COLORS = { pending: T.warning, approved: T.success, rejected: T.error };

  if (loading) return <View style={{ backgroundColor: T.bg }} className="flex-1 justify-center items-center"><ActivityIndicator color={T.accent} /></View>;

  return (
    <ScrollView style={{ backgroundColor: T.bg }} className="flex-1 px-4 pt-6">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={T.text} />
        </TouchableOpacity>
        <Text style={{ color: T.text }} className="text-2xl font-bold">Student Leave Requests</Text>
      </View>

      {leaves.length === 0 ? (
        <Text style={{ color: T.muted }} className="text-center mt-10">No student leave requests.</Text>
      ) : (
        leaves.map((lv, i) => {
          const sColor = STATUS_COLORS[lv.status] || T.warning;
          return (
            <View key={i} style={{ backgroundColor: T.card, borderColor: T.border }} className="p-4 rounded-2xl border mb-4">
              <View className="flex-row justify-between mb-2 items-center">
                <View className="flex-1">
                  <Text style={{ color: T.text }} className="font-bold">{lv.studentId?.name}</Text>
                  <View className="px-2 py-0.5 rounded-full mt-1 self-start" style={{ backgroundColor: `${sColor}20` }}>
                    <Text className="text-xs font-bold uppercase" style={{ color: sColor }}>{lv.status}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => {
                  handleViewPdf(`/leave/student/${lv._id}/pdf`, `Student_Leave_${lv._id}`).catch(err => Alert.alert('Error', err.message));
                }} style={{ backgroundColor: T.bg, borderColor: T.border }} className="p-2 rounded-full border ml-2">
                  <Ionicons name="document-text-outline" size={20} color={T.accent} />
                </TouchableOpacity>
              </View>
              <Text style={{ color: T.muted }} className="text-xs mb-1">{lv.studentId?.enrollmentNo} · Div {lv.studentId?.division} · Sem {lv.studentId?.semester}</Text>
              <Text style={{ color: T.textSub }} className="text-sm mb-2">{lv.reason}</Text>
              <Text style={{ color: T.muted }} className="text-xs">{new Date(lv.fromDate).toLocaleDateString()} → {new Date(lv.toDate).toLocaleDateString()} · {lv.leaveType}</Text>
              {lv.remarks ? <Text style={{ color: T.muted }} className="text-xs mt-1 italic">Your remarks: {lv.remarks}</Text> : null}

              <View className="flex-row gap-3 mt-3">
                {lv.status === 'pending' && (
                  <TouchableOpacity onPress={() => openModal(lv)} style={{ backgroundColor: `${T.accent}20`, borderColor: `${T.accent}50` }} className="flex-1 border py-2 rounded-xl items-center">
                    <Text style={{ color: T.accent }} className="font-bold text-sm">Review</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => navigation.navigate('FacultyChat', { studentId: lv.studentId?._id, studentName: lv.studentId?.name })}
                  style={{ backgroundColor: `${T.success}20`, borderColor: `${T.success}50` }}
                  className="flex-1 border py-2 rounded-xl items-center flex-row justify-center"
                >
                  <Ionicons name="chatbubble-outline" size={14} color={T.success} />
                  <Text style={{ color: T.success }} className="font-bold text-sm ml-1">Chat</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      <View className="h-10" />

      <Modal visible={modal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/60">
          <View style={{ backgroundColor: T.card }} className="rounded-t-3xl p-6">
            <Text style={{ color: T.text }} className="text-xl font-bold mb-1">Review Leave</Text>
            <Text style={{ color: T.muted }} className="text-sm mb-6">{selected?.studentId?.name} — {selected?.reason}</Text>

            <View className="flex-row mb-4">
              <TouchableOpacity onPress={() => setStatus('approved')} style={{ backgroundColor: status === 'approved' ? `${T.success}20` : T.bg, borderColor: status === 'approved' ? T.success : T.border }} className="flex-1 mr-2 py-3 rounded-xl border items-center">
                <Text style={{ color: status === 'approved' ? T.success : T.muted }} className="font-bold">Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setStatus('rejected')} style={{ backgroundColor: status === 'rejected' ? `${T.error}20` : T.bg, borderColor: status === 'rejected' ? T.error : T.border }} className="flex-1 py-3 rounded-xl border items-center">
                <Text style={{ color: status === 'rejected' ? T.error : T.muted }} className="font-bold">Reject</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={{ backgroundColor: T.bg, color: T.text, borderColor: T.border }}
              className="p-3 rounded-xl border mb-6"
              placeholder="Add remarks..." placeholderTextColor={T.muted}
              value={remarks} onChangeText={setRemarks}
            />

            <View className="flex-row gap-3">
              <TouchableOpacity onPress={() => setModal(false)} style={{ borderColor: T.border }} className="flex-1 p-4 rounded-xl border items-center">
                <Text style={{ color: T.textSub }} className="font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitReview} disabled={reviewing} style={{ backgroundColor: T.accent }} className="flex-1 p-4 rounded-xl items-center">
                {reviewing ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">Confirm</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
