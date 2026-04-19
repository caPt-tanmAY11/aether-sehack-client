import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { timetableApi } from '../../api/timetable.api';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/ThemeContext';

export default function FacultyTimetableStatusScreen({ navigation }) {
  const { theme: T } = useTheme();
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
      <View style={{ backgroundColor: T.bg }} className="flex-1 justify-center items-center">
        <ActivityIndicator color={T.accent} size="large" />
      </View>
    );
  }

  const STATUS_COLORS = {
    pending:  { color: T.warning, icon: 'hourglass-outline' },
    approved: { color: T.success, icon: 'checkmark-circle-outline' },
    rejected: { color: T.error,   icon: 'close-circle-outline' },
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      {/* Header */}
      <View style={{ backgroundColor: T.card, borderBottomColor: T.border, borderBottomWidth: 1 }} className="px-4 pt-12 pb-4 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={T.text} />
        </TouchableOpacity>
        <View>
          <Text style={{ color: T.text }} className="text-xl font-bold">My Timetable Submissions</Text>
          <Text style={{ color: T.muted }} className="text-xs">Track HOD review status & remarks</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {submissions.length === 0 ? (
          <View className="items-center mt-16">
            <Ionicons name="calendar-outline" size={56} color={T.muted} />
            <Text style={{ color: T.muted }} className="text-center mt-4">You haven't uploaded any timetables yet.</Text>
          </View>
        ) : (
          submissions.map((tt) => {
            const statusStyle = STATUS_COLORS[tt.status] || STATUS_COLORS.pending;
            return (
              <View key={tt._id} style={{ backgroundColor: T.card, borderColor: T.border }} className="rounded-2xl border mb-4 overflow-hidden">
                {/* Card Header */}
                <View className="p-4 flex-row justify-between items-start">
                  <View className="flex-1 mr-2">
                    <Text style={{ color: T.text }} className="font-bold text-base">
                      Sem {tt.semester} — Div {tt.division}
                    </Text>
                    <Text style={{ color: T.muted }} className="text-xs">{tt.academicYear}</Text>
                    <Text style={{ color: T.muted }} className="text-xs mt-1">
                      Submitted {new Date(tt.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={{ backgroundColor: `${statusStyle.color}20`, borderColor: `${statusStyle.color}50` }} className="flex-row items-center px-3 py-1 rounded-full border">
                    <Ionicons name={statusStyle.icon} size={14} color={statusStyle.color} className="mr-1" />
                    <Text style={{ color: statusStyle.color }} className="text-xs font-bold capitalize">{tt.status}</Text>
                  </View>
                </View>

                {/* HOD Remark */}
                {tt.hodComment ? (
                  <View style={{ backgroundColor: T.bg, borderColor: T.border }} className="mx-4 mb-3 p-3 rounded-xl border">
                    <Text style={{ color: T.muted }} className="text-xs font-bold mb-1 uppercase tracking-wider">HOD Remark</Text>
                    <Text style={{ color: T.textSub }} className="text-sm">{tt.hodComment}</Text>
                    {tt.approvedAt && (
                      <Text style={{ color: T.muted }} className="text-xs mt-1">
                        Approved on {new Date(tt.approvedAt).toLocaleString()}
                      </Text>
                    )}
                  </View>
                ) : tt.status === 'pending' ? (
                  <View style={{ backgroundColor: `${T.warning}10`, borderColor: `${T.warning}30` }} className="mx-4 mb-3 px-3 py-2 rounded-xl border">
                    <Text style={{ color: T.warning }} className="text-xs">⏳ Awaiting HOD review</Text>
                  </View>
                ) : null}

                {/* Slot Detail Toggle */}
                <TouchableOpacity
                  onPress={() => toggleExpand(tt._id)}
                  style={{ backgroundColor: `${T.bg}50`, borderTopColor: T.border, borderTopWidth: 1 }}
                  className="flex-row items-center justify-between px-4 py-2"
                >
                  <Text style={{ color: T.accent }} className="text-sm font-bold">
                    {expanded[tt._id] ? 'Hide Slots' : `View ${tt.slots?.length || 0} Slots`}
                  </Text>
                  <Ionicons name={expanded[tt._id] ? 'chevron-up' : 'chevron-down'} size={18} color={T.accent} />
                </TouchableOpacity>

                {expanded[tt._id] && (
                  <View style={{ borderTopColor: T.border, borderTopWidth: 1 }} className="px-4 py-2">
                    {(tt.slots || []).map((slot, idx) => (
                      <View key={idx} style={{ borderBottomColor: `${T.border}50` }} className="flex-row items-start py-2 border-b">
                        <View className="w-28 mr-3">
                          <Text style={{ color: T.text }} className="text-xs font-bold">{slot.day}</Text>
                          <Text style={{ color: T.muted }} className="text-xs">{slot.startTime} – {slot.endTime}</Text>
                        </View>
                        <View className="flex-1">
                          <Text style={{ color: T.textSub }} className="text-xs font-semibold">
                            {slot.subjectId?.name || 'Unknown Subject'}
                            {slot.subjectId?.code ? ` (${slot.subjectId.code})` : ''}
                          </Text>
                          <Text style={{ color: T.muted }} className="text-xs">
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
