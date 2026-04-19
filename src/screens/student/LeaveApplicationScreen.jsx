import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { leaveApi } from '../../api/leave.api';
import { apiClient } from '../../api/client';
import CalendarPicker from '../../components/CalendarPicker';
import { handleViewPdf } from '../../utils/pdf';
import { useTheme } from '../../hooks/ThemeContext';
import AppHeader from '../../components/AppHeader';

const LEAVE_TYPES = ['medical', 'personal', 'family', 'other'];
const STATUS_COLOR = { pending: '#f59e0b', approved: '#22c55e', rejected: '#ef4444' };

export default function LeaveApplicationScreen() {
  const navigation = useNavigation();
  const { theme: T } = useTheme();
  const [faculty, setFaculty] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveType, setLeaveType] = useState('personal');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [fRes, lRes] = await Promise.all([
        apiClient.get('/auth/users', { params: { role: 'faculty' } }).catch(() => ({ data: { data: [] } })),
        leaveApi.studentMyLeaves().catch(() => [])
      ]);
      setFaculty(fRes.data?.data || []);
      setMyLeaves(lRes || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!selectedFaculty || !fromDate || !toDate || !reason.trim()) {
      Alert.alert('Incomplete', 'Please fill in all fields.');
      return;
    }
    setSubmitting(true);
    try {
      await leaveApi.studentApply({ facultyId: selectedFaculty._id, fromDate, toDate, reason: reason.trim(), leaveType });
      Alert.alert('✅ Submitted', 'Leave application submitted!');
      setShowForm(false);
      setFromDate(''); setToDate(''); setReason(''); setSelectedFaculty(null);
      fetchAll();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to submit leave');
    } finally { setSubmitting(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="Leave Application" showBack />

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={T.accent} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

          {/* Apply button */}
          <TouchableOpacity
            onPress={() => setShowForm(!showForm)}
            style={[s.applyBtn, { backgroundColor: T.accent }]}
            activeOpacity={0.85}
          >
            <Ionicons name={showForm ? 'chevron-up' : 'add-circle-outline'} size={20} color="#fff" />
            <Text style={s.applyBtnText}>{showForm ? 'Collapse Form' : 'Apply for Leave'}</Text>
          </TouchableOpacity>

          {/* Leave Form */}
          {showForm && (
            <View style={[s.formCard, { backgroundColor: T.card, borderColor: T.border }]}>

              {/* Select Faculty */}
              <Text style={[s.label, { color: T.muted }]}>Select Faculty</Text>
              <View style={[s.listBox, { backgroundColor: T.bg, borderColor: T.border }]}>
                {faculty.length === 0 ? (
                  <Text style={{ color: T.muted, padding: 12, fontSize: 13 }}>No faculty found.</Text>
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
                      <View style={[s.facultyAvatar, { backgroundColor: `${T.accent}20` }]}>
                        <Text style={{ color: T.accent, fontWeight: '900', fontSize: 13 }}>
                          {f.name?.[0]?.toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: selectedFaculty?._id === f._id ? T.accent : T.text, fontWeight: '700', fontSize: 14 }}>
                          {f.name}
                        </Text>
                        <Text style={{ color: T.muted, fontSize: 12 }}>{f.departmentId?.name}</Text>
                      </View>
                      {selectedFaculty?._id === f._id && (
                        <Ionicons name="checkmark-circle" size={20} color={T.accent} />
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </View>

              {/* Leave Type */}
              <Text style={[s.label, { color: T.muted }]}>Leave Type</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {LEAVE_TYPES.map(lt => (
                  <TouchableOpacity
                    key={lt}
                    onPress={() => setLeaveType(lt)}
                    style={[
                      s.typePill,
                      {
                        backgroundColor: leaveType === lt ? T.accent : T.bg,
                        borderColor: leaveType === lt ? T.accent : T.border,
                      },
                    ]}
                  >
                    <Text style={{
                      fontSize: 12, fontWeight: '800', textTransform: 'capitalize',
                      color: leaveType === lt ? '#ffffff' : T.muted,
                    }}>{lt}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Date pickers */}
              <CalendarPicker label="From Date" value={fromDate} onChange={setFromDate} />
              <CalendarPicker label="To Date" value={toDate} onChange={setToDate} />

              {/* Reason */}
              <Text style={[s.label, { color: T.muted }]}>Reason</Text>
              <TextInput
                style={[s.textArea, { backgroundColor: T.bg, color: T.text, borderColor: T.border }]}
                placeholder="Describe your reason..."
                placeholderTextColor={T.muted}
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={3}
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
                  : <Text style={s.submitBtnText}>Submit Application</Text>
                }
              </TouchableOpacity>
            </View>
          )}

          {/* Leave History */}
          <Text style={[s.sectionTitle, { color: T.text }]}>My Leave History</Text>
          {myLeaves.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Ionicons name="document-text-outline" size={40} color={T.muted} />
              <Text style={{ color: T.muted, marginTop: 10, fontWeight: '600' }}>No leave applications yet.</Text>
            </View>
          ) : (
            myLeaves.map((lv, i) => (
              <View key={i} style={[s.historyCard, { backgroundColor: T.card, borderColor: T.border }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: T.text, fontWeight: '900', fontSize: 15, textTransform: 'capitalize' }}>
                      {lv.leaveType} Leave
                    </Text>
                    <View style={[s.statusPill, { backgroundColor: `${STATUS_COLOR[lv.status]}20`, borderColor: STATUS_COLOR[lv.status] }]}>
                      <Text style={{ color: STATUS_COLOR[lv.status], fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }}>
                        {lv.status}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      handleViewPdf(`/leave/student/${lv._id}/pdf`, `Student_Leave_${lv._id}`)
                        .catch(err => Alert.alert('Error', err.message))
                    }
                    style={[s.pdfBtn, { backgroundColor: T.iconBg, borderColor: T.border }]}
                  >
                    <Ionicons name="document-text-outline" size={18} color={T.accent} />
                  </TouchableOpacity>
                </View>
                <Text style={{ color: T.muted, fontSize: 12, marginBottom: 4 }}>To: {lv.facultyId?.name}</Text>
                <Text style={{ color: T.textSub, fontSize: 13, marginBottom: 6 }}>{lv.reason}</Text>
                <Text style={{ color: T.muted, fontSize: 12 }}>
                  {new Date(lv.fromDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  {' → '}
                  {new Date(lv.toDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </Text>
                {lv.remarks && (
                  <Text style={{ color: T.muted, fontSize: 12, marginTop: 4, fontStyle: 'italic' }}>Remarks: {lv.remarks}</Text>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  applyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 16, marginBottom: 16,
  },
  applyBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },

  formCard: {
    borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 24,
  },
  label: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  listBox: { borderRadius: 14, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  facultyRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, gap: 12,
  },
  facultyAvatar: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
  },
  typePill: {
    borderRadius: 999, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 6,
  },
  textArea: {
    borderRadius: 12, borderWidth: 1, padding: 12, fontSize: 14,
    minHeight: 80, marginBottom: 16,
  },
  submitBtn: {
    borderRadius: 14, paddingVertical: 14, alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },

  sectionTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.4, marginBottom: 14 },
  historyCard: {
    borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 12,
  },
  statusPill: {
    alignSelf: 'flex-start', borderRadius: 999, borderWidth: 1,
    paddingHorizontal: 8, paddingVertical: 2, marginTop: 4,
  },
  pdfBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
});
