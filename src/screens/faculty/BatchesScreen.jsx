import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { batchesApi } from '../../api/batches.api';
import { useTheme } from '../../hooks/ThemeContext';

export default function BatchesScreen() {
  const { theme: T } = useTheme();
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
      <View style={{ backgroundColor: T.bg }} className="flex-1 justify-center items-center">
        <ActivityIndicator color={T.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <View style={{ backgroundColor: T.card, borderBottomColor: T.border, borderBottomWidth: 1 }} className="px-4 pt-12 pb-4 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ backgroundColor: T.bg }} className="mr-4 p-2 rounded-full">
          <Ionicons name="arrow-back" size={24} color={T.text} />
        </TouchableOpacity>
        <Text style={{ color: T.text }} className="text-xl font-bold">My Advisory Batches</Text>
      </View>

      <ScrollView className="p-4 flex-1">
        {batches.length === 0 ? (
          <View className="items-center mt-16">
            <Ionicons name="people-outline" size={48} color={T.muted} />
            <Text style={{ color: T.muted }} className="text-center mt-4 text-lg">No batches assigned yet.</Text>
            <Text style={{ color: T.muted }} className="text-center text-sm mt-1">Contact your HOD to get batches assigned.</Text>
          </View>
        ) : batches.map(batch => (
          <View key={batch._id} style={{ backgroundColor: T.card, borderColor: T.border }} className="rounded-2xl border mb-4 overflow-hidden">
            <TouchableOpacity
              onPress={() => setExpanded(expanded === batch._id ? null : batch._id)}
              className="p-4 flex-row items-center justify-between"
            >
              <View className="flex-1">
                <Text style={{ color: T.text }} className="font-bold text-base">{batch.name}</Text>
                <Text style={{ color: T.muted }} className="text-xs mt-0.5">
                  Sem {batch.semester} • Div {batch.division} • {batch.studentIds?.length || 0} students
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  onPress={() => setNoticeModal({ visible: true, batchId: batch._id, batchName: batch.name })}
                  style={{ backgroundColor: `${T.accent}20`, borderColor: `${T.accent}50` }}
                  className="px-3 py-1.5 rounded-lg mr-2 border"
                >
                  <Text style={{ color: T.accent }} className="text-xs font-bold">Send Notice</Text>
                </TouchableOpacity>
                <Ionicons
                  name={expanded === batch._id ? 'chevron-up' : 'chevron-down'}
                  size={18} color={T.muted}
                />
              </View>
            </TouchableOpacity>

            {expanded === batch._id && (
              <View style={{ borderTopColor: T.border, borderTopWidth: 1 }} className="px-4 pb-4">
                <Text style={{ color: T.muted }} className="text-xs font-bold mt-3 mb-2 uppercase tracking-wider">
                  Students ({batch.studentIds?.length || 0})
                </Text>
                {batch.studentIds?.length === 0 ? (
                  <Text style={{ color: T.muted }} className="text-sm">No students in this batch yet.</Text>
                ) : (
                  batch.studentIds.map((student, i) => (
                    <View key={student._id || i} style={{ borderBottomColor: `${T.border}80` }} className="flex-row items-center py-2 border-b">
                      <View style={{ backgroundColor: `${T.accent}20` }} className="w-7 h-7 rounded-full items-center justify-center mr-3">
                        <Text style={{ color: T.accent }} className="text-xs font-bold">
                          {student.name?.[0] || '?'}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text style={{ color: T.text }} className="text-sm font-medium">{student.name}</Text>
                        <Text style={{ color: T.muted }} className="text-xs">{student.enrollmentNo || student.email}</Text>
                      </View>
                      <Text style={{ color: T.muted }} className="text-xs">Div {student.division}</Text>
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
          <View style={{ backgroundColor: T.card, borderColor: T.border }} className="w-full p-5 rounded-2xl border">
            <Text style={{ color: T.text }} className="text-lg font-bold mb-1">Send Notice to Batch</Text>
            <Text style={{ color: T.muted }} className="text-sm mb-4">{noticeModal.batchName}</Text>

            <Text style={{ color: T.muted }} className="text-xs font-bold mb-1">Title</Text>
            <TextInput
              style={{ backgroundColor: T.bg, color: T.text, borderColor: T.border }}
              className="p-3 rounded-xl border mb-3"
              placeholder="Notice title..."
              placeholderTextColor={T.muted}
              value={noticeTitle}
              onChangeText={setNoticeTitle}
            />

            <Text style={{ color: T.muted }} className="text-xs font-bold mb-1">Body</Text>
            <TextInput
              style={{ backgroundColor: T.bg, color: T.text, borderColor: T.border }}
              className="p-3 rounded-xl border mb-3 h-20"
              placeholder="Notice details..."
              placeholderTextColor={T.muted}
              value={noticeBody}
              onChangeText={setNoticeBody}
              multiline
              textAlignVertical="top"
            />

            <Text style={{ color: T.muted }} className="text-xs font-bold mb-1">Priority</Text>
            <View className="flex-row mb-5 gap-2">
              {['low', 'medium', 'high', 'urgent'].map(p => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setNoticePriority(p)}
                  style={{ backgroundColor: noticePriority === p ? T.accent : T.bg, borderColor: noticePriority === p ? T.accent : T.border }}
                  className="flex-1 py-2 rounded-lg border items-center"
                >
                  <Text style={{ color: noticePriority === p ? '#ffffff' : T.muted }} className="text-xs font-bold capitalize">{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setNoticeModal(m => ({ ...m, visible: false }))}
                style={{ backgroundColor: T.bg, borderColor: T.border }}
                className="flex-1 border py-3 rounded-xl items-center"
              >
                <Text style={{ color: T.muted }} className="font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSendNotice}
                style={{ backgroundColor: T.accent }}
                className="flex-1 py-3 rounded-xl items-center ml-2"
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
