import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, ActivityIndicator, TouchableOpacity,
  Alert, Modal, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { attendanceApi } from '../../api/attendance.api';
import { timetableApi } from '../../api/timetable.api';
import { useAuthStore } from '../../store/auth.store';
import CalendarPicker from '../../components/CalendarPicker';

const { width: SCREEN_W } = Dimensions.get('window');

// Simple SVG-free pie chart using View transforms
function PieChart({ present, absent, size = 140 }) {
  const total = present + absent;
  if (total === 0) {
    return (
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#1e293b', borderWidth: 2, borderColor: '#334155' }}
        className="items-center justify-center">
        <Text className="text-muted text-xs">No data</Text>
      </View>
    );
  }
  const pct = Math.round((present / total) * 100);
  const deg = (present / total) * 360;

  // Two half-circle approach
  const color = pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      {/* Background circle */}
      <View style={{
        position: 'absolute', width: size, height: size,
        borderRadius: size / 2, backgroundColor: '#ef444440',
        borderWidth: 2, borderColor: '#ef4444'
      }} />
      {/* Foreground arc - using border trick */}
      <View style={{
        position: 'absolute', width: size, height: size,
        borderRadius: size / 2,
        borderWidth: size / 8,
        borderColor: color,
        borderTopColor: pct > 25 ? color : 'transparent',
        borderRightColor: pct > 50 ? color : 'transparent',
        borderBottomColor: pct > 75 ? color : 'transparent',
        borderLeftColor: pct > 0 ? color : 'transparent',
        transform: [{ rotate: '-45deg' }]
      }} />
      {/* Center text */}
      <View className="items-center justify-center z-10">
        <Text style={{ color: color, fontSize: 28, fontWeight: 'bold' }}>{pct}%</Text>
        <Text className="text-muted text-xs">Attendance</Text>
      </View>
    </View>
  );
}

const STATUS_STYLES = {
  present: { bg: '#22c55e20', border: '#22c55e50', text: '#22c55e', icon: 'checkmark-circle' },
  absent: { bg: '#ef444420', border: '#ef444450', text: '#ef4444', icon: 'close-circle' },
  late: { bg: '#f59e0b20', border: '#f59e0b50', text: '#f59e0b', icon: 'time' },
  null: { bg: '#33415540', border: '#33415560', text: '#64748b', icon: 'help-circle-outline' },
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AttendanceScreen() {
  const user = useAuthStore(state => state.user);
  const [report, setReport] = useState(null);
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'sessions' | 'mark'
  const [activeSubject, setActiveSubject] = useState(null);
  const [markingId, setMarkingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  });

  const getDayName = (dateStr) => {
    const d = new Date(dateStr);
    return DAYS[d.getDay()];
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportData, ttData] = await Promise.all([
        attendanceApi.getDetailedReport().catch(() => null),
        timetableApi.getMyTimetable().catch(() => null)
      ]);
      setReport(reportData);
      setTimetable(ttData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMark = async (slot, status) => {
    if (!timetable) return;
    const slotDate = selectedDate;
    Alert.alert(
      `Mark ${status}`,
      `${slot.subjectId?.name || slot.startTime} · ${slotDate}\nMark yourself as ${status}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setMarkingId(`${slot.day}-${slot.startTime}`);
            try {
              await attendanceApi.markAttendance(timetable._id, slot.day, slot.startTime, undefined, status, slotDate);
              Alert.alert('✅ Done', `Marked ${status}!`);
              fetchData();
            } catch (err) {
              Alert.alert('Error', err?.response?.data?.message || 'Could not mark attendance');
            } finally {
              setMarkingId(null);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-surface justify-center items-center">
        <ActivityIndicator color="#6366f1" size="large" />
        <Text className="text-muted mt-4">Loading attendance...</Text>
      </View>
    );
  }

  const present = report?.attended || 0;
  const absent = report?.absent || 0;
  const sessions = report?.sessions || [];
  const subjectSummary = report?.subjectSummary || [];

  // For mark tab — group timetable slots by day
  const slotsByDay = {};
  timetable?.slots?.forEach(s => {
    if (!slotsByDay[s.day]) slotsByDay[s.day] = [];
    slotsByDay[s.day].push(s);
  });

  const filteredSessions = activeSubject
    ? sessions.filter(s => s.subject === activeSubject)
    : sessions;

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="px-4 pt-12 pb-4 bg-card border-b border-border">
        <Text className="text-white text-2xl font-bold">Attendance</Text>
        <Text className="text-muted text-sm">Sem {user?.semester} · Div {user?.division}</Text>
      </View>

      {/* Tab Bar */}
      <View className="flex-row bg-card border-b border-border px-4 py-2">
        {[
          { key: 'overview', label: 'Overview', icon: 'pie-chart' },
          { key: 'sessions', label: 'Sessions', icon: 'list' },
          { key: 'mark', label: 'Mark', icon: 'pencil' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className={`flex-1 flex-row items-center justify-center py-2 rounded-xl mr-1 ${activeTab === tab.key ? 'bg-primary' : ''}`}
          >
            <Ionicons name={tab.icon} size={14} color={activeTab === tab.key ? 'white' : '#64748b'} />
            <Text className={`ml-1 text-xs font-bold ${activeTab === tab.key ? 'text-white' : 'text-muted'}`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>

        {/* ─── OVERVIEW TAB ─── */}
        {activeTab === 'overview' && (
          <View className="px-4 pt-4">
            {/* Pie Chart + Stats Row */}
            <View className="bg-card p-5 rounded-3xl border border-border mb-5 flex-row items-center">
              <PieChart present={present} absent={absent} size={130} />
              <View className="flex-1 ml-5">
                <Text className="text-white text-lg font-bold mb-3">Overall</Text>
                <View className="flex-row items-center mb-2">
                  <View className="w-3 h-3 rounded-full bg-success mr-2" />
                  <Text className="text-white text-sm">{present} Present</Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <View className="w-3 h-3 rounded-full bg-error mr-2" />
                  <Text className="text-white text-sm">{absent} Absent</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-3 h-3 rounded-full bg-muted mr-2" />
                  <Text className="text-white text-sm">{present + absent} Total</Text>
                </View>
              </View>
            </View>

            {/* Per-Subject Breakdown */}
            <Text className="text-white text-base font-bold mb-3">By Subject</Text>
            {subjectSummary.length === 0 ? (
              <Text className="text-muted text-center py-6">No attendance records yet.</Text>
            ) : (
              subjectSummary.map((sub, i) => {
                const color = sub.percent >= 75 ? '#22c55e' : sub.percent >= 50 ? '#f59e0b' : '#ef4444';
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => { setActiveSubject(sub.name); setActiveTab('sessions'); }}
                    className="bg-card p-4 rounded-2xl border border-border mb-3"
                  >
                    <View className="flex-row justify-between items-center mb-2">
                      <View className="flex-1">
                        <Text className="text-white font-bold">{sub.name}</Text>
                        <Text className="text-muted text-xs">{sub.code}</Text>
                      </View>
                      <Text style={{ color }} className="text-lg font-bold">{sub.percent}%</Text>
                    </View>
                    <View className="h-1.5 bg-surface rounded-full overflow-hidden">
                      <View style={{ width: `${sub.percent}%`, backgroundColor: color }} className="h-full rounded-full" />
                    </View>
                    <View className="flex-row mt-2">
                      <Text className="text-muted text-xs mr-3">✅ {sub.present} present</Text>
                      <Text className="text-muted text-xs mr-3">❌ {sub.absent} absent</Text>
                      {sub.late > 0 && <Text className="text-muted text-xs">⏱ {sub.late} late</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* ─── SESSIONS TAB ─── */}
        {activeTab === 'sessions' && (
          <View className="px-4 pt-4">
            {/* Subject filter chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <TouchableOpacity
                onPress={() => setActiveSubject(null)}
                className={`mr-2 px-3 py-1.5 rounded-full border ${!activeSubject ? 'bg-primary border-primary' : 'bg-surface border-border'}`}
              >
                <Text className={`text-xs font-bold ${!activeSubject ? 'text-white' : 'text-muted'}`}>All</Text>
              </TouchableOpacity>
              {subjectSummary.map((sub, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setActiveSubject(activeSubject === sub.name ? null : sub.name)}
                  className={`mr-2 px-3 py-1.5 rounded-full border ${activeSubject === sub.name ? 'bg-primary border-primary' : 'bg-surface border-border'}`}
                >
                  <Text className={`text-xs font-bold ${activeSubject === sub.name ? 'text-white' : 'text-muted'}`}>{sub.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {filteredSessions.length === 0 ? (
              <Text className="text-muted text-center py-8">No sessions found.</Text>
            ) : (
              filteredSessions.map((session, i) => {
                const st = STATUS_STYLES[session.status] || STATUS_STYLES['null'];
                return (
                  <View
                    key={i}
                    style={{ backgroundColor: st.bg, borderColor: st.border }}
                    className="flex-row items-center p-4 rounded-2xl border mb-3"
                  >
                    <View style={{ backgroundColor: st.bg }} className="w-10 h-10 rounded-full items-center justify-center mr-3">
                      <Ionicons name={st.icon} size={22} color={st.text} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-bold">{session.subject}</Text>
                      <Text className="text-muted text-xs">
                        {new Date(session.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}
                        {session.startTime ? ` · ${session.startTime}` : ''}
                      </Text>
                      {session.remarks ? (
                        <Text className="text-muted text-xs italic mt-0.5">"{session.remarks}"</Text>
                      ) : null}
                    </View>
                    <Text style={{ color: st.text }} className="text-xs font-bold uppercase">
                      {session.status || 'N/A'}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ─── MARK TAB ─── */}
        {activeTab === 'mark' && (() => {
          const dayName = getDayName(selectedDate);
          const daySlots = slotsByDay[dayName] || [];
          return (
            <View className="px-4 pt-4">
              <View className="bg-primary/10 border border-primary/30 p-3 rounded-2xl mb-4">
                <Text className="text-primary text-sm font-bold">📌 Mark your attendance</Text>
                <Text className="text-muted text-xs mt-1">Select a date and tap Present or Absent. You can update anytime.</Text>
              </View>

              <View className="mb-4">
                <CalendarPicker label="Select Date" value={selectedDate} onChange={setSelectedDate} />
              </View>

              {!timetable ? (
                <Text className="text-muted text-center py-8">No timetable found.</Text>
              ) : daySlots.length === 0 ? (
                <View className="items-center py-8 bg-card border border-border rounded-2xl">
                  <Ionicons name="calendar-clear-outline" size={40} color="#64748b" />
                  <Text className="text-muted mt-2">No classes scheduled for this date ({dayName}).</Text>
                </View>
              ) : (
                <View className="mb-5">
                  <Text className="text-muted text-xs font-bold uppercase tracking-widest mb-2">{dayName} Classes</Text>
                  {daySlots.map((slot, si) => {
                    const slotKey = `${slot.day}-${slot.startTime}`;
                    const isMarking = markingId === slotKey;
                    
                    const existingSession = sessions.find(s =>
                      s.subject === slot.subjectId?.name &&
                      new Date(s.date).toISOString().split('T')[0] === selectedDate
                    );
                    const currentStatus = existingSession?.status;
                    const st = STATUS_STYLES[currentStatus] || STATUS_STYLES['null'];

                    return (
                      <View key={si} className="bg-card p-4 rounded-2xl border border-border mb-3">
                        <View className="flex-row justify-between items-start mb-3">
                          <View className="flex-1">
                            <Text className="text-white font-bold">{slot.subjectId?.name}</Text>
                            <Text className="text-muted text-xs">{slot.startTime} – {slot.endTime}</Text>
                          </View>
                          {currentStatus && (
                            <View style={{ backgroundColor: st.bg, borderColor: st.border }}
                              className="px-2 py-0.5 rounded-full border">
                              <Text style={{ color: st.text }} className="text-xs font-bold uppercase">{currentStatus}</Text>
                            </View>
                          )}
                        </View>

                        {isMarking ? (
                          <ActivityIndicator color="#6366f1" />
                        ) : (
                          <View className="flex-row gap-2">
                            <TouchableOpacity
                              onPress={() => handleMark(slot, 'present')}
                              className="flex-1 flex-row items-center justify-center py-2.5 rounded-xl bg-success/20 border border-success/50"
                            >
                              <Ionicons name="checkmark" size={16} color="#22c55e" />
                              <Text className="text-success font-bold text-sm ml-1">Present</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleMark(slot, 'absent')}
                              className="flex-1 flex-row items-center justify-center py-2.5 rounded-xl bg-error/20 border border-error/50"
                            >
                              <Ionicons name="close" size={16} color="#ef4444" />
                              <Text className="text-error font-bold text-sm ml-1">Absent</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })()}

      </ScrollView>
    </View>
  );
}