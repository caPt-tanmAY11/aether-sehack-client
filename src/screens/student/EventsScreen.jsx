import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { eventsApi } from '../../api/events.api';
import { useAuthStore } from '../../store/auth.store';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/ThemeContext';
import AppHeader from '../../components/AppHeader';

export default function EventsScreen() {
  const { theme: T } = useTheme();
  const [activeTab, setActiveTab] = useState('approved');
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const role    = useAuthStore(state => state.role);
  const navigation = useNavigation();
  const canRaiseEvent = role === 'student' || role === 'council';

  useEffect(() => { fetchEvents(); }, [activeTab]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      if (activeTab === 'approved') {
        setEvents(await eventsApi.getApprovedEvents());
      } else {
        setMyEvents(await eventsApi.getMyRequests());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stagePalette = (stage) => {
    if (stage === 'approved') return { bg: `${T.success}18`, border: `${T.success}50`, text: T.success };
    if (stage === 'rejected') return { bg: `${T.error}18`, border: `${T.error}50`, text: T.error };
    return { bg: `${T.warning}18`, border: `${T.warning}50`, text: T.warning };
  };

  return (
    <View style={[s.root, { backgroundColor: T.bg }]}>
      <AppHeader title="Events" showBack={false} />

      {/* Tab Switcher */}
      <View style={[s.tabBar, { backgroundColor: T.card, borderColor: T.border }]}>
        <TouchableOpacity
          onPress={() => setActiveTab('approved')}
          style={[s.tab, activeTab === 'approved' && { backgroundColor: T.accent }]}
          activeOpacity={0.8}
        >
          <Text style={[s.tabText, { color: activeTab === 'approved' ? '#ffffff' : T.muted }]}>Upcoming</Text>
        </TouchableOpacity>
        {canRaiseEvent && (
          <TouchableOpacity
            onPress={() => setActiveTab('mine')}
            style={[s.tab, activeTab === 'mine' && { backgroundColor: T.accent }]}
            activeOpacity={0.8}
          >
            <Text style={[s.tabText, { color: activeTab === 'mine' ? '#ffffff' : T.muted }]}>My Requests</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={T.accent} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll}>
          {activeTab === 'approved' ? (
            events.length === 0 ? (
              <View style={s.empty}>
                <Ionicons name="calendar-outline" size={48} color={T.muted} />
                <Text style={[s.emptyText, { color: T.muted }]}>No upcoming events available</Text>
              </View>
            ) : (
              events.map((event, i) => (
                <View key={i} style={[s.eventCard, { backgroundColor: T.card, borderColor: T.border }]}>
                  <View style={[s.eventBar, { backgroundColor: T.accent }]} />
                  <View style={s.eventBody}>
                    <Text style={[s.eventTitle, { color: T.text }]}>{event.title}</Text>
                    <View style={s.eventMeta}>
                      <Ionicons name="time-outline" size={12} color={T.muted} />
                      <Text style={[s.eventMetaText, { color: T.muted }]}>
                        {new Date(event.startTime).toLocaleString()} · {event.venue}
                      </Text>
                    </View>
                    <Text style={[s.eventDesc, { color: T.textSub }]}>{event.description}</Text>
                  </View>
                </View>
              ))
            )
          ) : (
            myEvents.length === 0 ? (
              <View style={s.empty}>
                <Ionicons name="document-outline" size={48} color={T.muted} />
                <Text style={[s.emptyText, { color: T.muted }]}>You haven't requested any events.</Text>
              </View>
            ) : (
              myEvents.map((event, i) => {
                const palette = stagePalette(event.currentStage);
                return (
                  <View key={i} style={[s.eventCard, { backgroundColor: T.card, borderColor: T.border }]}>
                    <View style={[s.eventBar, { backgroundColor: palette.text }]} />
                    <View style={s.eventBody}>
                      <View style={s.eventTitleRow}>
                        <Text style={[s.eventTitle, { color: T.text, flex: 1, marginRight: 8 }]}>{event.title}</Text>
                        <View style={[s.stageBadge, { backgroundColor: palette.bg, borderColor: palette.border }]}>
                          <Text style={[s.stageText, { color: palette.text }]}>{event.currentStage}</Text>
                        </View>
                      </View>
                      <View style={s.eventMeta}>
                        <Ionicons name="time-outline" size={12} color={T.muted} />
                        <Text style={[s.eventMetaText, { color: T.muted }]}>
                          {new Date(event.startTime).toLocaleString()} · {event.venue}
                        </Text>
                      </View>
                      {event.documentUrl && (
                        <View style={[s.docRow, { backgroundColor: T.iconBg, borderColor: T.border }]}>
                          <Ionicons name="document-text" size={14} color={T.muted} />
                          <Text style={[s.docText, { color: T.muted }]}>Approval Doc Generated</Text>
                        </View>
                      )}
                      {event.conflictResult?.probability && (
                        <View style={s.aiRow}>
                          <Ionicons name="trending-up" size={13} color={T.accent} />
                          <Text style={[s.aiText, { color: T.accent }]}>
                            {event.conflictResult.probability}% AI Approval Confidence
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )
          )}
        </ScrollView>
      )}

      {/* FAB — above dock */}
      {canRaiseEvent && activeTab === 'approved' && (
        <TouchableOpacity
          style={[s.fab, { backgroundColor: T.accent }]}
          onPress={() => navigation.navigate('EventSubmission')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color="#ffffff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 160 },

  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
    borderRadius: 16,
    borderWidth: 2,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabText: { fontSize: 13, fontWeight: '800' },

  empty:     { alignItems: 'center', paddingTop: 48, gap: 14 },
  emptyText: { fontSize: 15, fontWeight: '700' },

  eventCard: {
    borderRadius: 18,
    borderWidth: 2,
    marginBottom: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 0,
    elevation: 3,
  },
  eventBar:  { width: 4 },
  eventBody: { flex: 1, padding: 14 },

  eventTitleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  eventTitle: { fontSize: 16, fontWeight: '900', letterSpacing: -0.3, marginBottom: 6 },
  eventMeta:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  eventMetaText: { fontSize: 12, fontWeight: '600' },
  eventDesc:  { fontSize: 13, lineHeight: 18 },

  stageBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, borderWidth: 1.5,
  },
  stageText: { fontSize: 10, fontWeight: '800', textTransform: 'capitalize' },

  docRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    padding: 8, borderRadius: 10, borderWidth: 1, marginTop: 8,
  },
  docText: { fontSize: 12, fontWeight: '600' },

  aiRow:   { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  aiText:  { fontSize: 12, fontWeight: '700' },

  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});
