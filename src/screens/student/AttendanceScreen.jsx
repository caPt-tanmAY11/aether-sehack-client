import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, ActivityIndicator, TouchableOpacity,
  Alert, Dimensions, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { attendanceApi } from '../../api/attendance.api';
import { timetableApi } from '../../api/timetable.api';
import { useAuthStore } from '../../store/auth.store';
import CalendarPicker from '../../components/CalendarPicker';
import { useSocket } from '../../hooks/SocketContext';
import { useTheme } from '../../hooks/ThemeContext';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/* ─── Pie chart (no SVG) ─── */
function PieChart({ present, absent, theme: T, size = 140 }) {
  const total = present + absent;
  if (total === 0) {
    return (
      <View style={[pc.ring, { width: size, height: size, borderRadius: size / 2, backgroundColor: T.iconBg, borderColor: T.border }]}>
        <Text style={[pc.noData, { color: T.muted }]}>No data</Text>
      </View>
    );
  }
  const pct   = Math.round((present / total) * 100);
  const color = pct >= 75 ? T.success : pct >= 50 ? T.warning : T.error;
  return (
    <View style={{ width: size, height: size }} >
      <View style={[pc.bgCircle, { width: size, height: size, borderRadius: size / 2, borderColor: T.error, backgroundColor: `${T.error}18` }]} />
      <View style={[pc.fgArc, {
        width: size, height: size, borderRadius: size / 2,
        borderWidth: size / 8, borderColor: color,
        borderTopColor:    pct > 25 ? color : 'transparent',
        borderRightColor:  pct > 50 ? color : 'transparent',
        borderBottomColor: pct > 75 ? color : 'transparent',
        borderLeftColor:   pct > 0  ? color : 'transparent',
      }]} />
      <View style={pc.centerLabel}>
        <Text style={[pc.pctText, { color }]}>{pct}%</Text>
        <Text style={[pc.pctSub, { color: T.muted }]}>Attendance</Text>
      </View>
    </View>
  );
}

const pc = StyleSheet.create({
  ring:        { alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  noData:      { fontSize: 11, fontWeight: '700' },
  bgCircle:    { position: 'absolute', borderWidth: 2 },
  fgArc:       { position: 'absolute', transform: [{ rotate: '-45deg' }] },
  centerLabel: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  pctText:     { fontSize: 26, fontWeight: '900', letterSpacing: -1 },
  pctSub:      { fontSize: 10, fontWeight: '700', marginTop: 2 },
});

/* ─── Main Screen ─── */
export default function AttendanceScreen() {
  const { theme: T } = useTheme();
  const user = useAuthStore(state => state.user);
  const socket = useSocket();

  const [report, setReport]       = useState(null);
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSubject, setActiveSubject] = useState(null);
  const [markingId, setMarkingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  });

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    if (!socket) return;
    socket.on('attendance_updated', fetchData);
    return () => socket.off('attendance_updated');
  }, [socket]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportData, ttData] = await Promise.all([
        attendanceApi.getDetailedReport().catch(() => null),
        timetableApi.getMyTimetable().catch(() => null),
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
    Alert.alert(
      `Mark ${status}`,
      `${slot.subjectId?.name || slot.startTime} · ${selectedDate}\nMark yourself as ${status}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const key = `${slot.day}-${slot.startTime}`;
            setMarkingId(key);
            try {
              await attendanceApi.markAttendance(timetable._id, slot.day, slot.startTime, undefined, status, selectedDate);
              Alert.alert('Done', `Marked ${status}!`);
              fetchData();
            } catch (err) {
              Alert.alert('Error', err?.response?.data?.message || 'Could not mark attendance');
            } finally {
              setMarkingId(null);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[s.center, { backgroundColor: T.bg }]}>
        <ActivityIndicator color={T.accent} size="large" />
        <Text style={[s.loadingText, { color: T.muted }]}>Loading attendance...</Text>
      </View>
    );
  }

  const present        = report?.attended || 0;
  const absent         = report?.absent || 0;
  const sessions       = report?.sessions || [];
  const subjectSummary = report?.subjectSummary || [];

  const slotsByDay = {};
  timetable?.slots?.forEach(sl => {
    if (!slotsByDay[sl.day]) slotsByDay[sl.day] = [];
    slotsByDay[sl.day].push(sl);
  });

  const filteredSessions = activeSubject
    ? sessions.filter(s => s.subject === activeSubject)
    : sessions;

  const TABS = [
    { key: 'overview', label: 'Overview', icon: 'pie-chart-outline' },
    { key: 'sessions', label: 'Sessions',  icon: 'list-outline' },
    { key: 'mark',     label: 'Mark',      icon: 'pencil-outline' },
  ];

  return (
    <View style={[s.root, { backgroundColor: T.bg }]}>

      {/* Header */}
      <View style={[s.header, { backgroundColor: T.card, borderBottomColor: T.border }]}>
        <Text style={[s.headerTitle, { color: T.text }]}>Attendance</Text>
        <Text style={[s.headerSub, { color: T.muted }]}>Sem {user?.semester} · Div {user?.division}</Text>
      </View>

      {/* Tab bar */}
      <View style={[s.tabRow, { backgroundColor: T.card, borderBottomColor: T.border }]}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[s.tabBtn, activeTab === tab.key && { backgroundColor: T.accent }]}
            activeOpacity={0.8}
          >
            <Ionicons name={tab.icon} size={14} color={activeTab === tab.key ? '#ffffff' : T.muted} />
            <Text style={[s.tabText, { color: activeTab === tab.key ? '#ffffff' : T.muted }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.flex} contentContainerStyle={{ paddingBottom: 160 }}>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <View style={s.tabContent}>
            {/* Pie + stats */}
            <View style={[s.overviewCard, { backgroundColor: T.card, borderColor: T.border }]}>
              <PieChart present={present} absent={absent} theme={T} size={130} />
              <View style={s.overviewStats}>
                <Text style={[s.overviewLabel, { color: T.text }]}>Overall</Text>
                <View style={s.statRow}>
                  <View style={[s.dot, { backgroundColor: T.success }]} />
                  <Text style={[s.statText, { color: T.text }]}>{present} Present</Text>
                </View>
                <View style={s.statRow}>
                  <View style={[s.dot, { backgroundColor: T.error }]} />
                  <Text style={[s.statText, { color: T.text }]}>{absent} Absent</Text>
                </View>
                <View style={s.statRow}>
                  <View style={[s.dot, { backgroundColor: T.muted }]} />
                  <Text style={[s.statText, { color: T.text }]}>{present + absent} Total</Text>
                </View>
              </View>
            </View>

            {/* By subject */}
            <Text style={[s.sectionTitle, { color: T.text }]}>By Subject</Text>
            {subjectSummary.length === 0 ? (
              <Text style={[s.emptyText, { color: T.muted }]}>No attendance records yet.</Text>
            ) : (
              subjectSummary.map((sub, i) => {
                const color = sub.percent >= 75 ? T.success : sub.percent >= 50 ? T.warning : T.error;
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => { setActiveSubject(sub.name); setActiveTab('sessions'); }}
                    style={[s.subCard, { backgroundColor: T.card, borderColor: T.border }]}
                    activeOpacity={0.8}
                  >
                    <View style={s.subCardTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.subName, { color: T.text }]}>{sub.name}</Text>
                        <Text style={[s.subCode, { color: T.muted }]}>{sub.code}</Text>
                      </View>
                      <Text style={[s.subPct, { color }]}>{sub.percent}%</Text>
                    </View>
                    <View style={[s.progBg, { backgroundColor: T.iconBg }]}>
                      <View style={[s.progFill, { width: `${sub.percent}%`, backgroundColor: color }]} />
                    </View>
                    <View style={s.subMeta}>
                      <Text style={[s.subMetaText, { color: T.muted }]}>✅ {sub.present}</Text>
                      <Text style={[s.subMetaText, { color: T.muted }]}>❌ {sub.absent}</Text>
                      {sub.late > 0 && <Text style={[s.subMetaText, { color: T.muted }]}>⏱ {sub.late} late</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* ── SESSIONS ── */}
        {activeTab === 'sessions' && (
          <View style={s.tabContent}>
            {/* Filter chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              <TouchableOpacity
                onPress={() => setActiveSubject(null)}
                style={[s.chip, { borderColor: !activeSubject ? T.accent : T.border, backgroundColor: !activeSubject ? T.accent : T.iconBg }]}
              >
                <Text style={[s.chipText, { color: !activeSubject ? '#ffffff' : T.muted }]}>All</Text>
              </TouchableOpacity>
              {subjectSummary.map((sub, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setActiveSubject(activeSubject === sub.name ? null : sub.name)}
                  style={[s.chip, { borderColor: activeSubject === sub.name ? T.accent : T.border, backgroundColor: activeSubject === sub.name ? T.accent : T.iconBg }]}
                >
                  <Text style={[s.chipText, { color: activeSubject === sub.name ? '#ffffff' : T.muted }]}>{sub.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {filteredSessions.length === 0 ? (
              <Text style={[s.emptyText, { color: T.muted, textAlign: 'center', paddingTop: 24 }]}>No sessions found.</Text>
            ) : (
              filteredSessions.map((session, i) => {
                const isPresent = session.status === 'present';
                const isAbsent  = session.status === 'absent';
                const isLate    = session.status === 'late';
                const color     = isPresent ? T.success : isAbsent ? T.error : isLate ? T.warning : T.muted;
                const icon      = isPresent ? 'checkmark-circle' : isAbsent ? 'close-circle' : isLate ? 'time' : 'help-circle-outline';
                return (
                  <View
                    key={i}
                    style={[s.sessionRow, { backgroundColor: T.card, borderColor: T.border }]}
                  >
                    <View style={[s.sessionIconBox, { backgroundColor: `${color}18` }]}>
                      <Ionicons name={icon} size={22} color={color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.sessionSubject, { color: T.text }]}>{session.subject}</Text>
                      <Text style={[s.sessionDate, { color: T.muted }]}>
                        {new Date(session.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}
                        {session.startTime ? ` · ${session.startTime}` : ''}
                      </Text>
                      {session.remarks && (
                        <Text style={[s.sessionRemark, { color: T.muted }]}>"{session.remarks}"</Text>
                      )}
                    </View>
                    <View style={[s.statusBadge, { backgroundColor: `${color}18`, borderColor: `${color}50` }]}>
                      <Text style={[s.statusText, { color }]}>{session.status || 'N/A'}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ── MARK ── */}
        {activeTab === 'mark' && (() => {
          const dayName  = DAYS[new Date(selectedDate).getDay()];
          const daySlots = slotsByDay[dayName] || [];
          return (
            <View style={s.tabContent}>
              <View style={[s.infoBox, { backgroundColor: T.accentSoft, borderColor: T.accent }]}>
                <Ionicons name="information-circle-outline" size={16} color={T.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.infoTitle, { color: T.accent }]}>Mark your attendance</Text>
                  <Text style={[s.infoSub, { color: T.textSub }]}>Select a date and tap Present or Absent.</Text>
                </View>
              </View>

              <View style={{ marginBottom: 16 }}>
                <CalendarPicker label="Select Date" value={selectedDate} onChange={setSelectedDate} />
              </View>

              {!timetable ? (
                <Text style={[s.emptyText, { color: T.muted }]}>No timetable found.</Text>
              ) : daySlots.length === 0 ? (
                <View style={[s.noClassBox, { backgroundColor: T.card, borderColor: T.border }]}>
                  <Ionicons name="calendar-clear-outline" size={36} color={T.muted} />
                  <Text style={[s.noClassText, { color: T.muted }]}>No classes on {dayName}.</Text>
                </View>
              ) : (
                <View>
                  <Text style={[s.dayLabel, { color: T.muted }]}>{dayName} Classes</Text>
                  {daySlots.map((slot, si) => {
                    const slotKey = `${slot.day}-${slot.startTime}`;
                    const isMarking = markingId === slotKey;
                    const existing  = sessions.find(s =>
                      s.subject === slot.subjectId?.name &&
                      new Date(s.date).toISOString().split('T')[0] === selectedDate
                    );
                    const currentStatus = existing?.status;
                    const statusColor   = currentStatus === 'present' ? T.success : currentStatus === 'absent' ? T.error : T.warning;

                    return (
                      <View key={si} style={[s.markCard, { backgroundColor: T.card, borderColor: T.border }]}>
                        <View style={s.markCardTop}>
                          <View style={{ flex: 1 }}>
                            <Text style={[s.markSubject, { color: T.text }]}>{slot.subjectId?.name}</Text>
                            <Text style={[s.markTime, { color: T.muted }]}>{slot.startTime} – {slot.endTime}</Text>
                          </View>
                          {currentStatus && (
                            <View style={[s.currentBadge, { backgroundColor: `${statusColor}18`, borderColor: `${statusColor}50` }]}>
                              <Text style={[s.currentBadgeText, { color: statusColor }]}>{currentStatus}</Text>
                            </View>
                          )}
                        </View>

                        {isMarking ? (
                          <ActivityIndicator color={T.accent} style={{ marginTop: 8 }} />
                        ) : (
                          <View style={s.markBtns}>
                            <TouchableOpacity
                              onPress={() => handleMark(slot, 'present')}
                              style={[s.markBtn, { backgroundColor: `${T.success}18`, borderColor: `${T.success}50` }]}
                            >
                              <Ionicons name="checkmark" size={16} color={T.success} />
                              <Text style={[s.markBtnText, { color: T.success }]}>Present</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleMark(slot, 'absent')}
                              style={[s.markBtn, { backgroundColor: `${T.error}18`, borderColor: `${T.error}50` }]}
                            >
                              <Ionicons name="close" size={16} color={T.error} />
                              <Text style={[s.markBtnText, { color: T.error }]}>Absent</Text>
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

const s = StyleSheet.create({
  root:   { flex: 1 },
  flex:   { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, fontWeight: '600' },

  header: {
    paddingTop: 52, paddingBottom: 14, paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  headerSub:   { fontSize: 13, fontWeight: '600', marginTop: 2 },

  tabRow: {
    flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, gap: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 8, borderRadius: 12,
  },
  tabText: { fontSize: 12, fontWeight: '800' },

  tabContent: { paddingHorizontal: 16, paddingTop: 16 },

  sectionTitle: { fontSize: 17, fontWeight: '900', letterSpacing: -0.3, marginBottom: 12, marginTop: 4 },
  emptyText:    { fontSize: 14, fontWeight: '600' },

  overviewCard: {
    borderRadius: 24, borderWidth: 2,
    padding: 20, flexDirection: 'row',
    alignItems: 'center', marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 0, elevation: 3,
  },
  overviewStats: { flex: 1, marginLeft: 20 },
  overviewLabel: { fontSize: 16, fontWeight: '900', marginBottom: 10 },
  statRow:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  dot:           { width: 10, height: 10, borderRadius: 5 },
  statText:      { fontSize: 13, fontWeight: '700' },

  subCard: {
    borderRadius: 18, borderWidth: 2, padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 0, elevation: 2,
  },
  subCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  subName:    { fontSize: 15, fontWeight: '900' },
  subCode:    { fontSize: 11, fontWeight: '600', marginTop: 2 },
  subPct:     { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  progBg:     { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progFill:   { height: '100%', borderRadius: 3 },
  subMeta:    { flexDirection: 'row', gap: 12 },
  subMetaText:{ fontSize: 11, fontWeight: '600' },

  chip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 999, borderWidth: 1.5,
    marginRight: 8, borderColor: 'transparent',
  },
  chipText: { fontSize: 12, fontWeight: '800' },

  sessionRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, borderWidth: 2,
    padding: 14, marginBottom: 10, gap: 12,
  },
  sessionIconBox: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  sessionSubject: { fontSize: 14, fontWeight: '900', marginBottom: 3 },
  sessionDate:    { fontSize: 11, fontWeight: '600' },
  sessionRemark:  { fontSize: 11, fontStyle: 'italic', marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1.5,
  },
  statusText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },

  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    padding: 12, borderRadius: 14, borderWidth: 1.5, marginBottom: 16,
  },
  infoTitle: { fontSize: 13, fontWeight: '800', marginBottom: 2 },
  infoSub:   { fontSize: 12 },

  noClassBox: {
    borderRadius: 20, borderWidth: 2,
    padding: 32, alignItems: 'center', gap: 10,
  },
  noClassText: { fontSize: 14, fontWeight: '700' },
  dayLabel: {
    fontSize: 10, fontWeight: '800', textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: 10,
  },

  markCard: {
    borderRadius: 18, borderWidth: 2,
    padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 0, elevation: 2,
  },
  markCardTop:  { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  markSubject:  { fontSize: 15, fontWeight: '900' },
  markTime:     { fontSize: 12, fontWeight: '600', marginTop: 2 },
  currentBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1.5 },
  currentBadgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },

  markBtns: { flexDirection: 'row', gap: 10 },
  markBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, gap: 6,
  },
  markBtnText: { fontSize: 13, fontWeight: '800' },
});
