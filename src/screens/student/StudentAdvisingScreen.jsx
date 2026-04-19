import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { advisingApi } from '../../api/advising.api';
import { apiClient } from '../../api/client';
import { useTheme } from '../../hooks/ThemeContext';
import AppHeader from '../../components/AppHeader';

const STATUS_CONFIG = {
  pending:      { color: '#f59e0b', label: 'Pending',      icon: 'time-outline' },
  acknowledged: { color: '#6366f1', label: 'Acknowledged', icon: 'eye-outline' },
  done:         { color: '#22c55e', label: 'Done',         icon: 'checkmark-circle-outline' },
  rejected:     { color: '#ef4444', label: 'Rejected',     icon: 'close-circle-outline' },
};

export default function StudentAdvisingScreen() {
  const navigation = useNavigation();
  const { theme: T } = useTheme();
  const [faculty, setFaculty] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [facultyRes, requestsRes] = await Promise.all([
        apiClient.get('/auth/users').catch(() => ({ data: { data: [] } })),
        advisingApi.getMyRequests().catch(() => [])
      ]);
      const availableFaculty = (facultyRes.data?.data || []).filter(u => ['faculty', 'hod', 'dean'].includes(u.role));
      setFaculty(availableFaculty);
      setMyRequests(requestsRes || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!selectedFaculty || !message.trim()) {
      Alert.alert('Incomplete', 'Please select a faculty and write a message.');
      return;
    }
    setSubmitting(true);
    try {
      await advisingApi.createRequest({ facultyId: selectedFaculty._id, message: message.trim() });
      Alert.alert('✅ Success', 'Your advising request has been submitted!');
      setShowForm(false);
      setMessage('');
      setSelectedFaculty(null);
      fetchAll();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to submit request');
    } finally { setSubmitting(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="Faculty Advising" showBack />

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={T.accent} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

          {/* Hero info card */}
          <View style={[s.infoBanner, { backgroundColor: `${T.accent}12`, borderColor: `${T.accent}30` }]}>
            <View style={[s.infoBannerIcon, { backgroundColor: `${T.accent}20` }]}>
              <Ionicons name="school-outline" size={22} color={T.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: T.text, fontWeight: '800', fontSize: 14 }}>Request Faculty Advising</Text>
              <Text style={{ color: T.muted, fontSize: 12, marginTop: 2 }}>
                Book a session with your faculty advisor to discuss academic progress, issues or guidance.
              </Text>
            </View>
          </View>

          {/* Toggle form button */}
          <TouchableOpacity
            onPress={() => setShowForm(!showForm)}
            style={[s.newRequestBtn, { backgroundColor: T.accent }]}
            activeOpacity={0.85}
          >
            <Ionicons name={showForm ? 'chevron-up-outline' : 'add-circle-outline'} size={20} color="#fff" />
            <Text style={s.newRequestBtnText}>{showForm ? 'Hide Form' : 'New Advising Request'}</Text>
          </TouchableOpacity>

          {/* Request Form */}
          {showForm && (
            <View style={[s.formCard, { backgroundColor: T.card, borderColor: T.border }]}>

              <Text style={[s.formTitle, { color: T.text }]}>Book a Session</Text>
              <Text style={[s.formSub, { color: T.muted }]}>Select a faculty member and describe what you'd like to discuss.</Text>

              {/* Faculty Picker */}
              <Text style={[s.label, { color: T.muted }]}>Choose Faculty</Text>
              <View style={[s.listBox, { backgroundColor: T.bg, borderColor: T.border }]}>
                {faculty.length === 0 ? (
                  <Text style={{ color: T.muted, padding: 12, fontSize: 13 }}>No faculty available.</Text>
                ) : (
                  faculty.map((f, i) => (
                    <TouchableOpacity
                      key={f._id || i}
                      onPress={() => setSelectedFaculty(f)}
                      style={[
                        s.facultyRow,
                        {
                          borderBottomWidth: i < faculty.length - 1 ? StyleSheet.hairlineWidth : 0,
                          borderBottomColor: T.border,
                          backgroundColor: selectedFaculty?._id === f._id ? `${T.accent}14` : 'transparent',
                        },
                      ]}
                    >
                      <View style={[s.avatar, { backgroundColor: `${T.accent}20` }]}>
                        <Text style={{ color: T.accent, fontWeight: '900', fontSize: 14 }}>
                          {f.name?.[0]?.toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: selectedFaculty?._id === f._id ? T.accent : T.text, fontWeight: '800', fontSize: 14 }}>
                          {f.name}
                        </Text>
                        <Text style={{ color: T.muted, fontSize: 12 }}>{f.departmentId?.name || 'Faculty'}</Text>
                      </View>
                      {selectedFaculty?._id === f._id && (
                        <Ionicons name="checkmark-circle" size={20} color={T.accent} />
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </View>

              {/* Message */}
              <Text style={[s.label, { color: T.muted }]}>Your Message</Text>
              <TextInput
                style={[s.textArea, { backgroundColor: T.bg, color: T.text, borderColor: T.border }]}
                placeholder="What would you like to discuss? (e.g. project guidance, academic issues, career advice...)"
                placeholderTextColor={T.muted}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {/* Submit */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={submitting}
                style={[s.submitBtn, { backgroundColor: T.accent, opacity: submitting ? 0.7 : 1 }]}
                activeOpacity={0.85}
              >
                {submitting
                  ? <ActivityIndicator color="#fff" />
                  : <>
                      <Ionicons name="paper-plane-outline" size={18} color="#fff" />
                      <Text style={s.submitBtnText}>Send Request</Text>
                    </>
                }
              </TouchableOpacity>
            </View>
          )}

          {/* My Requests */}
          <Text style={[s.sectionTitle, { color: T.text }]}>My Requests</Text>
          {myRequests.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Ionicons name="chatbubble-outline" size={44} color={T.muted} />
              <Text style={{ color: T.muted, marginTop: 12, fontWeight: '600', textAlign: 'center' }}>
                No advising requests yet.{'\n'}Tap the button above to get started.
              </Text>
            </View>
          ) : (
            myRequests.map((req, i) => {
              const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
              return (
                <View key={req._id || i} style={[s.requestCard, { backgroundColor: T.card, borderColor: T.border }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={{ color: T.text, fontWeight: '900', fontSize: 15 }}>
                        {req.facultyId?.name || 'Faculty'}
                      </Text>
                      <Text style={{ color: T.muted, fontSize: 12 }}>{req.facultyId?.departmentId?.name}</Text>
                    </View>
                    <View style={[s.statusBadge, { backgroundColor: `${cfg.color}18`, borderColor: cfg.color }]}>
                      <Ionicons name={cfg.icon} size={11} color={cfg.color} />
                      <Text style={{ color: cfg.color, fontSize: 10, fontWeight: '900', marginLeft: 4 }}>
                        {cfg.label}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: T.textSub, fontSize: 13, lineHeight: 18, marginBottom: 8 }}>{req.message}</Text>
                  {req.facultyReply && (
                    <View style={[s.responseBanner, { backgroundColor: `${T.success}10`, borderColor: `${T.success}30` }]}>
                      <Ionicons name="chatbubble-outline" size={12} color={T.success} />
                      <Text style={{ color: T.success, fontSize: 12, fontWeight: '700', flex: 1, marginLeft: 6 }}>
                        {req.facultyReply}
                      </Text>
                    </View>
                  )}
                  <Text style={{ color: T.muted, fontSize: 11, marginTop: 4 }}>
                    {new Date(req.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 16,
  },
  infoBannerIcon: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  newRequestBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 16, marginBottom: 16,
  },
  newRequestBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },

  formCard: {
    borderRadius: 20, borderWidth: 1, padding: 18, marginBottom: 24,
  },
  formTitle: { fontSize: 20, fontWeight: '900', marginBottom: 4 },
  formSub:   { fontSize: 13, marginBottom: 20 },
  label:     { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 },

  listBox: { borderRadius: 14, borderWidth: 1, overflow: 'hidden', marginBottom: 18 },
  facultyRow: {
    flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12,
  },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  textArea: {
    borderRadius: 12, borderWidth: 1, padding: 12,
    fontSize: 14, minHeight: 100, marginBottom: 16,
  },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 14, paddingVertical: 14,
  },
  submitBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },

  sectionTitle: { fontSize: 20, fontWeight: '900', marginBottom: 14 },
  requestCard: {
    borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 999, borderWidth: 1,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  responseBanner: {
    flexDirection: 'row', alignItems: 'flex-start',
    borderRadius: 10, borderWidth: 1, padding: 10, marginBottom: 4,
  },
});
