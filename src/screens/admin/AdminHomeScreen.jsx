import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { analyticsApi } from '../../api/analytics.api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/ThemeContext';

export default function AdminHomeScreen() {
  const user       = useAuthStore(s => s.user);
  const role       = useAuthStore(s => s.role);
  const logout     = useAuthStore(s => s.logout);
  const navigation = useNavigation();
  const { theme: T, isDark, toggle } = useTheme();

  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  const initials = user?.name?.split(' ').map(w => w[0]).slice(0, 2).join('') || 'A';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = (role === 'dean' || role === 'superadmin')
          ? await analyticsApi.getDeanDashboard()
          : await analyticsApi.getHodDashboard();
        setStats(res);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    if (['dean', 'hod', 'superadmin'].includes(role)) fetchStats();
    else setLoading(false);
  }, [role]);

  const adminActions = [
    ...(['council', 'hod', 'dean', 'superadmin'].includes(role)
      ? [{ route: 'EventApprovals',  icon: 'flag-outline',      color: T.accent,  text: 'Event Approvals',  sub: 'Pending requests' }]
      : []),
    ...(['hod', 'superadmin'].includes(role)
      ? [{ route: 'TimetableReview',icon: 'calendar-outline',  color: '#0284c7', text: 'Timetable Review', sub: 'Review drafts' }]
      : []),
    ...(role === 'hod'
      ? [{ route: 'LeaveApprovals', icon: 'time-outline',      color: T.warning,  text: 'Leave Approvals',  sub: 'Faculty requests' }]
      : []),
    ...(['hod', 'dean', 'superadmin'].includes(role)
      ? [{ route: 'RaiseDue',       icon: 'cash-outline',      color: T.error,    text: 'Issue Fine/Bill',  sub: 'Raise student dues' }]
      : []),
  ];

  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Admin';
  const totalStudents = stats?.deanReport?.totalStudents || stats?.departmentSize || 0;
  const avgAttendance = stats?.attendance?.avgAttendancePercent ?? 0;

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
            <Text style={[s.subBrand, { color: T.muted }]}>{roleLabel} Portal</Text>
          </View>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity onPress={toggle} style={[s.iconBtn, { backgroundColor: T.iconBg }]} activeOpacity={0.7}>
            <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={18} color={T.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={[s.iconBtn, { backgroundColor: T.iconBg }]} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={18} color={T.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Greeting */}
        <View style={{ marginBottom: 28 }}>
          <Text style={[s.eyebrow, { color: T.accent }]}>{roleLabel} Portal</Text>
          <Text style={[s.heroTitle, { color: T.text }]}>
            Welcome,{'\n'}<Text style={{ color: T.accent }}>{user?.name?.split(' ')[0]}</Text>
          </Text>
          <Text style={[s.heroSub, { color: T.textSub }]}>Campus administration overview.</Text>
        </View>

        {/* Stats Row */}
        <View style={{ flexDirection: 'row', gap: 14, marginBottom: 14 }}>
          <View style={[s.statCard, { flex: 1, backgroundColor: T.card, borderColor: T.border }]}>
            <View style={[s.statIcon, { backgroundColor: T.accentSoft }]}>
              <Ionicons name="people-outline" size={20} color={T.accent} />
            </View>
            <Text style={[s.statLabel, { color: T.text }]}>Active Students</Text>
            <Text style={[s.statSub, { color: T.muted }]}>Total Enrolled</Text>
            {loading ? (
              <ActivityIndicator color={T.accent} size="small" style={{ marginTop: 8 }} />
            ) : (
              <Text style={[s.statBig, { color: T.accent }]}>{totalStudents}</Text>
            )}
          </View>

          <View style={[s.statCard, { flex: 1, backgroundColor: T.card, borderColor: T.border }]}>
            <View style={[s.statIcon, { backgroundColor: isDark ? 'rgba(74,222,128,0.15)' : '#dcfce7' }]}>
              <Ionicons name="checkmark-circle-outline" size={20} color={T.success} />
            </View>
            <Text style={[s.statLabel, { color: T.text }]}>Avg Attendance</Text>
            <Text style={[s.statSub, { color: T.muted }]}>Campus Pulse</Text>
            {loading ? (
              <ActivityIndicator color={T.success} size="small" style={{ marginTop: 8 }} />
            ) : (
              <Text style={[s.statBig, { color: T.success }]}>{avgAttendance}%</Text>
            )}
          </View>
        </View>

        {/* Issues Alert */}
        {['dean', 'hod', 'superadmin'].includes(role) && (
          <TouchableOpacity
            onPress={() => navigation.navigate('IssuesResolution')}
            style={[s.alertCard, { backgroundColor: T.errorSoft }]}
            activeOpacity={0.85}
          >
            <View style={[s.alertIcon, { backgroundColor: T.error }]}>
              <Ionicons name="alert-circle" size={26} color="#ffffff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.alertEyebrow, { color: T.error }]}>Action Required</Text>
              <Text style={[s.alertTitle, { color: isDark ? '#fca5a5' : '#93000a' }]}>Review Campus Issues</Text>
              <Text style={[s.alertSub, { color: isDark ? '#fca5a5' : '#93000a', opacity: 0.7 }]}>Unresolved student reports</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={T.error} />
          </TouchableOpacity>
        )}

        {/* Administrative Queue */}
        <View style={{ marginTop: 24 }}>
          <Text style={[s.sectionTitle, { color: T.text }]}>Administrative Queue</Text>
          <View style={{ gap: 10 }}>
            {adminActions.map((item, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => navigation.navigate(item.route)}
                style={[s.listItem, { backgroundColor: T.card, borderColor: T.border }]}
                activeOpacity={0.8}
              >
                <View style={[s.listIcon, { backgroundColor: `${item.color}14` }]}>
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.listTitle, { color: T.text }]}>{item.text}</Text>
                  <Text style={[s.listSub, { color: T.muted }]}>{item.sub}</Text>
                </View>
                <View style={[s.listChevron, { backgroundColor: T.iconBg }]}>
                  <Ionicons name="chevron-forward" size={16} color={T.muted} />
                </View>
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
  heroTitle:   { fontSize: 36, fontWeight: '900', lineHeight: 42, letterSpacing: -1 },
  heroSub:     { fontSize: 14, marginTop: 10 },
  sectionTitle:{ fontSize: 18, fontWeight: '800', marginBottom: 14, letterSpacing: -0.3 },

  statCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  statIcon:  { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statLabel: { fontSize: 14, fontWeight: '800', letterSpacing: -0.3 },
  statSub:   { fontSize: 11, marginTop: 2, marginBottom: 10 },
  statBig:   { fontSize: 32, fontWeight: '900', letterSpacing: -1 },

  alertCard: {
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 4,
  },
  alertIcon:    { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  alertEyebrow: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 3 },
  alertTitle:   { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  alertSub:     { fontSize: 12, marginTop: 2 },

  listItem: {
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  listIcon:    { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  listTitle:   { fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
  listSub:     { fontSize: 12, marginTop: 2 },
  listChevron: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
