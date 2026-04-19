import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { advisingApi } from '../../api/advising.api';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/ThemeContext';

const TABS = ['requests', 'notes', 'followups'];
const TAB_LABELS = { requests: 'Student Requests', notes: 'My Notes', followups: 'Follow-ups' };

export default function AdvisingScreen() {
  const { theme: T } = useTheme();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [notes, setNotes] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reply modal
  const [replyModal, setReplyModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [replyStatus, setReplyStatus] = useState('acknowledged');
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  // Batch note modal
  const [batchModal, setBatchModal] = useState(false);
  const [batchDiv, setBatchDiv] = useState('A');
  const [batchNoteText, setBatchNoteText] = useState('');
  const [sendingBatch, setSendingBatch] = useState(false);

  const STATUS_COLORS = {
    pending: { color: T.warning },
    acknowledged: { color: T.accent },
    done: { color: T.success },
    rejected: { color: T.error },
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'requests') {
        const data = await advisingApi.getIncomingRequests().catch(() => []);
        setRequests(data || []);
      } else if (activeTab === 'notes') {
        const data = await advisingApi.getMyNotes().catch(() => []);
        setNotes(data || []);
      } else {
        const data = await advisingApi.getFollowUps().catch(() => []);
        setFollowups(data || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openReply = (req) => {
    setSelectedReq(req);
    setReplyStatus('acknowledged');
    setReplyText('');
    setReplyModal(true);
  };

  const submitReply = async () => {
    setReplying(true);
    try {
      await advisingApi.updateRequest(selectedReq._id, { status: replyStatus, facultyReply: replyText });
      Alert.alert('Done', 'Response sent to student!');
      setReplyModal(false);
      fetchData();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to respond');
    } finally { setReplying(false); }
  };

  const handleMarkDone = async (id) => {
    try {
      await advisingApi.markFollowUpDone(id);
      Alert.alert('Success', 'Follow-up marked as done');
      fetchData();
    } catch (err) {
      Alert.alert('Error', 'Failed to update');
    }
  };

  const handleBatchSubmit = async () => {
    if (!batchNoteText.trim()) return Alert.alert('Validation', 'Note text is required');
    setSendingBatch(true);
    try {
      await advisingApi.createBatchNote({
        division: batchDiv,
        noteText: batchNoteText,
        category: 'academic',
        sharedWithStudent: true
      });
      Alert.alert('Success', `Note sent to Division ${batchDiv}`);
      setBatchModal(false);
      setBatchNoteText('');
      fetchData();
    } catch (err) {
      Alert.alert('Error', 'Failed to send batch note');
    } finally {
      setSendingBatch(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      {/* Header */}
      <View style={{ backgroundColor: T.card, borderBottomColor: T.border, borderBottomWidth: 1 }} className="px-4 pt-12 pb-4 flex-row justify-between items-center">
        <Text style={{ color: T.text }} className="text-xl font-bold">Student Advising</Text>
        {activeTab === 'notes' && (
          <TouchableOpacity onPress={() => setBatchModal(true)} style={{ backgroundColor: T.accent }} className="px-3 py-1.5 rounded-full">
            <Text className="text-white text-xs font-bold">+ Batch Note</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tab Bar */}
      <View style={{ backgroundColor: T.card, borderBottomColor: T.border, borderBottomWidth: 1, flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8 }}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{ backgroundColor: activeTab === tab ? T.accent : T.bg, borderColor: activeTab === tab ? T.accent : T.border, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8 }}
          >
            <Text style={{ color: activeTab === tab ? '#ffffff' : T.muted, fontSize: 12, fontWeight: 'bold' }}>
              {TAB_LABELS[tab]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1 p-4">
        {loading ? (
          <ActivityIndicator color={T.accent} size="large" className="mt-10" />
        ) : activeTab === 'requests' ? (
          requests.length === 0 ? (
            <View className="items-center mt-16">
              <Ionicons name="mail-open-outline" size={56} color={T.muted} />
              <Text style={{ color: T.muted }} className="text-lg mt-4">No advising requests yet.</Text>
            </View>
          ) : (
            requests.map((req, i) => {
              const c = STATUS_COLORS[req.status] || STATUS_COLORS.pending;
              return (
                <View key={req._id || i} style={{ backgroundColor: T.bg, borderColor: `${T.border}80` }} className="p-4 rounded-2xl border mb-4 opacity-90">
                  <View className="flex-row justify-between mb-2">
                    <Text style={{ color: T.textSub }} className="font-bold text-base">{req.studentId?.name}</Text>
                    <View style={{ backgroundColor: `${c.color}15`, borderColor: `${c.color}40` }} className="px-2 py-0.5 rounded-full border">
                      <Text style={{ color: c.color }} className="text-xs font-bold uppercase">{req.status}</Text>
                    </View>
                  </View>
                  <Text style={{ color: `${T.muted}80` }} className="text-xs mb-2">
                    {req.studentId?.enrollmentNo} · Div {req.studentId?.division} · Sem {req.studentId?.semester}
                  </Text>
                  <Text style={{ color: T.muted }} className="text-sm mb-3">{req.message}</Text>
                  {req.facultyReply ? (
                    <View style={{ backgroundColor: `${T.accent}05`, borderColor: `${T.accent}20` }} className="p-3 rounded-xl border mb-3">
                      <Text style={{ color: T.accent }} className="text-xs font-bold mb-1">Your Reply</Text>
                      <Text style={{ color: T.muted }} className="text-sm">{req.facultyReply}</Text>
                    </View>
                  ) : null}
                  <Text style={{ color: `${T.muted}80` }} className="text-xs mb-3">{new Date(req.createdAt).toLocaleDateString()}</Text>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => openReply(req)}
                      style={{ backgroundColor: `${T.accent}15`, borderColor: `${T.accent}30` }}
                      className="flex-1 border py-2 rounded-xl items-center"
                    >
                      <Text style={{ color: T.accent }} className="font-bold text-sm">Respond</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('FacultyChat', { studentId: req.studentId?._id, studentName: req.studentId?.name })}
                      style={{ backgroundColor: `${T.success}10`, borderColor: `${T.success}30` }}
                      className="flex-1 border py-2 rounded-xl flex-row items-center justify-center"
                    >
                      <Ionicons name="chatbubble-outline" size={14} color={T.success} />
                      <Text style={{ color: T.success }} className="font-bold text-sm ml-1">Chat</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )
        ) : activeTab === 'notes' ? (
          notes.length === 0 ? (
            <View className="items-center mt-10"><Text style={{ color: T.muted }} className="text-lg">No advising notes yet.</Text></View>
          ) : (
            notes.map(note => (
              <View key={note._id} style={{ backgroundColor: T.bg, borderColor: `${T.border}80` }} className="p-4 rounded-2xl border mb-4 opacity-90">
                <View className="flex-row justify-between mb-2">
                  <Text style={{ color: T.textSub }} className="text-base font-bold flex-1">{note.studentId?.name || 'Unknown Student'}</Text>
                  <View style={{ backgroundColor: `${T.accent}15`, borderColor: `${T.accent}30` }} className="px-2 py-1 rounded-md border">
                    <Text style={{ color: T.accent }} className="text-xs font-bold uppercase">{note.category}</Text>
                  </View>
                </View>
                <Text style={{ color: `${T.muted}80` }} className="text-xs mb-3">{new Date(note.createdAt).toLocaleDateString()}</Text>
                <Text style={{ color: T.muted }} className="mb-2">{note.noteText || note.note}</Text>
              </View>
            ))
          )
        ) : (
          followups.length === 0 ? (
            <View className="items-center mt-10"><Text style={{ color: T.muted }} className="text-lg">No pending follow-ups.</Text></View>
          ) : (
            followups.map(note => (
              <View key={note._id} style={{ backgroundColor: T.bg, borderColor: `${T.border}80` }} className="p-4 rounded-2xl border mb-4 opacity-90">
                <Text style={{ color: T.textSub }} className="text-base font-bold mb-1">{note.studentId?.name}</Text>
                <Text style={{ color: `${T.warning}90` }} className="text-sm font-bold mb-3">Due: {new Date(note.followUpDate).toLocaleDateString()}</Text>
                <Text style={{ color: T.muted }} className="mb-4">{note.noteText || note.note}</Text>
                <TouchableOpacity onPress={() => handleMarkDone(note._id)} style={{ backgroundColor: `${T.success}15`, borderColor: `${T.success}30` }} className="border p-3 rounded-xl flex-row justify-center items-center">
                  <Ionicons name="checkmark" size={18} color={T.success} />
                  <Text style={{ color: T.success }} className="font-bold text-sm ml-2">Mark as Done</Text>
                </TouchableOpacity>
              </View>
            ))
          )
        )}
        <View className="h-20" />
      </ScrollView>

      {/* Reply Modal */}
      <Modal visible={replyModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/60">
          <View style={{ backgroundColor: T.card }} className="rounded-t-3xl p-6">
            <Text style={{ color: T.text }} className="text-xl font-bold mb-1">Respond to Request</Text>
            <Text style={{ color: T.muted }} className="text-sm mb-4">{selectedReq?.studentId?.name}</Text>

            <Text style={{ color: T.muted }} className="text-sm font-bold mb-2">Status</Text>
            <View className="flex-row mb-4">
              {['acknowledged', 'done', 'rejected'].map(s => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setReplyStatus(s)}
                  style={{ backgroundColor: replyStatus === s ? T.accent : T.bg, borderColor: replyStatus === s ? T.accent : T.border }}
                  className="flex-1 mr-2 py-2.5 rounded-xl border items-center"
                >
                  <Text style={{ color: replyStatus === s ? '#ffffff' : T.muted }} className="text-xs font-bold capitalize">{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ color: T.muted }} className="text-sm font-bold mb-2">Your Reply</Text>
            <TextInput
              style={{ backgroundColor: T.bg, color: T.text, borderColor: T.border }}
              className="p-3 rounded-xl border mb-6"
              placeholder="Write your response..."
              placeholderTextColor={T.muted}
              value={replyText}
              onChangeText={setReplyText}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View className="flex-row gap-3">
              <TouchableOpacity onPress={() => setReplyModal(false)} style={{ borderColor: T.border }} className="flex-1 p-4 rounded-xl border items-center">
                <Text style={{ color: T.muted }} className="font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitReply} disabled={replying} style={{ backgroundColor: T.accent }} className="flex-1 p-4 rounded-xl items-center">
                {replying ? <ActivityIndicator color="#ffffff" /> : <Text className="text-white font-bold">Send Reply</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Batch Note Modal */}
      <Modal visible={batchModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/60">
          <View style={{ backgroundColor: T.card }} className="rounded-t-3xl p-6">
            <Text style={{ color: T.text }} className="text-xl font-bold mb-1">Send Note to Batch</Text>
            <Text style={{ color: T.muted }} className="text-sm mb-4">Send a note to all students in a division</Text>

            <Text style={{ color: T.muted }} className="text-sm font-bold mb-2">Select Division</Text>
            <View className="flex-row mb-4">
              {['A', 'B', 'C'].map(d => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setBatchDiv(d)}
                  style={{ backgroundColor: batchDiv === d ? T.accent : T.bg, borderColor: batchDiv === d ? T.accent : T.border }}
                  className="flex-1 mr-2 py-2.5 rounded-xl border items-center"
                >
                  <Text style={{ color: batchDiv === d ? '#ffffff' : T.muted }} className="text-xs font-bold capitalize">Div {d}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ color: T.muted }} className="text-sm font-bold mb-2">Note Details</Text>
            <TextInput
              style={{ backgroundColor: T.bg, color: T.text, borderColor: T.border }}
              className="p-3 rounded-xl border mb-6"
              placeholder="E.g. Remember to bring your journals..."
              placeholderTextColor={T.muted}
              value={batchNoteText}
              onChangeText={setBatchNoteText}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View className="flex-row gap-3">
              <TouchableOpacity onPress={() => setBatchModal(false)} style={{ borderColor: T.border }} className="flex-1 p-4 rounded-xl border items-center">
                <Text style={{ color: T.muted }} className="font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleBatchSubmit} disabled={sendingBatch} style={{ backgroundColor: T.accent }} className="flex-1 p-4 rounded-xl items-center">
                {sendingBatch ? <ActivityIndicator color="#ffffff" /> : <Text className="text-white font-bold">Send to Div {batchDiv}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
