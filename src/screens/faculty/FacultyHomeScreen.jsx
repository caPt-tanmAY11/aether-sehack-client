import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/ThemeContext';

export default function FacultyHomeScreen() {
  const user       = useAuthStore(s => s.user);
  const logout     = useAuthStore(s => s.logout);
  const navigation = useNavigation();
  const { theme: T, isDark, toggle } = useTheme();

  const initials = user?.name?.split(' ').map(w => w[0]).slice(0, 2).join('') || 'F';

  const h = new Date().getHours();
  const timeGreet = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';

  const quickActions = [
    { route: 'TimetableUpload',    icon: 'calendar',             color: '#22c55e',  text: 'Upload Timetable' },
    { route: 'SyllabusUpdate',     icon: 'document-text-outline',color: '#f59e0b',  text: 'Update Syllabus' },
    { route: 'AttendanceOverride', icon: 'shield-checkmark',     color: '#6b38d4',  text: 'Override Attendance' },
    { route: 'AttendanceViewer',   icon: 'eye-outline',          color: '#818cf8',  text: 'View Attendance' },
    { route: 'Batches',            icon: 'people-outline',       color: '#22c55e',  text: 'My Batches' },
    { route: 'StudentLeaves',      icon: 'calendar-outline',     color: '#f59e0b',  text: 'Student Leaves' },
    { route: 'Advising',           icon: 'school-outline',       color: '#6b38d4',  text: 'Advising Requests' },
    { route: 'TimetableStatus',    icon: 'hourglass-outline',    color: '#f59e0b',  text: 'Timetable Status' },
    { route: 'RaiseDue',           icon: 'cash-outline',         color: '#ef4444',  text: 'Issue Fine/Bill' },
  ];

  const barHeights = [40, 65, 55, 85, 45, 70, 90];

  return (
    <View style={[s.root, { backgroundColor: T.bg }]}>

      {/* Header */}
      <View style={[s.header, { backgroundColor: T.headerBg, borderBottomColor: T.headerBorder }]}>
        <View style={s.headerLeft}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={[s.avatar, { backgroundColor: T.accentSoft, borderColor: T.accent }]} activeOpacity={0.8}>
            <Text style={[s.avatarText, { color: T.accent }]}>{initials}</Text>
          </TouchableOpacity>
          <View>
            <Text style={[s.brand, { color: T.text }]}>Aether</Text>
            <Text style={[s.subBrand, { color: T.muted }]}>Faculty Portal</Text>
          </View>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity onPress={toggle} style={[s.iconBtn, { backgroundColor: T.iconBg }]} activeOpacity={0.7}>
            <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={18} color={T.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={[s.iconBtn, { backgroundColor: T.iconBg }]} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={18} color={T.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={[s.iconBtn, { backgroundColor: T.iconBg }]} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={18} color={T.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Greeting */}
        <View style={{ marginBottom: 28 }}>
          <Text style={[s.eyebrow, { color: T.accent }]}>{timeGreet}</Text>
          <Text style={[s.heroTitle, { color: T.text }]}>
            {user?.name?.split(' ')[0] || 'Professor'},{'\n'}
            <Text style={{ color: T.accent }}>Ready to inspire?</Text>
          </Text>
          <Text style={[s.heroSub, { color: T.textSub }]}>Your morning intelligence report is ready.</Text>
        </View>

        <View style={{ gap: 14 }}>

          {/* Class Intelligence Card */}
          <View style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
            <View style={s.cardHeader}>
              <View>
                <Text style={[s.cardTitle, { color: T.text }]}>Class Intelligence</Text>
                <Text style={[s.cardSub, { color: T.textSub }]}>Average Attendance Trends</Text>
              </View>
              <View style={[s.trendBadge, { backgroundColor: T.accentSoft }]}>
                <Ionicons name="trending-up" size={11} color={T.accent} />
                <Text style={[s.trendText, { color: T.accentText }]}>+4.2% vs last term</Text>
              </View>
            </View>
            {/* Bar Chart */}
            <View style={s.chartRow}>
              {barHeights.map((h, i) => (
                <View
                  key={i}
                  style={[
                    s.bar,
                    {
                      height: `${h}%`,
                      backgroundColor: i === 6 ? T.accent : i === 3 ? T.heroCardBg : T.iconBg,
                    },
                  ]}
                />
              ))}
            </View>
            <View style={s.chartLabels}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'Now'].map((d, i) => (
                <Text key={i} style={[s.chartLabel, { color: i === 6 ? T.accent : T.muted }, i === 6 && { fontWeight: '800' }]}>{d}</Text>
              ))}
            </View>
          </View>

          {/* Today's Schedule (dark hero card) */}
          <View style={[s.heroCard, { backgroundColor: T.heroCardBg }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={[s.heroCardTitle, { color: T.heroCardText }]}>Today's Schedule</Text>
              <View style={[s.heroIconWrap, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <Ionicons name="calendar-outline" size={18} color={T.heroCardText} />
              </View>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('TimetableStatus')}
              style={s.scheduleItem}
              activeOpacity={0.75}
            >
              <View style={[s.scheduleLine, { backgroundColor: T.accent }]} />
              <View style={{ flex: 1 }}>
                <Text style={[s.scheduleTime, { color: T.heroCardMuted }]}>View Full Timetable</Text>
                <Text style={[s.scheduleName, { color: T.heroCardText }]}>Navigate to your schedule →</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={T.heroCardMuted} />
            </TouchableOpacity>
          </View>

          {/* Coordination Hub */}
          <TouchableOpacity
            onPress={() => navigation.navigate('FacultyCoordination')}
            style={[s.banner, { backgroundColor: T.cardAlt, borderColor: T.border }]}
            activeOpacity={0.85}
          >
            <View style={[s.bannerIcon, { backgroundColor: T.heroCardBg }]}>
              <Ionicons name="chatbubbles" size={22} color="#ffffff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.bannerEyebrow, { color: T.accent }]}>Faculty Network</Text>
              <Text style={[s.bannerTitle, { color: T.text }]}>Coordination Hub</Text>
              <Text style={[s.bannerSub, { color: T.muted }]}>Real-time faculty discussions</Text>
            </View>
            <View style={[s.bannerChevron, { backgroundColor: T.iconBg }]}>
              <Ionicons name="chevron-forward" size={16} color={T.textSub} />
            </View>
          </TouchableOpacity>

        </View>

        {/* Manage Portal Grid */}
        <View style={{ marginTop: 32 }}>
          <Text style={[s.sectionTitle, { color: T.text }]}>Manage Portal</Text>
          <View style={s.grid}>
            {quickActions.map((item, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => navigation.navigate(item.route)}
                style={[s.gridItem, { backgroundColor: T.card, borderColor: T.border }]}
                activeOpacity={0.8}
              >
                <View style={[s.gridIcon, { backgroundColor: `${item.color}14` }]}>
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <Text style={[s.gridLabel, { color: T.text }]} numberOfLines={2}>{item.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 160 },

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
  avatarText: { fontSize: 14, fontWeight: '900', letterSpacing: -0.3 },
  brand:      { fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  subBrand:   { fontSize: 9,  fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 1 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  eyebrow:     { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
  heroTitle:   { fontSize: 34, fontWeight: '900', lineHeight: 40, letterSpacing: -0.8 },
  heroSub:     { fontSize: 14, marginTop: 10 },
  sectionTitle:{ fontSize: 18, fontWeight: '800', marginBottom: 14, letterSpacing: -0.3 },

  card: {
    borderRadius: 24,
    padding: 22,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  cardTitle:  { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  cardSub:    { fontSize: 13, marginTop: 3 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  trendText:  { fontSize: 11, fontWeight: '700' },
  chartRow:   { height: 100, flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  bar:        { flex: 1, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  chartLabels:{ flexDirection: 'row', marginTop: 8, gap: 6 },
  chartLabel: { flex: 1, fontSize: 10, textAlign: 'center', fontWeight: '600' },

  heroCard: {
    borderRadius: 24,
    padding: 22,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 10,
  },
  heroCardTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  heroIconWrap:  { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  scheduleItem:  { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 4 },
  scheduleLine:  { width: 3, height: 44, borderRadius: 2 },
  scheduleTime:  { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  scheduleName:  { fontSize: 16, fontWeight: '700', marginTop: 3 },

  banner: {
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  bannerIcon:    { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  bannerEyebrow: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 3 },
  bannerTitle:   { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  bannerSub:     { fontSize: 12, marginTop: 2 },
  bannerChevron: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },

  grid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: {
    width: '47%',
    borderRadius: 20,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  gridIcon:  { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  gridLabel: { fontSize: 13, fontWeight: '800', letterSpacing: -0.2, lineHeight: 18 },
});
