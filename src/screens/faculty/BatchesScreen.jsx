import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { batchesApi } from '../../api/batches.api';

export default function BatchesScreen() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [noticeModal, setNoticeModal] = useState({ visible: false, batchId: null, batchName: '' });
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeBody, setNoticeBody] = useState('');
  const [noticePriority, setNoticePriority] = useState('medium');
  const navigation = useNavigation();

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const data = await batchesApi.getMyBatches();
      setBatches(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotice = async () => {
    if (!noticeTitle.trim() || !noticeBody.trim()) {
      Alert.alert('Validation', 'Title and body are required.');
      return;
    }
    try {
      setLoading(true);
      setNoticeModal(m => ({ ...m, visible: false }));
      await batchesApi.sendBatchNotice(noticeModal.batchId, {
        title: noticeTitle, body: noticeBody, priority: noticePriority
      });
      Alert.alert('Sent', `Notice sent to all students in ${noticeModal.batchName}.`);
      setNoticeTitle('');
      setNoticeBody('');
      setNoticePriority('medium');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to send notice');
    } finally {
      setLoading(false);
    }
  };

  if (loading && batches.length === 0) {
    return (
      <View className="flex-1 bg-surface justify-center items-center">
        <ActivityIndicator color="#6366f1" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <View className="px-4 pt-12 pb-4 bg-card border-b border-border flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 bg-surface rounded-full">
          <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">My Advisory Batches</Text>
      </View>

      <ScrollView className="p-4 flex-1">
        {batches.length === 0 ? (
          <View className="items-center mt-16">
            <Ionicons name="people-outline" size={48} color="#64748b" />
            <Text className="text-muted text-center mt-4 text-lg">No batches assigned yet.</Text>
            <Text className="text-muted text-center text-sm mt-1">Contact your HOD to get batches assigned.</Text>
          </View>
        ) : batches.map(batch => (
          <View key={batch._id} className="bg-card rounded-2xl border border-border mb-4 overflow-hidden">
            <TouchableOpacity
              onPress={() => setExpanded(expanded === batch._id ? null : batch._id)}
              className="p-4 flex-row items-center justify-between"
            >
              <View className="flex-1">
                <Text className="text-white font-bold text-base">{batch.name}</Text>
                <Text className="text-muted text-xs mt-0.5">
                  Sem {batch.semester} • Div {batch.division} • {batch.studentIds?.length || 0} students
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  onPress={() => setNoticeModal({ visible: true, batchId: batch._id, batchName: batch.name })}
                  className="bg-primary/20 border border-primary/30 px-3 py-1.5 rounded-lg mr-2"
                >
                  <Text className="text-primary text-xs font-bold">Send Notice</Text>
                </TouchableOpacity>
                <Ionicons
                  name={expanded === batch._id ? 'chevron-up' : 'chevron-down'}
                  size={18} color="#94a3b8"
                />
              </View>
            </TouchableOpacity>

            {expanded === batch._id && (
              <View className="border-t border-border px-4 pb-4">
                <Text className="text-muted text-xs font-bold mt-3 mb-2 uppercase tracking-wider">
                  Students ({batch.studentIds?.length || 0})
                </Text>
                {batch.studentIds?.length === 0 ? (
                  <Text className="text-muted text-sm">No students in this batch yet.</Text>
                ) : (
                  batch.studentIds.map((student, i) => (
                    <View key={student._id || i} className="flex-row items-center py-2 border-b border-border/50">
                      <View className="w-7 h-7 rounded-full bg-primary/20 items-center justify-center mr-3">
                        <Text className="text-primary text-xs font-bold">
                          {student.name?.[0] || '?'}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-white text-sm font-medium">{student.name}</Text>
                        <Text className="text-muted text-xs">{student.enrollmentNo || student.email}</Text>
                      </View>
                      <Text className="text-muted text-xs">Div {student.division}</Text>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        ))}
        <View className="h-20" />
      </ScrollView>

      {/* Send Notice Modal */}
      <Modal
        visible={noticeModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setNoticeModal(m => ({ ...m, visible: false }))}
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-card w-full p-5 rounded-2xl border border-border">
            <Text className="text-white text-lg font-bold mb-1">Send Notice to Batch</Text>
            <Text className="text-muted text-sm mb-4">{noticeModal.batchName}</Text>

            <Text className="text-muted text-xs font-bold mb-1">Title</Text>
            <TextInput
              className="bg-surface text-white p-3 rounded-xl border border-border mb-3"
              placeholder="Notice title..."
              placeholderTextColor="#64748b"
              value={noticeTitle}
              onChangeText={setNoticeTitle}
            />

            <Text className="text-muted text-xs font-bold mb-1">Body</Text>
            <TextInput
              className="bg-surface text-white p-3 rounded-xl border border-border mb-3 h-20"
              placeholder="Notice details..."
              placeholderTextColor="#64748b"
              value={noticeBody}
              onChangeText={setNoticeBody}
              multiline
              textAlignVertical="top"
            />

            <Text className="text-muted text-xs font-bold mb-1">Priority</Text>
            <View className="flex-row mb-5 gap-2">
              {['low', 'medium', 'high', 'urgent'].map(p => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setNoticePriority(p)}
                  className={`flex-1 py-2 rounded-lg border items-center ${noticePriority === p ? 'bg-primary border-primary' : 'bg-surface border-border'}`}
                >
                  <Text className={`text-xs font-bold capitalize ${noticePriority === p ? 'text-white' : 'text-muted'}`}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setNoticeModal(m => ({ ...m, visible: false }))}
                className="flex-1 bg-surface border border-border py-3 rounded-xl items-center"
              >
                <Text className="text-muted font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSendNotice}
                className="flex-1 bg-primary py-3 rounded-xl items-center ml-2"
              >
                <Text className="text-white font-bold">Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
