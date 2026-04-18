import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput } from 'react-native';
import { timetableApi } from '../../api/timetable.api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function TimetableReviewScreen() {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({});       // { [timetableId]: string }
  const [expanded, setExpanded] = useState({});        // { [timetableId]: boolean }
  const navigation = useNavigation();

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const data = await timetableApi.getPending();
      setTimetables(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch pending timetables');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    const comment = comments[id]?.trim() || '';
    if (status === 'rejected' && !comment) {
      Alert.alert('Comment Required', 'Please provide a remark before rejecting a timetable.');
      return;
    }
    try {
      setLoading(true);
      await timetableApi.review(id, status, comment || `HOD ${status}`);
      Alert.alert('Done', `Timetable ${status}. Faculty has been notified.`);
      fetchPending();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to review timetable');
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading && timetables.length === 0) {
    return <View className="flex-1 bg-surface justify-center items-center"><ActivityIndicator color="#6366f1" size="large" /></View>;
  }

  return (
    <ScrollView className="flex-1 bg-surface px-4 py-6">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Timetable Review</Text>
      </View>

      {timetables.length === 0 ? (
        <View className="items-center mt-16">
          <Ionicons name="checkmark-circle-outline" size={56} color="#334155" />
          <Text className="text-muted text-center mt-4 text-base">No pending timetables requiring your review.</Text>
        </View>
      ) : (
        timetables.map((tt) => (
          <View key={tt._id} className="bg-card rounded-2xl border border-border mb-5 overflow-hidden">
            {/* Header */}
            <View className="p-4">
              <View className="flex-row justify-between items-start mb-1">
                <View className="flex-1 mr-2">
                  <Text className="text-white font-bold text-lg">Sem {tt.semester} — Div {tt.division}</Text>
                  <Text className="text-muted text-xs">{tt.academicYear} • Uploaded by {tt.uploadedBy?.name || 'Faculty'}</Text>
                </View>
                <View className="bg-warning/20 px-2 py-1 rounded-md border border-warning/50">
                  <Text className="text-warning text-xs font-bold capitalize">{tt.status}</Text>
                </View>
              </View>

              <View className="flex-row items-center mt-2">
                <Ionicons name="grid-outline" size={16} color="#6366f1" />
                <Text className="text-slate-400 text-xs ml-2">{tt.slots?.length || 0} slots configured</Text>
              </View>
            </View>

            {/* Slot detail toggle */}
            <TouchableOpacity
              onPress={() => toggleExpand(tt._id)}
              className="flex-row items-center justify-between px-4 py-2 bg-surface/60 border-t border-border"
            >
              <Text className="text-primary text-sm font-bold">
                {expanded[tt._id] ? 'Hide Slots' : 'View Slot Details'}
              </Text>
              <Ionicons name={expanded[tt._id] ? 'chevron-up' : 'chevron-down'} size={18} color="#6366f1" />
            </TouchableOpacity>

            {expanded[tt._id] && (
              <View className="px-4 py-2 border-t border-border">
                {(tt.slots || []).map((slot, idx) => (
                  <View key={idx} className="flex-row items-start py-2 border-b border-border/50">
                    <View className="w-28 mr-3">
                      <Text className="text-white text-xs font-bold">{slot.day}</Text>
                      <Text className="text-muted text-xs">{slot.startTime} – {slot.endTime}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-slate-300 text-xs font-semibold">
                        {slot.subjectId?.name || 'Unknown Subject'} ({slot.subjectId?.code || '—'})
                      </Text>
                      <Text className="text-muted text-xs">
                        Room: {slot.roomId?.name || '—'}  •  {slot.slotType === 'lab' ? '🔬 Lab' : '📖 Lecture'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* HOD comment */}
            <View className="px-4 pt-3 pb-2 border-t border-border">
              <Text className="text-muted text-xs font-bold mb-1 uppercase tracking-wider">Your Remark / Suggestion</Text>
              <TextInput
                className="bg-surface text-white text-sm p-3 rounded-xl border border-border"
                placeholder="Add a remark for the faculty (required for rejection)..."
                placeholderTextColor="#64748b"
                value={comments[tt._id] || ''}
                onChangeText={(text) => setComments(prev => ({ ...prev, [tt._id]: text }))}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Action buttons */}
            <View className="flex-row px-4 pb-4 pt-2">
              <TouchableOpacity
                onPress={() => handleReview(tt._id, 'rejected')}
                className="flex-1 bg-surface border border-error/50 p-3 rounded-xl mr-2 items-center"
              >
                <Text className="text-error font-bold">Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleReview(tt._id, 'approved')}
                className="flex-1 bg-primary p-3 rounded-xl ml-2 items-center"
              >
                <Text className="text-white font-bold">Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
      <View className="h-20" />
    </ScrollView>
  );
}
