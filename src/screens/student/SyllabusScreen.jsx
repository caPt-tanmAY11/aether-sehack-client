import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { syllabusApi } from '../../api/syllabus.api';
import { useAuthStore } from '../../store/auth.store';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../hooks/ThemeContext';
import AppHeader from '../../components/AppHeader';

export default function SyllabusScreen() {
  const { theme: T } = useTheme();
  const [syllabusData, setSyllabusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const user = useAuthStore(state => state.user);

  useFocusEffect(useCallback(() => { fetchSyllabus(); }, []));

  const fetchSyllabus = async () => {
    try {
      setLoading(true);
      const currentYear = new Date().getFullYear();
      const academicYear = `${currentYear}-${currentYear + 1}`;
      const data = await syllabusApi.getMySummary(user?.semester, academicYear);
      setSyllabusData(data || []);
    } catch (err) {
      console.error('Syllabus fetch error:', err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  if (loading) {
    return (
      <View style={[s.center, { backgroundColor: T.bg }]}>
        <ActivityIndicator color={T.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="Syllabus" showBack={false} />
      <ScrollView style={[s.root, { backgroundColor: T.bg }]} contentContainerStyle={s.scroll}>

      {/* Subtitle */}
      <Text style={[s.pageSub, { color: T.muted }]}>
        Semester {user?.semester || '?'} · {user?.departmentId?.name || 'Your Department'}
      </Text>

      {syllabusData.length === 0 ? (
        <View style={s.empty}>
          <View style={[s.emptyIcon, { backgroundColor: T.accentSoft, borderColor: T.accent }]}>
            <Ionicons name="book-outline" size={32} color={T.accent} />
          </View>
          <Text style={[s.emptyTitle, { color: T.text }]}>No Syllabus Data</Text>
          <Text style={[s.emptyText, { color: T.muted }]}>
            Your faculty hasn't set up syllabus trackers yet for Semester {user?.semester}.
          </Text>
        </View>
      ) : (
        (() => {
          // Group trackers by subject
          const grouped = syllabusData.reduce((acc, tracker) => {
            const sid = tracker.subjectId?._id || 'unknown';
            if (!acc[sid]) {
              acc[sid] = {
                subjectId: sid,
                subjectName: tracker.subjectId?.name || 'Unknown Subject',
                subjectCode: tracker.subjectId?.code || '',
                trackers: []
              };
            }
            acc[sid].trackers.push(tracker);
            return acc;
          }, {});

          const subjects = Object.values(grouped);

          return subjects.map((subj, index) => {
            const subjId = subj.subjectId !== 'unknown' ? subj.subjectId : index;
            const isExpanded = expanded[subjId];
            
            // Calculate overall progress across all trackers for this subject
            const total = subj.trackers.reduce((sum, tr) => sum + (tr.topics?.length || 0), 0);
            const done = subj.trackers.reduce((sum, tr) => sum + (tr.topics?.filter(t => t.status === 'done').length || 0), 0);
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const barColor = pct >= 75 ? T.success : pct >= 40 ? T.warning : T.accent;

            // Gather all faculties involved in this subject
            const facultyNames = [...new Set(subj.trackers.map(tr => tr.facultyId?.name).filter(Boolean))].join(', ');

            return (
              <TouchableOpacity
                key={subjId}
                onPress={() => toggle(subjId)}
                activeOpacity={0.8}
                style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}
              >
                {/* Card Header */}
                <View style={s.cardTop}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={[s.subjectName, { color: T.text }]}>{subj.subjectName}</Text>
                    <Text style={[s.subjectMeta, { color: T.muted }]}>
                      {subj.subjectCode} · Taught by Prof. {facultyNames || 'Unknown'}
                    </Text>
                  </View>
                  <View style={[s.pctRing, { borderColor: barColor }]}>
                    <Text style={[s.pctText, { color: barColor }]}>{pct}%</Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={[s.progressBg, { backgroundColor: T.iconBg }]}>
                  <View style={[s.progressFill, { width: `${pct}%`, backgroundColor: barColor }]} />
                </View>

                <View style={s.cardMeta}>
                  <Text style={[s.metaText, { color: T.muted }]}>{done}/{total} topics</Text>
                  <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={T.muted} />
                </View>

                {/* Accordion */}
                {isExpanded && total > 0 && (
                  <View style={[s.accordion, { borderTopColor: T.border }]}>
                    {subj.trackers.map(tracker => 
                      (tracker.topics || []).map((topic, ti) => (
                        <View key={`${tracker._id}-${topic._id || ti}`} style={[s.topicRow, { borderBottomColor: T.border }]}>
                          <View style={[
                            s.topicDot,
                            { backgroundColor: topic.status === 'done' ? T.success : T.iconBg,
                              borderColor: topic.status === 'done' ? T.success : T.border },
                          ]}>
                            {topic.status === 'done' && (
                              <Ionicons name="checkmark" size={10} color="#ffffff" />
                            )}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[s.topicName, { color: topic.status === 'done' ? T.text : T.textSub }]}>
                              {topic.name}
                            </Text>
                            <Text style={{ color: T.accent, fontSize: 11, fontWeight: '700', marginTop: 2 }}>
                              Module by Prof. {tracker.facultyId?.name || 'Unknown'}
                            </Text>
                            {topic.completedAt && (
                              <Text style={[s.topicDate, { color: T.muted }]}>
                                Done {new Date(topic.completedAt).toLocaleDateString()}
                              </Text>
                            )}
                            {topic.notes && (
                              <Text style={[s.topicNotes, { color: T.muted }]}>{topic.notes}</Text>
                            )}
                          </View>
                        </View>
                      ))
                    )}
                  </View>
                )}

                {isExpanded && total === 0 && (
                  <View style={[s.accordion, { borderTopColor: T.border }]}>
                    <Text style={[s.emptyText, { color: T.muted, textAlign: 'center' }]}>No topics defined yet.</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          });
        })()
      )}
    </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 160 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  pageTitle: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5, marginBottom: 4 },
  pageSub:   { fontSize: 13, fontWeight: '600', marginBottom: 24 },

  empty:     { alignItems: 'center', paddingTop: 48, gap: 12 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2,
  },
  emptyTitle: { fontSize: 20, fontWeight: '900' },
  emptyText:  { fontSize: 13, textAlign: 'center', lineHeight: 20 },

  card: {
    borderRadius: 20,
    borderWidth: 2,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 0,
    elevation: 3,
  },
  cardTop:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  subjectName: { fontSize: 16, fontWeight: '900', letterSpacing: -0.3, marginBottom: 4 },
  subjectMeta: { fontSize: 12, fontWeight: '600' },

  pctRing: {
    width: 52, height: 52, borderRadius: 26,
    borderWidth: 3, alignItems: 'center', justifyContent: 'center',
  },
  pctText: { fontSize: 13, fontWeight: '900' },

  progressBg:   { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 10 },
  progressFill: { height: '100%', borderRadius: 3 },

  cardMeta:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaText:  { fontSize: 11, fontWeight: '700' },

  accordion: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: 12, paddingTop: 12 },

  topicRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  topicDot: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginTop: 2,
  },
  topicName:  { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  topicDate:  { fontSize: 11, marginTop: 2 },
  topicNotes: { fontSize: 11, marginTop: 2, fontStyle: 'italic' },
});
