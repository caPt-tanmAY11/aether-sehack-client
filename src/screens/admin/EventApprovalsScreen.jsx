import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { eventsApi } from '../../api/events.api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { handleViewPdf } from '../../utils/pdf';
import { useTheme } from '../../hooks/ThemeContext';
import AppHeader from '../../components/AppHeader';

export default function EventApprovalsScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { theme: T } = useTheme();

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.getPending();
      setEvents(data || []);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch pending events');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    try {
      setLoading(true);
      await eventsApi.review(id, status, `Reviewed as ${status}`);
      Alert.alert('Success', `Event ${status}`);
      fetchPending();
    } catch (err) {
      Alert.alert('Error', 'Failed to review event');
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="Event Approvals" showBack />

      {loading && events.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={T.accent} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          {events.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Ionicons name="checkmark-done-circle-outline" size={56} color={T.muted} />
              <Text style={{ color: T.text, fontSize: 18, fontWeight: '900', marginTop: 16 }}>All Caught Up</Text>
              <Text style={{ color: T.muted, textAlign: 'center', marginTop: 8 }}>
                No pending events requiring your approval.
              </Text>
            </View>
          ) : (
            events.map((ev, i) => (
              <View key={i} style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={{ color: T.text, fontWeight: '900', fontSize: 16 }}>{ev.title}</Text>
                    <Text style={{ color: T.muted, fontSize: 12, marginTop: 4 }}>
                      {ev.requestedBy?.name || 'Unknown'} • {new Date(ev.startTime).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[s.badge, { backgroundColor: `${T.warning}20`, borderColor: `${T.warning}50` }]}>
                      <Text style={{ color: T.warning, fontSize: 10, fontWeight: '900', textTransform: 'capitalize' }}>
                        {ev.currentStage} Stage
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => {
                      handleViewPdf(`/events/${ev._id}/pdf`, `Event_Request_${ev._id}`).catch(err => Alert.alert('Error', err.message));
                    }} style={[s.pdfBtn, { backgroundColor: T.iconBg, borderColor: T.border }]}>
                      <Ionicons name="document-text-outline" size={20} color={T.accent} />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <Text style={{ color: T.textSub, fontSize: 13, lineHeight: 18, marginBottom: 16 }}>
                  {ev.description}
                </Text>

                {ev.conflictChecked && ev.conflictResult?.msg && (
                  <View style={[s.conflictBox, { backgroundColor: T.bg, borderColor: T.border }]}>
                    <Ionicons 
                      name={ev.conflictResult.msg.includes('Conflict') ? "warning" : "checkmark-circle"} 
                      size={18} 
                      color={ev.conflictResult.msg.includes('Conflict') ? T.warning : T.success} 
                    />
                    <Text style={{ color: T.textSub, fontSize: 12, flex: 1, marginLeft: 8 }}>
                      {ev.conflictResult.msg}
                    </Text>
                  </View>
                )}

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity 
                    onPress={() => handleReview(ev._id, 'rejected')}
                    style={[s.actionBtn, { flex: 1, backgroundColor: T.bg, borderColor: `${T.error}50` }]}
                  >
                    <Text style={{ color: T.error, fontWeight: '900' }}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleReview(ev._id, 'approved')}
                    style={[s.actionBtn, { flex: 1, backgroundColor: T.accent, borderColor: T.accent }]}
                  >
                    <Text style={{ color: '#fff', fontWeight: '900' }}>Approve</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, marginRight: 10,
  },
  pdfBtn: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  conflictBox: {
    flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 16,
  },
  actionBtn: {
    paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
});
