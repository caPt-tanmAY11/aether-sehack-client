import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { useNotificationsStore } from '../../store/notifications.store';
import { attendanceApi } from '../../api/attendance.api';
import { timetableApi } from '../../api/timetable.api';
import { paymentsApi } from '../../api/payments.api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSocket } from '../../hooks/SocketContext';
import { useTheme } from '../../hooks/ThemeContext';

/* ─── Static campus data ─────────────────────────────────── */
const QUOTES = [
  { text: 'An investment in knowledge pays the best interest.', author: 'Benjamin Franklin' },
  { text: 'Education is not the filling of a pail, but the lighting of a fire.', author: 'W.B. Yeats' },
  { text: 'The beautiful thing about learning is that no one can take it away from you.', author: 'B.B. King' },
  { text: 'Intelligence plus character — that is the goal of true education.', author: 'Martin Luther King Jr.' },
  { text: 'Education is the most powerful weapon you can use to change the world.', author: 'Nelson Mandela' },
  { text: 'Strive for progress, not perfection.', author: 'Campus Wisdom' },
  { text: 'Your future is created by what you do today, not tomorrow.', author: 'Robert T. Kiyosaki' },
];

const WEEK_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6)  return { text: 'Up Early',        icon: '🌙' };
  if (h < 12) return { text: 'Good Morning',     icon: '☀️' };
  if (h < 17) return { text: 'Good Afternoon',   icon: '⚡' };
  if (h < 21) return { text: 'Good Evening',     icon: '🌆' };
  return           { text: 'Burning Midnight Oil', icon: '🌙' };
}

function getWeekDay() {
  const d = new Date().getDay(); // 0=Sun
  return d === 0 || d === 6 ? -1 : d - 1; // 0=Mon … 4=Fri, -1=weekend
}

function getTodayQuote() {
  const idx = Math.floor(Date.now() / 86400000) % QUOTES.length;
  return QUOTES[idx];
}

const TODAY_NAME = new Date().toLocaleDateString('en-US', { weekday: 'long' }); // e.g. "Monday"

/* ─── Component ─────────────────────────────────────────── */
export default function HomeScreen() {
  const user          = useAuthStore(s => s.user);
  const logout        = useAuthStore(s => s.logout);
  const unreadCount   = useNotificationsStore(s => s.unreadCount);
  const navigation    = useNavigation();
  const { theme, isDark, toggle } = useTheme();
  const socket        = useSocket();

  const [attendance,   setAttendance]   = useState(null);
  const [nextClass,    setNextClass]    = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [outstanding,  setOutstanding]  = useState({ totalRupees: '0.00', count: 0 });
  const [todaySlots,   setTodaySlots]   = useState([]);
  const [allSlots,     setAllSlots]     = useState([]);
  const [selectedDay,  setSelectedDay]  = useState(TODAY_NAME);

  const fetchDashboardData = async () => {
    try {
      const [attRes, classRes, duesRes, ttRes] = await Promise.all([
        attendanceApi.getReport().catch(() => null),
        timetableApi.getNextClass().catch(() => null),
        paymentsApi.getOutstanding().catch(() => null),
        timetableApi.getMyTimetable().catch(() => null),
      ]);
      setAttendance(attRes);
      setNextClass(classRes);
      if (duesRes) setOutstanding(duesRes);
      if (ttRes?.slots) {
        // Store full week data
        setAllSlots(ttRes.slots);
        const slots = ttRes.slots
          .filter(s => {
            const slotDay = (s.day || '').toLowerCase();
            const todayDay = TODAY_NAME.toLowerCase();
            return slotDay === todayDay;
          })
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
        setTodaySlots(slots);
      } else {
        setAllSlots([]);
        setTodaySlots([]);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDashboardData(); }, []);
  useEffect(() => {
    if (!socket) return;
    socket.on('attendance_updated', fetchDashboardData);
    return () => socket.off('attendance_updated');
  }, [socket]);

  const initials   = user?.name?.split(' ').map(w => w[0]).slice(0, 2).join('') || 'U';
  const attPct     = attendance?.overallPercent ?? 0;
  const attColor   = attPct >= 75 ? theme.success : attPct >= 60 ? theme.warning : theme.error;
  const greeting   = getGreeting();
  const weekDay    = getWeekDay();
  const todayQuote = getTodayQuote();
  const today      = new Date();
  const dateStr    = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const quickActions = [
    { label: 'Ask Aether',    sub: 'AI Copilot',      icon: 'sparkles',                  route: 'Chatbot',          accent: theme.accent },
    { label: 'Mark Presence', sub: 'Check-in',         icon: 'scan-outline',              route: 'Attendance',       accent: '#0284c7' },
    { label: 'Find Room',     sub: 'Vacant now',        icon: 'search-outline',            route: 'VacantRooms',      accent: '#059669' },
    { label: 'Apply Leave',   sub: 'Request absence',  icon: 'calendar-outline',          route: 'LeaveApplication', accent: '#d97706' },
    { label: 'Messages',      sub: 'Student chat',     icon: 'chatbubble-ellipses-outline',route: 'ChatInbox',        accent: '#7c3aed' },
  ];

  /* Dynamic styles that depend on theme */
  const T = theme;

  return (
    <View style={[s.root, { backgroundColor: T.bg }]}>

      {/* ── Header ──────────────────────────────────────────── */}
      <View style={[s.header, { backgroundColor: T.headerBg, borderBottomColor: T.headerBorder }]}>
        <View style={s.headerLeft}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={[s.avatar, { backgroundColor: T.accentSoft, borderColor: T.accent }]} activeOpacity={0.8}>
            <Text style={[s.avatarText, { color: T.accent }]}>{initials}</Text>
          </TouchableOpacity>
          <View>
            <Text style={[s.heyText, { color: T.muted }]}>Hey, <Text style={{ color: T.accent, fontWeight: '900' }}>{user?.name || 'Student'}</Text></Text>
            <Text style={[s.subBrand, { color: T.muted }]}>Central Hub</Text>
          </View>
        </View>
        <View style={s.headerRight}>
          {/* Theme Toggle */}
          <TouchableOpacity onPress={toggle} style={[s.iconBtn, { backgroundColor: T.iconBg }]} activeOpacity={0.7}>
            <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={18} color={T.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={[s.iconBtn, { backgroundColor: T.iconBg }]} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={18} color={T.text} />
            {unreadCount > 0 && (
              <View style={s.badge}>
                <Text style={s.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={[s.iconBtn, { backgroundColor: T.iconBg }]} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={18} color={T.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Date & Greeting ──────────────────────────────── */}
        <View style={{ marginBottom: 6 }}>
          <Text style={[s.dateStr, { color: T.muted }]}>{dateStr}</Text>
          <Text style={[s.eyebrow, { color: T.accent }]}>
            {greeting.icon}  {greeting.text}, {user?.name || 'Student'}
          </Text>
          <Text style={[s.heroTitle, { color: T.text }]}>
            The Campus is{' '}
            <Text style={{ color: T.accent }}>Buzzing</Text>
          </Text>
        </View>

        {/* ── NEUBRUTALISM TIMETABLE CALENDAR ──────────── */}
        {(() => {
          // All full-week day names the backend uses
          const DAYS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const DAYS_SHORT = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

          // Slots for the currently selected day
          const visibleSlots = allSlots
            .filter(s => (s.day || '').toLowerCase() === selectedDay.toLowerCase())
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          // Next lecture from today's slots (first slot after current time)
          const now = new Date();
          const nowMin = now.getHours() * 60 + now.getMinutes();
          const nextLecture = todaySlots.find(slot => {
            const [hh, mm] = (slot.startTime || '00:00').split(':').map(Number);
            return hh * 60 + mm > nowMin;
          });

          return (
            <View style={{ marginBottom: 18 }}>
              {/* ── Brutal Header Bar */}
              <View style={[s.brutalHeader, { borderColor: T.text, backgroundColor: T.accent }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="calendar" size={14} color="#fff" />
                  <Text style={s.brutalHeaderText}>WEEKLY TIMETABLE</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Timetable')} activeOpacity={0.7}>
                  <Text style={s.brutalHeaderLink}>FULL VIEW →</Text>
                </TouchableOpacity>
              </View>

              {/* ── Day Selector Tabs */}
              <View style={[s.brutalDayBar, { backgroundColor: T.card, borderColor: T.text }]}>
                {DAYS_FULL.map((day, i) => {
                  const isSelected = selectedDay === day;
                  const isToday = day === TODAY_NAME;
                  const daySlotCount = allSlots.filter(s => (s.day || '').toLowerCase() === day.toLowerCase()).length;
                  return (
                    <TouchableOpacity
                      key={day}
                      onPress={() => setSelectedDay(day)}
                      style={[
                        s.brutalDayTab,
                        {
                          backgroundColor: isSelected ? T.text : 'transparent',
                          borderRightWidth: i < DAYS_FULL.length - 1 ? 2 : 0,
                          borderRightColor: T.text,
                        }
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text style={[s.brutalDayTabText, { color: isSelected ? (T.mode === 'dark' ? '#0b1120' : '#f7f9fb') : isToday ? T.accent : T.muted }]}>
                        {DAYS_SHORT[i]}
                      </Text>
                      {daySlotCount > 0 && (
                        <View style={[s.brutalDayDot, { backgroundColor: isSelected ? T.accent : T.accent }]} />
                      )}
                      {isToday && !isSelected && (
                        <Text style={{ fontSize: 6, color: T.accent, fontWeight: '900', letterSpacing: 1 }}>NOW</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* ── Slots for selected day */}
              {visibleSlots.length === 0 ? (
                <View style={[s.brutalEmpty, { backgroundColor: T.card, borderColor: T.text }]}>
                  <Text style={{ fontSize: 24, marginBottom: 6 }}>📭</Text>
                  <Text style={[s.brutalEmptyTitle, { color: T.text }]}>NO CLASSES</Text>
                  <Text style={[s.brutalEmptySub, { color: T.muted }]}>{selectedDay} is free</Text>
                </View>
              ) : (
                <View style={[s.brutalSlotList, { borderColor: T.text, backgroundColor: T.card }]}>
                  {visibleSlots.map((slot, i) => {
                    const [hh, mm] = (slot.startTime || '00:00').split(':').map(Number);
                    const slotMin = hh * 60 + mm;
                    const [eh, em] = (slot.endTime || slot.startTime || '00:00').split(':').map(Number);
                    const endMin = eh * 60 + em;
                    const isNow = selectedDay === TODAY_NAME && nowMin >= slotMin && nowMin < endMin;
                    const isDone = selectedDay === TODAY_NAME && nowMin >= endMin;

                    return (
                      <View
                        key={i}
                        style={[
                          s.brutalSlotRow,
                          {
                            borderBottomColor: T.text,
                            borderBottomWidth: i < visibleSlots.length - 1 ? 2 : 0,
                            backgroundColor: isNow ? `${T.accent}15` : 'transparent',
                          }
                        ]}
                      >
                        {/* Time column */}
                        <View style={[s.brutalSlotTimeCol, { borderRightColor: T.text }]}>
                          <Text style={[s.brutalSlotTimeText, { color: isNow ? T.accent : isDone ? T.muted : T.text }]}>
                            {slot.startTime}
                          </Text>
                          {slot.endTime && (
                            <Text style={{ fontSize: 9, color: T.muted, fontWeight: '700' }}>{slot.endTime}</Text>
                          )}
                        </View>

                        {/* Content column */}
                        <View style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 12 }}>
                          <Text style={{ fontSize: 13, fontWeight: '900', color: isDone ? T.muted : T.text, letterSpacing: -0.2 }} numberOfLines={1}>
                            {slot.subjectId?.name || slot.subject?.name || 'Class'}
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                            <Ionicons name="location-outline" size={10} color={T.muted} />
                            <Text style={{ fontSize: 11, color: T.muted, fontWeight: '700' }}>
                              {slot.roomId?.name || slot.room?.name || 'TBA'}
                            </Text>
                            {slot.facultyId?.name && (
                              <>
                                <Text style={{ color: T.muted, fontSize: 10 }}>·</Text>
                                <Ionicons name="person-outline" size={10} color={T.muted} />
                                <Text style={{ fontSize: 11, color: T.muted, fontWeight: '600' }} numberOfLines={1}>
                                  {slot.facultyId.name.split(' ').slice(-1)[0]}
                                </Text>
                              </>
                            )}
                          </View>
                        </View>

                        {/* Status pill */}
                        <View style={{ justifyContent: 'center', paddingRight: 12 }}>
                          {isNow && (
                            <View style={[s.brutalNowPill, { backgroundColor: T.accent }]}>
                              <Text style={s.brutalNowText}>LIVE</Text>
                            </View>
                          )}
                          {isDone && (
                            <Ionicons name="checkmark-circle" size={18} color={T.muted} />
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* ── Next Lecture Banner (today only) */}
              {nextLecture && selectedDay === TODAY_NAME && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('Timetable')}
                  style={[s.brutalNextCard, { borderColor: T.text, backgroundColor: T.heroCardBg }]}
                  activeOpacity={0.85}
                >
                  <View style={[s.brutalNextLabel, { backgroundColor: T.accent }]}>
                    <Text style={s.brutalNextLabelText}>NEXT LECTURE</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: -0.5 }} numberOfLines={1}>
                        {nextLecture.subjectId?.name || nextLecture.subject?.name || 'Class'}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.7)" />
                          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '800' }}>
                            {nextLecture.startTime}{nextLecture.endTime ? ` – ${nextLecture.endTime}` : ''}
                          </Text>
                        </View>
                        <Text style={{ color: 'rgba(255,255,255,0.4)' }}>|</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.7)" />
                          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '800' }}>
                            {nextLecture.roomId?.name || nextLecture.room?.name || 'TBA'}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={[s.brutalNextArrow, { borderColor: 'rgba(255,255,255,0.3)' }]}>
                      <Ionicons name="arrow-forward" size={16} color="#fff" />
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          );
        })()}

        {/* ── Stats, Campus, Banner, Quote ────────────── */}
        <View style={{ gap: 14 }}>

          {/* ── Next Class Hero ───────────────────── */}
          {nextClass ? (
            <TouchableOpacity
              onPress={() => navigation.navigate('Timetable')}
              activeOpacity={0.88}
              style={[s.heroCard, { backgroundColor: T.heroCardBg }]}
            >
              <View style={s.liveChip}>
                <View style={s.liveDot} />
                <Text style={s.liveText}>NEXT UP · {nextClass.startTime}</Text>
              </View>
              <View style={{ marginTop: 16 }}>
                <Text style={[s.heroSubject, { color: T.heroCardText }]}>{nextClass.subject?.name}</Text>
                <Text style={[s.heroRoom, { color: T.heroCardMuted }]}>{nextClass.room?.name || 'Room TBA'}</Text>
              </View>
              <View style={s.heroFooter}>
                <View style={[s.checkinBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.12)' }]}>
                  <Text style={[s.checkinText, { color: T.heroCardText }]}>Check-in when ready</Text>
                  <Ionicons name="arrow-forward" size={13} color={T.heroCardText} />
                </View>
                <Text style={[s.timeText, { color: T.heroCardMuted }]}>{nextClass.startTime}</Text>
              </View>
            </TouchableOpacity>
          ) : null}

          <View style={{ flexDirection: 'row', gap: 14 }}>

            {/* Attendance */}
            <View style={[s.statCard, { flex: 1, backgroundColor: T.card, borderColor: T.border }]}>
              <View style={s.statHeader}>
                <View>
                  <Text style={[s.statTitle, { color: T.text }]}>Attendance</Text>
                  <Text style={[s.statSub, { color: T.muted }]}>Overall status</Text>
                </View>
                <View style={[s.statIconBox, { backgroundColor: `${attColor}18` }]}>
                  <Ionicons name="checkmark-circle-outline" size={18} color={attColor} />
                </View>
              </View>
              {loading ? (
                <ActivityIndicator color={T.accent} size="small" style={{ marginTop: 8 }} />
              ) : (
                <>
                  <Text style={[s.statBig, { color: attColor }]}>{attPct}%</Text>
                  <View style={[s.progressBar, { backgroundColor: T.iconBg }]}>
                    <View style={[s.progressFill, { width: `${Math.min(attPct, 100)}%`, backgroundColor: attColor }]} />
                  </View>
                </>
              )}
            </View>

            {/* Dues */}
            <TouchableOpacity
              onPress={() => navigation.navigate('MyDues')}
              style={[
                s.statCard,
                { flex: 1, backgroundColor: outstanding.count > 0 ? T.errorSoft : (isDark ? '#0d2010' : '#f0fdf4'), borderColor: T.border },
              ]}
              activeOpacity={0.85}
            >
              <View style={s.statHeader}>
                <View>
                  <Text style={[s.statTitle, { color: T.text }]}>Dues</Text>
                  <Text style={[s.statSub, { color: T.muted }]}>{outstanding.count > 0 ? 'Action needed' : 'All clear'}</Text>
                </View>
                <View style={[s.statIconBox, { backgroundColor: outstanding.count > 0 ? `${T.error}18` : `${T.success}18` }]}>
                  <Ionicons name="wallet-outline" size={18} color={outstanding.count > 0 ? T.error : T.success} />
                </View>
              </View>
              <Text style={[s.statBig, { color: outstanding.count > 0 ? T.error : T.success }]}>
                {outstanding.count > 0 ? `₹${outstanding.totalRupees}` : '₹0'}
              </Text>
              <Text style={{ fontSize: 10, fontWeight: '700', color: outstanding.count > 0 ? T.error : T.success, marginTop: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {outstanding.count > 0 ? `${outstanding.count} pending` : 'No dues'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Campus Pulse ─────────────────────────────── */}
          <View style={[s.campusCard, { backgroundColor: T.card, borderColor: T.border }]}>
            <View style={s.campusHeader}>
              <View style={[s.campusDot, { backgroundColor: '#4ade80' }]} />
              <Text style={[s.campusTitle, { color: T.text }]}>Campus Live</Text>
              <Text style={[s.campusLive, { color: T.muted }]}>Right now</Text>
            </View>
            <View style={s.campusRow}>
              {[
                { icon: 'people-outline',  label: '1,247 on campus',       color: T.accent },
                { icon: 'book-outline',    label: 'Library: Open',          color: '#059669' },
                { icon: 'restaurant',      label: 'Cafeteria: Serving',     color: '#d97706' },
                { icon: 'wifi',            label: 'Campus WiFi: Strong',    color: '#0284c7' },
              ].map((item, i) => (
                <View key={i} style={s.campusStat}>
                  <View style={[s.campusStatIcon, { backgroundColor: `${item.color}14` }]}>
                    <Ionicons name={item.icon} size={16} color={item.color} />
                  </View>
                  <Text style={[s.campusStatText, { color: T.textSub }]}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── Global Events Banner ─────────────────────── */}
          <TouchableOpacity
            onPress={() => navigation.navigate('GlobalEventCalendar')}
            activeOpacity={0.85}
            style={[s.banner, { backgroundColor: T.cardAlt, borderColor: T.border }]}
          >
            <View style={[s.bannerIcon, { backgroundColor: T.heroCardBg }]}>
              <Ionicons name="calendar" size={22} color="#ffffff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.bannerEyebrow, { color: T.accent }]}>Global Events</Text>
              <Text style={[s.bannerTitle, { color: T.text }]}>Check Campus Pulse</Text>
              <Text style={[s.bannerSub, { color: T.muted }]}>See what's happening today</Text>
            </View>
            <View style={[s.bannerChevron, { backgroundColor: T.iconBg }]}>
              <Ionicons name="chevron-forward" size={16} color={T.textSub} />
            </View>
          </TouchableOpacity>

          {/* ── Quote of the Day ─────────────────────────── */}
          <View style={[s.quoteCard, { backgroundColor: T.heroCardBg }]}>
            <View style={s.quoteIconWrap}>
              <Text style={s.quoteGlyph}>❝</Text>
            </View>
            <Text style={[s.quoteText, { color: T.heroCardText }]}>{todayQuote.text}</Text>
            <Text style={[s.quoteAuthor, { color: T.heroCardMuted }]}>— {todayQuote.author}</Text>
            <View style={[s.quoteTag, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              <Ionicons name="bulb-outline" size={11} color={T.heroCardMuted} />
              <Text style={[s.quoteTagText, { color: T.heroCardMuted }]}>Quote of the Day</Text>
            </View>
          </View>

        </View>

        {/* ── Quick Actions ─────────────────────────────── */}
        <View style={{ marginTop: 32 }}>
          <Text style={[s.sectionTitle, { color: T.text }]}>Quick Actions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 4 }}>
            {quickActions.map(item => (
              <TouchableOpacity
                key={item.route}
                onPress={() => navigation.navigate(item.route)}
                style={[s.quickCard, { backgroundColor: T.card, borderColor: T.border }]}
                activeOpacity={0.8}
              >
                <View style={[s.quickIcon, { backgroundColor: `${item.accent}16` }]}>
                  <Ionicons name={item.icon} size={22} color={item.accent} />
                </View>
                <Text style={[s.quickLabel, { color: T.text }]}>{item.label}</Text>
                <Text style={[s.quickSub, { color: T.muted }]}>{item.sub}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 160 },

  /* Header */
  header: {
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatarText:  { fontSize: 14, fontWeight: '900', letterSpacing: -0.3 },
  heyText:     { fontSize: 15, fontWeight: '600' },
  brand:       { fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  subBrand:    { fontSize: 9,  fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 1 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -1,
    right: -1,
    backgroundColor: '#ba1a1a',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#ffffff', fontSize: 9, fontWeight: '800' },

  /* Typography */
  dateStr:     { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  eyebrow:     { fontSize: 13, fontWeight: '700', marginBottom: 6 },
  heroTitle:   { fontSize: 34, fontWeight: '900', lineHeight: 40, letterSpacing: -1, marginBottom: 16 },
  sectionTitle:{ fontSize: 18, fontWeight: '800', marginBottom: 14, letterSpacing: -0.3 },

  /* Week strip */
  weekStrip: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 14,
  },
  weekDay:   { flex: 1, alignItems: 'center', gap: 6 },
  weekDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDotInner: { width: 8, height: 8, borderRadius: 4 },
  weekLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  weekDivider: { height: StyleSheet.hairlineWidth, marginVertical: 10 },
  weekInfo:   { flexDirection: 'row', justifyContent: 'center' },
  weekInfoText:{ fontSize: 11, fontWeight: '600' },

  /* Cards */
  heroCard: {
    borderRadius: 24,
    padding: 22,
    minHeight: 200,
    justifyContent: 'space-between',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 10,
  },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4ade80',
  },
  liveText:    { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  heroSubject: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5, lineHeight: 30 },
  heroRoom:    { fontSize: 14, fontWeight: '500', marginTop: 6 },
  heroFooter:  { marginTop: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  checkinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 999,
  },
  checkinText: { fontWeight: '700', fontSize: 14 },
  timeText:    { fontSize: 13, fontWeight: '600' },

  statCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  statHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  statTitle:   { fontSize: 15, fontWeight: '800', letterSpacing: -0.3 },
  statSub:     { fontSize: 11, fontWeight: '500', marginTop: 2 },
  statIconBox: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statBig:     { fontSize: 30, fontWeight: '900', letterSpacing: -1 },
  progressBar: { height: 4, borderRadius: 2, marginTop: 12, overflow: 'hidden' },
  progressFill:{ height: '100%', borderRadius: 2 },

  /* Campus live */
  campusCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  campusHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  campusDot:    { width: 8, height: 8, borderRadius: 4 },
  campusTitle:  { fontSize: 16, fontWeight: '800', flex: 1, letterSpacing: -0.3 },
  campusLive:   { fontSize: 11, fontWeight: '600' },
  campusRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  campusStat:   { flexDirection: 'row', alignItems: 'center', gap: 7, width: '47%' },
  campusStatIcon:{ width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  campusStatText:{ fontSize: 12, fontWeight: '600', flex: 1 },

  /* Banner */
  banner: {
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  bannerIcon:     { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  bannerEyebrow:  { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 3 },
  bannerTitle:    { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  bannerSub:      { fontSize: 12, marginTop: 2 },
  bannerChevron:  { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },

  /* Quote */
  quoteCard: {
    borderRadius: 24,
    padding: 24,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 8,
  },
  quoteIconWrap:  { marginBottom: 12 },
  quoteGlyph:     { fontSize: 36, color: 'rgba(255,255,255,0.2)', lineHeight: 36 },
  quoteText:      { fontSize: 16, fontWeight: '600', lineHeight: 24, letterSpacing: -0.2 },
  quoteAuthor:    { fontSize: 13, fontWeight: '600', marginTop: 14, fontStyle: 'italic' },
  quoteTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginTop: 16,
  },
  quoteTagText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },

  /* New Brutalism timetable */
  brutalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 2,
    marginBottom: -2,
  },
  brutalHeaderText: { color: '#fff', fontWeight: '900', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' },
  brutalHeaderLink: { color: '#fff', fontWeight: '900', fontSize: 11, letterSpacing: 1 },
  brutalSlot: {
    padding: 14,
    width: 130,
    borderWidth: 2,
    // sharp corners — New Brutalism
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.9,
    shadowRadius: 0,
    elevation: 6,
  },
  brutalSlotTime:    { fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' },
  brutalSlotSubject: { fontSize: 14, fontWeight: '900', letterSpacing: -0.3, lineHeight: 18, marginBottom: 6 },
  brutalSlotRoom:    { fontSize: 10, fontWeight: '700' },

  brutalEmpty: {
    borderWidth: 2, borderTopWidth: 0,
    padding: 24, alignItems: 'center',
    borderRadius: 0,
  },
  brutalEmptyIcon:  { fontSize: 32, marginBottom: 8 },
  brutalEmptyTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
  brutalEmptySub:   { fontSize: 11, fontWeight: '600', textAlign: 'center' },

  /* Brutal calendar day tabs */
  brutalDayBar: {
    flexDirection: 'row',
    borderWidth: 2, borderTopWidth: 0,
    borderRadius: 0,
    overflow: 'hidden',
  },
  brutalDayTab: {
    flex: 1, paddingVertical: 10,
    alignItems: 'center', justifyContent: 'center',
    gap: 3,
  },
  brutalDayTabText: { fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  brutalDayDot: { width: 4, height: 4, borderRadius: 0 },

  /* Brutal slot list (vertical) */
  brutalSlotList: {
    borderWidth: 2, borderTopWidth: 0,
    borderRadius: 0,
  },
  brutalSlotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
  },
  brutalSlotTimeCol: {
    width: 58,
    borderRightWidth: 2,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brutalSlotTimeText: { fontSize: 12, fontWeight: '900', letterSpacing: 0.5 },

  /* Brutal status pills */
  brutalNowPill: {
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 0,
  },
  brutalNowText: { fontSize: 8, fontWeight: '900', color: '#fff', letterSpacing: 1.5 },

  /* Brutal next lecture card */
  brutalNextCard: {
    borderWidth: 2, borderTopWidth: 0,
    borderRadius: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 0, elevation: 6,
  },
  brutalNextLabel: {
    paddingHorizontal: 14, paddingVertical: 5,
    flexDirection: 'row', alignItems: 'center',
  },
  brutalNextLabelText: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  brutalNextArrow: {
    width: 36, height: 36,
    borderRadius: 0, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },

  slotCard: {
    borderRadius: 18,
    padding: 14,
    width: 130,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 0,
    elevation: 3,
  },
  slotDot:     { width: 8, height: 8, borderRadius: 4, marginBottom: 8 },
  slotTime:    { fontSize: 11, fontWeight: '900', letterSpacing: 0.3, marginBottom: 6 },
  slotSubject: { fontSize: 13, fontWeight: '900', letterSpacing: -0.2, lineHeight: 17, marginBottom: 6 },
  slotRoom:    { fontSize: 10, fontWeight: '600' },

  /* Quick Actions */
  quickCard: {
    borderRadius: 20,
    padding: 16,
    minWidth: 130,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  quickIcon:  { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  quickLabel: { fontSize: 13, fontWeight: '800', letterSpacing: -0.2 },
  quickSub:   { fontSize: 11, marginTop: 3 },
});
