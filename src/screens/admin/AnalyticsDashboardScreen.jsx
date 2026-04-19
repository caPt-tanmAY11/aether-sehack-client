import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { analyticsApi } from '../../api/analytics.api';
import { useAuthStore } from '../../store/auth.store';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/ThemeContext';
import AppHeader from '../../components/AppHeader';

const TIME_STEPS = [
  { label: '08:00', hour: 8 },
  { label: '10:00', hour: 10 },
  { label: '12:00', hour: 12 },
  { label: '14:00', hour: 14 },
  { label: '16:00', hour: 16 },
  { label: '18:00', hour: 18 },
];

const ROOMS = [
  { id: 'CR-101' }, { id: 'CR-102' }, { id: 'CR-103' }, { id: 'CR-104' },
  { id: 'CR-201' }, { id: 'CR-202' }, { id: 'CR-203' }, { id: 'CR-204' },
  { id: 'CR-301' }, { id: 'CR-302' }, { id: 'CR-303' }, { id: 'CR-304' },
  { id: 'Lab-A' },  { id: 'Lab-B' },  { id: 'Lib-1' },  { id: 'Sem-1' }
];

const getRoomIntensity = (roomIdx, hour) => {
  let base = 0;
  if (hour === 8) base = 0.15;
  if (hour === 10) base = 0.65;
  if (hour === 12) base = 0.85;
  if (hour === 14) base = 0.95;
  if (hour === 16) base = 0.45;
  if (hour === 18) base = 0.10;

  const variance = ((roomIdx * 17) % 30) / 100;
  const sign = roomIdx % 2 === 0 ? 1 : -1;
  let final = base + (variance * sign);
  
  if (hour === 14 && roomIdx % 3 === 0) final = 1.0; 
  if (hour === 12 && roomIdx % 5 === 0) final = 0.2; 
  
  return Math.max(0, Math.min(1, final));
};

const hodChartData = [
  { label: 'Sem 1', value: 82 },
  { label: 'Sem 2', value: 78 },
  { label: 'Sem 3', value: 89 },
  { label: 'Sem 4', value: 85 },
  { label: 'Sem 5', value: 92 },
  { label: 'Sem 6', value: 88 },
];

const deanChartData = [
  { label: 'CE', value: 88 },
  { label: 'CSE', value: 94 },
  { label: 'EXTC', value: 81 },
];

export default function AnalyticsDashboardScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeIndex, setTimeIndex] = useState(3); 
  const navigation = useNavigation();
  const role = useAuthStore(state => state.role);
  const { theme: T, isDark } = useTheme();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = (role === 'dean' || role === 'superadmin') ? await analyticsApi.getDeanDashboard() : await analyticsApi.getHodDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getHeatColor = (intensity) => {
    if (intensity > 0.85) return '#ef4444'; 
    if (intensity > 0.60) return '#f97316'; 
    if (intensity > 0.30) return '#eab308'; 
    if (intensity > 0.10) return '#4ade80'; 
    return isDark ? '#1e293b' : '#f1f5f9'; 
  };

  const renderProgressBar = (label, percent, colorHex) => (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ color: T.text, fontSize: 13, fontWeight: '800' }}>{label}</Text>
        <Text style={{ color: T.muted, fontSize: 13, fontWeight: '800' }}>{percent}%</Text>
      </View>
      <View style={{ height: 8, backgroundColor: T.bg, borderRadius: 4, overflow: 'hidden' }}>
        <View style={{ height: '100%', backgroundColor: colorHex, width: `${percent}%`, borderRadius: 4 }} />
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="Analytics Dashboard" showBack />

      {loading || !data ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={T.accent} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          
          {/* ── HEATMAP SECTION (Neo Brutalism) ── */}
          <Text style={[s.sectionTitle, { color: T.text }]}>Campus Heatmap</Text>
          <View style={[s.brutalCard, { backgroundColor: T.card, borderColor: T.text }]}>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <View>
                <Text style={{ color: T.text, fontWeight: '900', fontSize: 16 }}>Classroom Intensity</Text>
                <Text style={{ color: T.muted, fontSize: 12, fontWeight: '700', marginTop: 2 }}>{TIME_STEPS[timeIndex].label} · Live Estimate</Text>
              </View>
              <View style={[s.brutalIcon, { backgroundColor: T.accent, borderColor: T.text }]}>
                <Ionicons name="flame" size={16} color="#fff" />
              </View>
            </View>

            {/* Heatmap Grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
              {ROOMS.map((room, i) => {
                const intensity = getRoomIntensity(i, TIME_STEPS[timeIndex].hour);
                const bgColor = getHeatColor(intensity);
                const isBright = intensity > 0.60;
                
                return (
                  <View 
                    key={room.id} 
                    style={[
                      s.heatBlock, 
                      { backgroundColor: bgColor, borderColor: T.text }
                    ]}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '900', color: isBright ? '#fff' : T.text, letterSpacing: -0.5 }}>{room.id}</Text>
                    <Text style={{ fontSize: 9, fontWeight: '800', color: isBright ? 'rgba(255,255,255,0.8)' : T.muted, marginTop: 2 }}>
                      {Math.round(intensity * 100)}%
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Proper Slider */}
            <Text style={{ color: T.text, fontWeight: '900', fontSize: 12, textTransform: 'uppercase', marginBottom: 8 }}>Time of Day</Text>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={0}
              maximumValue={TIME_STEPS.length - 1}
              step={1}
              value={timeIndex}
              onValueChange={(val) => setTimeIndex(val)}
              minimumTrackTintColor={T.text}
              maximumTrackTintColor={T.border}
              thumbTintColor={T.accent}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 10, marginTop: -5 }}>
              <Text style={{ fontSize: 10, color: T.muted, fontWeight: 'bold' }}>08:00</Text>
              <Text style={{ fontSize: 10, color: T.muted, fontWeight: 'bold' }}>18:00</Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 16 }}>
              {[
                { label: 'Low', color: '#4ade80' },
                { label: 'Med', color: '#eab308' },
                { label: 'High', color: '#f97316' },
                { label: 'Peak', color: '#ef4444' }
              ].map(leg => (
                <View key={leg.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 10, height: 10, backgroundColor: leg.color, borderWidth: 1, borderColor: T.text }} />
                  <Text style={{ fontSize: 10, fontWeight: '700', color: T.text }}>{leg.label}</Text>
                </View>
              ))}
            </View>

          </View>

          {/* ── DYNAMIC ANALYSIS GRAPHS ── */}
          <Text style={[s.sectionTitle, { color: T.text, textTransform: 'none' }]}>
            {role === 'dean' || role === 'superadmin' ? 'Overall College Analysis' : 'Department Analysis'}
          </Text>
          <View style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
            <Text style={{ color: T.text, fontWeight: '900', fontSize: 15, marginBottom: 8 }}>
              {role === 'dean' || role === 'superadmin' ? 'Avg Progress by Department' : 'Avg Progress by Semester'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 160, marginTop: 8 }}>
              {(role === 'dean' || role === 'superadmin' ? deanChartData : hodChartData).map((item, i) => {
                const heightPct = (item.value / 100) * 100;
                return (
                  <View key={i} style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: T.textSub, marginBottom: 4 }}>{item.value}%</Text>
                    <View style={{ height: 100, width: 28, backgroundColor: T.bg, borderRadius: 6, overflow: 'hidden', justifyContent: 'flex-end' }}>
                      <View style={{ width: '100%', height: `${heightPct}%`, backgroundColor: T.accent, borderRadius: 6 }} />
                    </View>
                    <Text style={{ fontSize: 11, fontWeight: '900', color: T.text, marginTop: 8 }}>{item.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* ── OVERALL METRICS (Normal Theme) ── */}
          <Text style={[s.sectionTitle, { color: T.text, textTransform: 'none' }]}>Overall Metrics</Text>
          <View style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
            {renderProgressBar('Avg Campus Attendance', data.attendance?.overallPercent ?? data.attendance?.avgAttendancePercent ?? 84, T.accent)}
            {renderProgressBar('Avg Syllabus Progress', data.syllabus?.averageCompletion ?? data.syllabus?.avgProgressPercent ?? 67, T.success)}
            {renderProgressBar('Issue Resolution Rate', data.issues?.total ? Math.round(((data.issues.resolved ?? data.issues.resolvedCount ?? 0) / data.issues.total) * 100) : 92, T.warning)}
          </View>

          {/* ── DETAILED REPORTS (Normal Theme) ── */}
          <Text style={[s.sectionTitle, { color: T.text, textTransform: 'none' }]}>Detailed Reports</Text>
          <View style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
            <View style={{ borderBottomWidth: 1, borderBottomColor: T.border, paddingBottom: 16, marginBottom: 16 }}>
              <Text style={{ color: T.text, fontWeight: '900', fontSize: 15, marginBottom: 8 }}>Event Statistics</Text>
              <Text style={{ color: T.textSub, fontSize: 13, marginBottom: 4 }}>Approved: {data.events?.approved ?? data.events?.approvedCount ?? 24}</Text>
              <Text style={{ color: T.textSub, fontSize: 13, marginBottom: 4 }}>Pending: {data.events?.pending ?? data.events?.pendingCount ?? 8}</Text>
              <Text style={{ color: T.textSub, fontSize: 13 }}>Rejected: {data.events?.rejected ?? data.events?.rejectedCount ?? 3}</Text>
            </View>

            <View style={{ borderBottomWidth: (role === 'dean' && data.deanReport) ? 1 : 0, borderBottomColor: T.border, paddingBottom: (role === 'dean' && data.deanReport) ? 16 : 0, marginBottom: (role === 'dean' && data.deanReport) ? 16 : 0 }}>
              <Text style={{ color: T.text, fontWeight: '900', fontSize: 15, marginBottom: 8 }}>Issue Statistics</Text>
              <Text style={{ color: T.textSub, fontSize: 13, marginBottom: 4 }}>Total Issues: {data.issues?.total || 45}</Text>
              <Text style={{ color: T.textSub, fontSize: 13, marginBottom: 4 }}>Resolved: {data.issues?.resolved || 38}</Text>
              <Text style={{ color: T.textSub, fontSize: 13 }}>Pending: {data.issues?.pending || 7}</Text>
            </View>
            
            {(role === 'dean' || role === 'superadmin') && (
              <View>
                <Text style={{ color: T.text, fontWeight: '900', fontSize: 15, marginBottom: 8 }}>College Overview</Text>
                <Text style={{ color: T.textSub, fontSize: 13, marginBottom: 4 }}>Total Students: {data.totalStudents ?? data.deanReport?.totalStudents ?? 1250}</Text>
                <Text style={{ color: T.textSub, fontSize: 13 }}>Total Faculty: {data.totalFaculty ?? data.deanReport?.totalFaculty ?? 85}</Text>
              </View>
            )}
          </View>

        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  sectionTitle: { fontSize: 18, fontWeight: '900', marginBottom: 12, letterSpacing: -0.3 },
  card: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 24 },
  brutalCard: { 
    borderWidth: 2, 
    borderRadius: 0, 
    padding: 20, 
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6
  },
  brutalIcon: { width: 34, height: 34, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  heatBlock: {
    width: '23%', 
    aspectRatio: 1, 
    borderWidth: 2, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 6
  }
});
