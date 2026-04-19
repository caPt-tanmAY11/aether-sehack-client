import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { apiClient } from '../../api/client';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/ThemeContext';

export default function BatchesScreen() {
  const { theme: T } = useTheme();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBatches(); }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/batches/student');
      setBatches(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[s.center, { backgroundColor: T.bg }]}>
        <ActivityIndicator color={T.accent} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={[s.root, { backgroundColor: T.bg }]} contentContainerStyle={s.scroll}>
      <Text style={[s.pageTitle, { color: T.text }]}>My Batches</Text>

      {batches.length === 0 ? (
        <View style={s.empty}>
          <View style={[s.emptyIcon, { backgroundColor: T.accentSoft, borderColor: T.accent }]}>
            <Ionicons name="people-outline" size={32} color={T.accent} />
          </View>
          <Text style={[s.emptyTitle, { color: T.text }]}>No Batches Yet</Text>
          <Text style={[s.emptyText, { color: T.muted }]}>You are not assigned to any batches yet.</Text>
        </View>
      ) : (
        batches.map((batch) => (
          <View key={batch._id} style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
            {/* Accent stripe + icon */}
            <View style={s.cardTop}>
              <View style={[s.batchIcon, { backgroundColor: T.accentSoft, borderColor: T.accent }]}>
                <Ionicons name="people" size={22} color={T.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.batchName, { color: T.text }]}>{batch.name}</Text>
                <View style={s.batchMetaRow}>
                  <View style={[s.badge, { backgroundColor: T.accentSoft, borderColor: T.accent }]}>
                    <Text style={[s.badgeText, { color: T.accent }]}>Sem {batch.semester}</Text>
                  </View>
                  <View style={[s.badge, { backgroundColor: T.iconBg, borderColor: T.border }]}>
                    <Text style={[s.badgeText, { color: T.textSub }]}>Div {batch.division}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={[s.divider, { backgroundColor: T.border }]} />

            <View style={s.detailsRow}>
              <View style={s.detailItem}>
                <Ionicons name="person-outline" size={14} color={T.muted} />
                <Text style={[s.detailLabel, { color: T.muted }]}>Faculty</Text>
                <Text style={[s.detailValue, { color: T.text }]}>{batch.facultyId?.name || 'TBA'}</Text>
              </View>
              <View style={s.detailItem}>
                <Ionicons name="calendar-outline" size={14} color={T.muted} />
                <Text style={[s.detailLabel, { color: T.muted }]}>Academic Year</Text>
                <Text style={[s.detailValue, { color: T.text }]}>{batch.academicYear}</Text>
              </View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 160 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  pageTitle: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5, marginBottom: 20 },

  empty:     { alignItems: 'center', paddingTop: 48, gap: 12 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2,
  },
  emptyTitle: { fontSize: 20, fontWeight: '900' },
  emptyText:  { fontSize: 13, textAlign: 'center' },

  card: {
    borderRadius: 20, borderWidth: 2, padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 0, elevation: 3,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 14 },

  batchIcon: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2,
  },
  batchName:    { fontSize: 17, fontWeight: '900', letterSpacing: -0.3, marginBottom: 8 },
  batchMetaRow: { flexDirection: 'row', gap: 8 },
  badge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1.5,
  },
  badgeText: { fontSize: 11, fontWeight: '800' },

  divider: { height: 1.5, marginBottom: 14 },

  detailsRow: { flexDirection: 'row', gap: 16 },
  detailItem: { flex: 1, gap: 2 },
  detailLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  detailValue: { fontSize: 14, fontWeight: '800', letterSpacing: -0.2 },
});
