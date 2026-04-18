import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { timetableApi } from '../../api/timetable.api';
import { Ionicons } from '@expo/vector-icons';

const STATUS_COLORS = {
  pending:  { bg: 'bg-warning/20',  border: 'border-warning/50',  text: 'text-warning',  icon: 'hourglass-outline' },
  approved: { bg: 'bg-success/20',  border: 'border-success/50',  text: 'text-success',  icon: 'checkmark-circle-outline' },
  rejected: { bg: 'bg-error/20',    border: 'border-error/50',    text: 'text-error',    icon: 'close-circle-outline' },
};

export default function FacultyTimetableStatusScreen({ navigation }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await timetableApi.getMySubmissions();
      setSubmissions(data || []);
    } catch (err) {
      console.error('Failed to fetch timetable submissions', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <View className="flex-1 bg-surface justify-center items-center">
        <ActivityIndicator color="#6366f1" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="px-4 pt-12 pb-4 bg-card border-b border-border flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
        </TouchableOpacity>
        <View>
          <Text className="text-white text-xl font-bold">My Timetable Submissions</Text>
          <Text className="text-muted text-xs">Track HOD review status & remarks</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {submissions.length === 0 ? (
          <View className="items-center mt-16">
            <Ionicons name="calendar-outline" size={56} color="#334155" />
            <Text className="text-muted text-center mt-4">You haven't uploaded any timetables yet.</Text>
          </View>
        ) : (
          submissions.map((tt) => {
            const statusStyle = STATUS_COLORS[tt.status] || STATUS_COLORS.pending;
            return (
              <View key={tt._id} className="bg-card rounded-2xl border border-border mb-4 overflow-hidden">
                {/* Card Header */}
                <View className="p-4 flex-row justify-between items-start">
                  <View className="flex-1 mr-2">
                    <Text className="text-white font-bold text-base">
                      Sem {tt.semester} — Div {tt.division}
                    </Text>
                    <Text className="text-muted text-xs">{tt.academicYear}</Text>
                    <Text className="text-muted text-xs mt-1">
                      Submitted {new Date(tt.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View className={`flex-row items-center px-3 py-1 rounded-full border ${statusStyle.bg} ${statusStyle.border}`}>
                    <Ionicons name={statusStyle.icon} size={14} color="" className="mr-1" />
                    <Text className={`text-xs font-bold capitalize ${statusStyle.text}`}>{tt.status}</Text>
                  </View>
                </View>

                {/* HOD Remark */}
                {tt.hodComment ? (
                  <View className="mx-4 mb-3 p-3 bg-surface rounded-xl border border-border">
                    <Text className="text-muted text-xs font-bold mb-1 uppercase tracking-wider">HOD Remark</Text>
                    <Text className="text-slate-300 text-sm">{tt.hodComment}</Text>
                    {tt.approvedAt && (
                      <Text className="text-muted text-xs mt-1">
                        Approved on {new Date(tt.approvedAt).toLocaleString()}
                      </Text>
                    )}
                  </View>
                ) : tt.status === 'pending' ? (
                  <View className="mx-4 mb-3 px-3 py-2 bg-warning/10 rounded-xl border border-warning/30">
                    <Text className="text-warning text-xs">⏳ Awaiting HOD review</Text>
                  </View>
                ) : null}

                {/* Slot Detail Toggle */}
                <TouchableOpacity
                  onPress={() => toggleExpand(tt._id)}
                  className="flex-row items-center justify-between px-4 py-2 bg-surface/50 border-t border-border"
                >
                  <Text className="text-primary text-sm font-bold">
                    {expanded[tt._id] ? 'Hide Slots' : `View ${tt.slots?.length || 0} Slots`}
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
                            {slot.subjectId?.name || 'Unknown Subject'}
                            {slot.subjectId?.code ? ` (${slot.subjectId.code})` : ''}
                          </Text>
                          <Text className="text-muted text-xs">
                            Room: {slot.roomId?.name || '—'}  •  {slot.slotType === 'lab' ? '🔬 Lab' : '📖 Lecture'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })
        )}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
