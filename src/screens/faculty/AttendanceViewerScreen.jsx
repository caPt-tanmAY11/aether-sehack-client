import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../api/client';
import { timetableApi } from '../../api/timetable.api';
import { useNavigation } from '@react-navigation/native';
import CalendarPicker from '../../components/CalendarPicker';

const STATUS_OPTIONS = ['present', 'absent', 'late'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AttendanceViewerScreen() {
  const navigation = useNavigation();
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

  const loadSession = async (timetableId, slot) => {
    if (selectedSlot?.startTime === slot.startTime && selectedSlot?.day === slot.day) {
      setSelectedSlot(null); setSessionData(null); return;
    }
    setSelectedSlot(slot);
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
    return <View className="flex-1 bg-surface justify-center items-center"><ActivityIndicator color="#6366f1" size="large" /></View>;
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
    <ScrollView className="flex-1 bg-surface px-4 py-6">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Weekly Attendance</Text>
      </View>

      <View className="mb-4">
        <CalendarPicker label="Select Date" value={selectedDate} onChange={setSelectedDate} />
      </View>

      {(() => {
        const dayName = getDayName(selectedDate);
        const daySlots = groupedSlots[dayName] || [];

        if (daySlots.length === 0) {
          return (
            <View className="items-center py-8 bg-card border border-border rounded-2xl">
              <Ionicons name="calendar-clear-outline" size={40} color="#64748b" />
              <Text className="text-muted mt-2">No classes scheduled for this date ({dayName}).</Text>
            </View>
          );
        }

        return (
          <View className="mb-6">
            <Text className="text-muted text-sm font-bold uppercase tracking-wider mb-2">{dayName} Classes</Text>
            {daySlots.map((slot, index) => (
              <View key={index}>
                <TouchableOpacity
                  onPress={() => loadSession(slot.timetableId, slot)}
                  className="bg-card p-4 rounded-2xl border border-border mb-2 flex-row justify-between items-center"
                >
                  <View>
                    <Text className="text-white text-base font-bold">{slot.subjectId?.name} (Div {slot.division})</Text>
                    <Text className="text-muted text-sm">{slot.startTime} - {slot.endTime}</Text>
                  </View>
                  <Ionicons
                    name={selectedSlot?.startTime === slot.startTime && selectedSlot?.day === slot.day ? 'chevron-up' : 'chevron-down'}
                    size={22} color="#64748b"
                  />
                </TouchableOpacity>

                {selectedSlot?.startTime === slot.startTime && selectedSlot?.day === slot.day && (
                  <View className="bg-surface border border-border rounded-2xl p-4 mb-4">
                    {sessionLoading ? (
                      <ActivityIndicator color="#6366f1" />
                    ) : sessionData?.records?.length > 0 ? (
                      sessionData.records.map((rec, i) => (
                        <View key={i} className="flex-row justify-between items-center py-2.5 border-b border-border/50">
                          <View className="flex-1">
                            <Text className="text-white font-bold">{rec.studentId?.name}</Text>
                            <Text className="text-muted text-xs">{rec.studentId?.enrollmentNo}</Text>
                            {rec.remarks ? <Text className="text-muted text-xs italic mt-0.5">"{rec.remarks}"</Text> : null}
                          </View>
                          <View className="flex-row items-center gap-2">
                            <View className={`px-2 py-1 rounded-full ${rec.status === 'present' ? 'bg-success/20' : rec.status === 'late' ? 'bg-warning/20' : 'bg-error/20'}`}>
                              <Text className={`text-xs font-bold uppercase ${rec.status === 'present' ? 'text-success' : rec.status === 'late' ? 'text-warning' : 'text-error'}`}>{rec.status}</Text>
                            </View>
                            <TouchableOpacity
                              onPress={() => openOverride(rec)}
                              className="bg-primary/20 p-1.5 rounded-lg"
                            >
                              <Ionicons name="create-outline" size={16} color="#6366f1" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => navigation.navigate('FacultyChat', { studentId: rec.studentId?._id, studentName: rec.studentId?.name })}
                              className="bg-success/20 p-1.5 rounded-lg"
                            >
                              <Ionicons name="chatbubble-outline" size={16} color="#22c55e" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))
                    ) : (
                      <Text className="text-muted text-center py-4">No attendance marked yet for this session.</Text>
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
          <View className="bg-card rounded-t-3xl p-6">
            <Text className="text-white text-xl font-bold mb-1">Override Attendance</Text>
            <Text className="text-muted text-sm mb-6">{overrideRecord?.studentId?.name}</Text>

            <Text className="text-muted text-sm font-bold mb-2">Status</Text>
            <View className="flex-row mb-4">
              {STATUS_OPTIONS.map(s => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setOverrideStatus(s)}
                  className={`flex-1 mr-2 py-3 rounded-xl border items-center ${
                    overrideStatus === s
                      ? s === 'present' ? 'bg-success/20 border-success' : s === 'late' ? 'bg-warning/20 border-warning' : 'bg-error/20 border-error'
                      : 'bg-surface border-border'
                  }`}
                >
                  <Text className={`font-bold text-xs uppercase ${
                    overrideStatus === s
                      ? s === 'present' ? 'text-success' : s === 'late' ? 'text-warning' : 'text-error'
                      : 'text-muted'
                  }`}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-muted text-sm font-bold mb-2">Remarks (optional)</Text>
            <TextInput
              className="bg-surface text-white p-3 rounded-xl border border-border mb-6"
              placeholder="Add a remark..."
              placeholderTextColor="#64748b"
              value={overrideRemarks}
              onChangeText={setOverrideRemarks}
            />

            <View className="flex-row gap-3">
              <TouchableOpacity onPress={() => setOverrideModal(false)} className="flex-1 p-4 rounded-xl border border-border items-center">
                <Text className="text-muted font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitOverride} disabled={overriding} className="flex-1 bg-primary p-4 rounded-xl items-center">
                {overriding ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Save Override</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
