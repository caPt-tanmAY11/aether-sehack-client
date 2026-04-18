import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { advisingApi } from '../../api/advising.api';
import { useNavigation } from '@react-navigation/native';

const TABS = ['requests', 'notes', 'followups'];
const TAB_LABELS = { requests: 'Student Requests', notes: 'My Notes', followups: 'Follow-ups' };

const STATUS_COLORS = {
  pending: { bg: 'bg-warning/20', border: 'border-warning/50', text: 'text-warning' },
  acknowledged: { bg: 'bg-primary/20', border: 'border-primary/50', text: 'text-primary' },
  done: { bg: 'bg-success/20', border: 'border-success/50', text: 'text-success' },
  rejected: { bg: 'bg-error/20', border: 'border-error/50', text: 'text-error' },
};

export default function AdvisingScreen() {
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

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="px-4 pt-12 pb-4 bg-card border-b border-border">
        <Text className="text-white text-xl font-bold">Student Advising</Text>
      </View>

      {/* Tab Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="border-b border-border bg-card">
        <View className="flex-row px-2 py-2">
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl mr-2 ${activeTab === tab ? 'bg-primary' : 'bg-surface border border-border'}`}
            >
              <Text className={`text-sm font-bold ${activeTab === tab ? 'text-white' : 'text-muted'}`}>
                {TAB_LABELS[tab]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ScrollView className="flex-1 p-4">
        {loading ? (
          <ActivityIndicator color="#6366f1" size="large" className="mt-10" />
        ) : activeTab === 'requests' ? (
          requests.length === 0 ? (
            <View className="items-center mt-16">
              <Ionicons name="mail-open-outline" size={56} color="#334155" />
              <Text className="text-muted text-lg mt-4">No advising requests yet.</Text>
            </View>
          ) : (
            requests.map((req, i) => {
              const c = STATUS_COLORS[req.status] || STATUS_COLORS.pending;
              return (
                <View key={req._id || i} className="bg-card p-4 rounded-2xl border border-border mb-4">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-white font-bold text-base">{req.studentId?.name}</Text>
                    <View className={`px-2 py-0.5 rounded-full border ${c.bg} ${c.border}`}>
                      <Text className={`text-xs font-bold uppercase ${c.text}`}>{req.status}</Text>
                    </View>
                  </View>
                  <Text className="text-muted text-xs mb-2">
                    {req.studentId?.enrollmentNo} · Div {req.studentId?.division} · Sem {req.studentId?.semester}
                  </Text>
                  <Text className="text-slate-300 text-sm mb-3">{req.message}</Text>
                  {req.facultyReply ? (
                    <View className="bg-primary/10 p-3 rounded-xl border border-primary/30 mb-3">
                      <Text className="text-primary text-xs font-bold mb-1">Your Reply</Text>
                      <Text className="text-slate-300 text-sm">{req.facultyReply}</Text>
                    </View>
                  ) : null}
                  <Text className="text-muted text-xs mb-3">{new Date(req.createdAt).toLocaleDateString()}</Text>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => openReply(req)}
                      className="flex-1 bg-primary/20 border border-primary/50 py-2 rounded-xl items-center"
                    >
                      <Text className="text-primary font-bold text-sm">Respond</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('FacultyChat', { studentId: req.studentId?._id, studentName: req.studentId?.name })}
                      className="flex-1 bg-success/20 border border-success/50 py-2 rounded-xl flex-row items-center justify-center"
                    >
                      <Ionicons name="chatbubble-outline" size={14} color="#22c55e" />
                      <Text className="text-success font-bold text-sm ml-1">Chat</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )
        ) : activeTab === 'notes' ? (
          notes.length === 0 ? (
            <View className="items-center mt-10"><Text className="text-muted text-lg">No advising notes yet.</Text></View>
          ) : (
            notes.map(note => (
              <View key={note._id} className="bg-card p-4 rounded-2xl border border-border mb-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-white text-base font-bold flex-1">{note.studentId?.name || 'Unknown Student'}</Text>
                  <View className="bg-primary/20 px-2 py-1 rounded-md border border-primary/30">
                    <Text className="text-primary text-xs font-bold uppercase">{note.category}</Text>
                  </View>
                </View>
                <Text className="text-muted text-xs mb-3">{new Date(note.createdAt).toLocaleDateString()}</Text>
                <Text className="text-slate-300 mb-2">{note.noteText || note.note}</Text>
              </View>
            ))
          )
        ) : (
          followups.length === 0 ? (
            <View className="items-center mt-10"><Text className="text-muted text-lg">No pending follow-ups.</Text></View>
          ) : (
            followups.map(note => (
              <View key={note._id} className="bg-card p-4 rounded-2xl border border-border mb-4">
                <Text className="text-white text-base font-bold mb-1">{note.studentId?.name}</Text>
                <Text className="text-warning text-sm font-bold mb-3">Due: {new Date(note.followUpDate).toLocaleDateString()}</Text>
                <Text className="text-slate-300 mb-4">{note.noteText || note.note}</Text>
                <TouchableOpacity onPress={() => handleMarkDone(note._id)} className="bg-success/20 border border-success/30 p-3 rounded-xl flex-row justify-center items-center">
                  <Ionicons name="checkmark" size={18} color="#22c55e" />
                  <Text className="text-success font-bold text-sm ml-2">Mark as Done</Text>
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
          <View className="bg-card rounded-t-3xl p-6">
            <Text className="text-white text-xl font-bold mb-1">Respond to Request</Text>
            <Text className="text-muted text-sm mb-4">{selectedReq?.studentId?.name}</Text>

            <Text className="text-muted text-sm font-bold mb-2">Status</Text>
            <View className="flex-row mb-4">
              {['acknowledged', 'done', 'rejected'].map(s => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setReplyStatus(s)}
                  className={`flex-1 mr-2 py-2.5 rounded-xl border items-center ${replyStatus === s ? 'bg-primary border-primary' : 'bg-surface border-border'}`}
                >
                  <Text className={`text-xs font-bold capitalize ${replyStatus === s ? 'text-white' : 'text-muted'}`}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-muted text-sm font-bold mb-2">Your Reply</Text>
            <TextInput
              className="bg-surface text-white p-3 rounded-xl border border-border mb-6"
              placeholder="Write your response..."
              placeholderTextColor="#64748b"
              value={replyText}
              onChangeText={setReplyText}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View className="flex-row gap-3">
              <TouchableOpacity onPress={() => setReplyModal(false)} className="flex-1 p-4 rounded-xl border border-border items-center">
                <Text className="text-muted font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitReply} disabled={replying} className="flex-1 bg-primary p-4 rounded-xl items-center">
                {replying ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Send Reply</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
