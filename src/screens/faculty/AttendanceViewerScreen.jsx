import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../api/client';
import { timetableApi } from '../../api/timetable.api';
import { useNavigation } from '@react-navigation/native';
import CalendarPicker from '../../components/CalendarPicker';
import { useTheme } from '../../hooks/ThemeContext';

const STATUS_OPTIONS = ['present', 'absent', 'late'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AttendanceViewerScreen() {
  const navigation = useNavigation();
  const { theme: T } = useTheme();
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);

  // Override modal state
  const [overrideModal, setOverrideModal] = useState(false);
  const [overrideRecord, setOverrideRecord] = useState(null); // { studentId, name, status }
  const [overrideStatus, setOverrideStatus] = useState('present');
  const [overrideRemarks, setOverrideRemarks] = useState('');
  const [overriding, setOverriding] = useState(false);

  // Date selection state
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  });

  const getDayName = (dateStr) => {
    const d = new Date(dateStr);
    return DAYS[d.getDay()];
  };

  useEffect(() => {
    fetchTimetables();
  }, []);

  const fetchTimetables = async () => {
    try {
      setLoading(true);
      const data = await timetableApi.getMyTimetable();
      setTimetables(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load timetables');
    } finally {
      setLoading(false);
    }
  };

  const isSameSlot = (slot, timetableId) =>
    selectedSlot?.startTime === slot.startTime &&
    selectedSlot?.day === slot.day &&
    selectedSlot?.timetableId === timetableId;

  const loadSession = async (timetableId, slot) => {
    if (isSameSlot(slot, timetableId)) {
      setSelectedSlot(null); setSessionData(null); return;
    }
    setSelectedSlot({ ...slot, timetableId });
    setSessionLoading(true);
    setSessionData(null);
    try {
      const targetDate = selectedDate;
      const res = await apiClient.get('/attendance/session', {
        params: { timetableId, day: slot.day, startTime: slot.startTime, date: targetDate }
      });
      setSessionData({ ...res.data.data, timetableId, day: slot.day, startTime: slot.startTime, date: targetDate });
    } catch (err) {
      Alert.alert('Error', 'Failed to load session attendance');
    } finally {
      setSessionLoading(false);
    }
  };

  const openOverride = (record) => {
    setOverrideRecord(record);
    setOverrideStatus(record.status);
    setOverrideRemarks(record.remarks || '');
    setOverrideModal(true);
  };

  const submitOverride = async () => {
    if (!sessionData || !overrideRecord) return;
    setOverriding(true);
    try {
      await apiClient.patch('/attendance/override', {
        timetableId: sessionData.timetableId,
        day: sessionData.day,
        startTime: sessionData.startTime,
        date: sessionData.date,
        updates: [{
          studentId: overrideRecord.studentId?.enrollmentNo,
          status: overrideStatus,
          remarks: overrideRemarks,
        }]
      });
      Alert.alert('Success', 'Attendance overridden!');
      setOverrideModal(false);
      // Refresh session
      await loadSession(sessionData.timetableId, selectedSlot);
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Override failed');
    } finally {
      setOverriding(false);
    }
  };

  if (loading) {
    return <View style={{ backgroundColor: T.bg }} className="flex-1 justify-center items-center"><ActivityIndicator color={T.accent} size="large" /></View>;
  }

  const groupedSlots = {};
  DAYS.forEach(d => groupedSlots[d] = []);
  timetables.forEach(tt => {
    tt.slots?.forEach(slot => {
      groupedSlots[slot.day]?.push({ ...slot, timetableId: tt._id, division: tt.division });
    });
  });
  DAYS.forEach(d => {
    groupedSlots[d].sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      {/* Sticky header */}
      <View style={{ backgroundColor: T.card, borderBottomColor: T.border, borderBottomWidth: 1 }} className="px-4 pt-12 pb-4 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={T.text} />
        </TouchableOpacity>
        <Text style={{ color: T.text }} className="text-xl font-bold">View Attendance</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <View className="mb-4">
          <CalendarPicker label="Select Date" value={selectedDate} onChange={setSelectedDate} />
        </View>

      {(() => {
        const dayName = getDayName(selectedDate);
        const daySlots = groupedSlots[dayName] || [];

        if (daySlots.length === 0) {
          return (
            <View style={{ backgroundColor: T.card, borderColor: T.border }} className="items-center py-8 border rounded-2xl">
              <Ionicons name="calendar-clear-outline" size={40} color={T.muted} />
              <Text style={{ color: T.muted }} className="mt-2">No classes scheduled for this date ({dayName}).</Text>
            </View>
          );
        }

        return (
          <View className="mb-6">
            <Text style={{ color: T.muted }} className="text-sm font-bold uppercase tracking-wider mb-2">{dayName} Classes</Text>
            {daySlots.map((slot, index) => (
              <View key={index}>
                <TouchableOpacity
                  onPress={() => loadSession(slot.timetableId, slot)}
                  style={{ backgroundColor: T.card, borderColor: T.border }}
                  className="p-4 rounded-2xl border mb-2 flex-row justify-between items-center"
                >
                  <View>
                    <Text style={{ color: T.text }} className="text-base font-bold">{slot.subjectId?.name} (Div {slot.division})</Text>
                    <Text style={{ color: T.muted }} className="text-sm">{slot.startTime} - {slot.endTime}</Text>
                  </View>
                  <Ionicons
                    name={isSameSlot(slot, slot.timetableId) ? 'chevron-up' : 'chevron-down'}
                    size={22} color={T.muted}
                  />
                </TouchableOpacity>

                {isSameSlot(slot, slot.timetableId) && (
                  <View style={{ backgroundColor: T.bg, borderColor: T.border }} className="border rounded-2xl p-4 mb-4">
                    {sessionLoading ? (
                      <ActivityIndicator color={T.accent} />
                    ) : sessionData?.records?.length > 0 ? (
                      sessionData.records.map((rec, i) => (
                        <View key={i} style={{ borderBottomColor: T.border }} className="flex-row justify-between items-center py-2.5 border-b">
                          <View className="flex-1">
                            <Text style={{ color: T.text }} className="font-bold">{rec.studentId?.name}</Text>
                            <Text style={{ color: T.muted }} className="text-xs">{rec.studentId?.enrollmentNo}</Text>
                            {rec.remarks ? <Text style={{ color: T.muted }} className="text-xs italic mt-0.5">"{rec.remarks}"</Text> : null}
                          </View>
                          <View className="flex-row items-center gap-2">
                            <View style={{ backgroundColor: `${rec.status === 'present' ? T.success : rec.status === 'late' ? T.warning : T.error}20` }} className="px-2 py-1 rounded-full">
                              <Text style={{ color: rec.status === 'present' ? T.success : rec.status === 'late' ? T.warning : T.error }} className="text-xs font-bold uppercase">{rec.status}</Text>
                            </View>
                            <TouchableOpacity
                              onPress={() => openOverride(rec)}
                              style={{ backgroundColor: `${T.accent}20` }}
                              className="p-1.5 rounded-lg"
                            >
                              <Ionicons name="create-outline" size={16} color={T.accent} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => navigation.navigate('FacultyChat', { studentId: rec.studentId?._id, studentName: rec.studentId?.name })}
                              style={{ backgroundColor: `${T.success}20` }}
                              className="p-1.5 rounded-lg"
                            >
                              <Ionicons name="chatbubble-outline" size={16} color={T.success} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))
                    ) : (
                      <Text style={{ color: T.muted }} className="text-center py-4">No attendance marked yet for this session.</Text>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        );
      })()}

      <View className="h-20" />

      {/* Override Modal */}
      <Modal visible={overrideModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/60">
          <View style={{ backgroundColor: T.card }} className="rounded-t-3xl p-6">
            <Text style={{ color: T.text }} className="text-xl font-bold mb-1">Override Attendance</Text>
            <Text style={{ color: T.muted }} className="text-sm mb-6">{overrideRecord?.studentId?.name}</Text>

            <Text style={{ color: T.muted }} className="text-sm font-bold mb-2">Status</Text>
            <View className="flex-row mb-4">
              {STATUS_OPTIONS.map(s => {
                const sColor = s === 'present' ? T.success : s === 'late' ? T.warning : T.error;
                return (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setOverrideStatus(s)}
                    style={{ backgroundColor: overrideStatus === s ? `${sColor}20` : T.bg, borderColor: overrideStatus === s ? sColor : T.border }}
                    className="flex-1 mr-2 py-3 rounded-xl border items-center"
                  >
                    <Text style={{ color: overrideStatus === s ? sColor : T.muted }} className="font-bold text-xs uppercase">{s}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={{ color: T.muted }} className="text-sm font-bold mb-2">Remarks (optional)</Text>
            <TextInput
              style={{ backgroundColor: T.bg, color: T.text, borderColor: T.border }}
              className="p-3 rounded-xl border mb-6"
              placeholder="Add a remark..."
              placeholderTextColor={T.muted}
              value={overrideRemarks}
              onChangeText={setOverrideRemarks}
            />

            <View className="flex-row gap-3">
              <TouchableOpacity onPress={() => setOverrideModal(false)} style={{ borderColor: T.border }} className="flex-1 p-4 rounded-xl border items-center">
                <Text style={{ color: T.muted }} className="font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitOverride} disabled={overriding} style={{ backgroundColor: T.accent }} className="flex-1 p-4 rounded-xl items-center">
                {overriding ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">Save Override</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </ScrollView>
    </View>
  );
}
