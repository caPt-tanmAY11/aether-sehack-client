import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  Alert, Modal, StyleSheet, Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../hooks/ThemeContext';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/auth.store';

// ── Helpers ────────────────────────────────────────────────────────────────

const STAGE_ORDER = ['council', 'hod', 'dean', 'approved'];

function stageLabel(stage) {
  const map = {
    council:  'Student Council',
    hod:      'Head of Department',
    dean:     'Dean',
    approved: 'Final Approval',
    rejected: 'Rejected',
  };
  return map[stage] || stage;
}

function stageIcon(stage) {
  if (stage === 'approved') return 'checkmark-circle';
  if (stage === 'rejected') return 'close-circle';
  return 'time-outline';
}

function fmt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

function durFmt(start, end) {
  if (!start || !end) return '—';
  const s = new Date(start), e = new Date(end);
  return `${s.toLocaleDateString([], { dateStyle: 'medium' })}  ${s.toLocaleTimeString([], { timeStyle: 'short' })} – ${e.toLocaleTimeString([], { timeStyle: 'short' })}`;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function EventDetailScreen() {
  const { theme: T } = useTheme();
  const nav          = useNavigation();
  const route        = useRoute();
  const role         = useAuthStore(s => s.role);

  // Accept event passed directly OR just eventId for lazy loading
  const { event: passedEvent, eventId: passedId } = route.params || {};

  const [event,      setEvent]      = useState(passedEvent || null);
  const [loading,    setLoading]    = useState(!passedEvent);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfModal,   setPdfModal]   = useState(false);   // modal to show raw base64 info
  const [pdfData,    setPdfData]    = useState(null);    // base64 string

  const eventId = passedEvent?._id || passedId;

  // ── Load event detail if not passed ─────────────────────────────────────
  const loadEvent = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      // Use /events/me if student (only shows own), else check /events/:id via admin approvals
      // We try a generic detail fetch; server guards access by role
      const res = await apiClient.get(`/events/${eventId}/detail`);
      setEvent(res.data.data);
    } catch {
      // Fallback: use the passed event object if API isn't available
      if (!event) Alert.alert('Error', 'Could not load event details.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (!passedEvent && eventId) loadEvent();
  }, [eventId]);

  // ── PDF Download ─────────────────────────────────────────────────────────
  const handleDownloadPdf = async () => {
    if (!eventId) return;
    try {
      setPdfLoading(true);
      const res = await apiClient.get(`/events/${eventId}/pdf`);
      const base64 = res.data?.data;
      if (!base64) throw new Error('No PDF data received');
      setPdfData(base64);
      setPdfModal(true);
    } catch (err) {
      Alert.alert('PDF Error', err?.response?.data?.message || err.message || 'Could not generate PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  // ── Chain rendering ──────────────────────────────────────────────────────
  const renderChainStep = (step, idx) => {
    const isApproved = step.status === 'approved';
    const isRejected = step.status === 'rejected';
    const dotColor   = isApproved ? T.success : isRejected ? T.error : T.warning;

    return (
      <View key={idx} style={s.chainStep}>
        {/* Connector line */}
        {idx > 0 && <View style={[s.chainLine, { backgroundColor: T.border }]} />}
        {/* Dot */}
        <View style={[s.chainDot, { backgroundColor: dotColor }]}>
          <Ionicons name={stageIcon(step.status)} size={14} color="#fff" />
        </View>
        {/* Content */}
        <View style={[s.chainContent, { backgroundColor: T.card, borderColor: `${dotColor}55` }]}>
          <View style={s.chainHeader}>
            <Text style={[s.chainRole, { color: T.text }]}>{stageLabel(step.role)}</Text>
            <View style={[s.chainBadge, {
              backgroundColor: isApproved ? `${T.success}20` : isRejected ? `${T.error}15` : `${T.warning}20`,
              borderColor:     isApproved ?  `${T.success}50` : isRejected ? `${T.error}40`  : `${T.warning}50`,
            }]}>
              <Text style={[s.chainBadgeText, {
                color: isApproved ? T.success : isRejected ? T.error : T.warning,
              }]}>
                {step.status?.toUpperCase()}
              </Text>
            </View>
          </View>
          {step.timestamp && (
            <Text style={[s.chainTime, { color: T.muted }]}>{fmt(step.timestamp)}</Text>
          )}
          {step.comment ? (
            <Text style={[s.chainComment, { color: T.textSub, borderLeftColor: dotColor }]}>
              "{step.comment}"
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  // ── Approval pipeline tracker ─────────────────────────────────────────────
  const renderPipeline = () => {
    const chain = event?.chain || [];
    const currentStage = event?.currentStage;

    return (
      <View style={s.pipeline}>
        {STAGE_ORDER.map((stage, idx) => {
          const step = chain.find(c => c.role === stage);
          const isCurrentPending = !step && currentStage === stage;
          const isNotReached = !step && !isCurrentPending;

          let dotBg = T.border;
          let iconName = 'ellipse-outline';
          if (step?.status === 'approved') { dotBg = T.success; iconName = 'checkmark-circle'; }
          else if (step?.status === 'rejected') { dotBg = T.error;   iconName = 'close-circle'; }
          else if (isCurrentPending)        { dotBg = T.warning; iconName = 'time'; }

          return (
            <View key={stage} style={s.pipeStep}>
              <View style={[s.pipeDot, { backgroundColor: dotBg }]}>
                <Ionicons name={iconName} size={12} color="#fff" />
              </View>
              {idx < STAGE_ORDER.length - 1 && (
                <View style={[s.pipeConnector, { backgroundColor: step ? T.success : T.border }]} />
              )}
              <Text style={[s.pipeLabel, {
                color: isNotReached ? T.muted : T.text,
                fontWeight: isCurrentPending ? '900' : '600',
              }]} numberOfLines={2}>
                {stageLabel(stage)}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[s.center, { backgroundColor: T.bg }]}>
        <ActivityIndicator color={T.accent} size="large" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[s.center, { backgroundColor: T.bg }]}>
        <Ionicons name="document-text-outline" size={48} color={T.muted} />
        <Text style={{ color: T.muted, marginTop: 12, fontSize: 15, fontWeight: '700' }}>Event not found</Text>
      </View>
    );
  }

  const palette = event.currentStage === 'approved'
    ? { bar: T.success, badge: `${T.success}20`, badgeBorder: `${T.success}50`, badgeText: T.success }
    : event.currentStage === 'rejected'
    ? { bar: T.error,   badge: `${T.error}15`,   badgeBorder: `${T.error}40`,   badgeText: T.error   }
    : { bar: T.warning, badge: `${T.warning}20`, badgeBorder: `${T.warning}50`, badgeText: T.warning };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      {/* ── Header ── */}
      <View style={[s.header, { backgroundColor: T.card, borderBottomColor: T.border }]}>
        <TouchableOpacity
          onPress={() => nav.goBack()}
          style={[s.backBtn, { backgroundColor: T.iconBg }]}
        >
          <Ionicons name="chevron-back" size={20} color={T.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: T.text }]} numberOfLines={1}>Event Details</Text>
        <TouchableOpacity
          onPress={handleDownloadPdf}
          disabled={pdfLoading}
          style={[s.pdfBtn, { backgroundColor: T.accentSoft, borderColor: T.accent }]}
        >
          {pdfLoading
            ? <ActivityIndicator size="small" color={T.accent} />
            : <Ionicons name="document-text" size={20} color={T.accent} />
          }
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>

        {/* ── Status banner ── */}
        <View style={[s.banner, { backgroundColor: palette.badge, borderColor: palette.badgeBorder }]}>
          <Ionicons name={stageIcon(event.currentStage)} size={20} color={palette.badgeText} />
          <Text style={[s.bannerText, { color: palette.badgeText }]}>
            {event.currentStage === 'approved' ? 'Fully Approved' :
             event.currentStage === 'rejected' ? 'Rejected' :
             `Pending — ${stageLabel(event.currentStage)} Stage`}
          </Text>
        </View>

        {/* ── Event info card ── */}
        <View style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
          <View style={[s.cardAccentBar, { backgroundColor: palette.bar }]} />
          <View style={s.cardBody}>
            <Text style={[s.eventTitle, { color: T.text }]}>{event.title}</Text>
            <Text style={[s.eventDesc, { color: T.textSub }]}>{event.description}</Text>

            <View style={s.metaGrid}>
              <MetaRow icon="calendar-outline" label="Date & Time" value={durFmt(event.startTime, event.endTime)} T={T} />
              <MetaRow icon="location-outline" label="Venue"       value={event.venue}                          T={T} />
              <MetaRow icon="people-outline"   label="Attendance"  value={`${event.expectedAttendance} expected`} T={T} />
              {event.requestedBy?.name && (
                <MetaRow icon="person-outline" label="Submitted By" value={event.requestedBy.name} T={T} />
              )}
              {event.conflictResult?.probability && (
                <MetaRow icon="trending-up" label="AI Confidence" value={`${event.conflictResult.probability}% approval probability`} T={T} />
              )}
            </View>

            {event.resources?.length > 0 && (
              <View style={s.resourcesWrap}>
                <Text style={[s.sectionLabel, { color: T.muted }]}>Resources Requested</Text>
                <View style={s.resourceChips}>
                  {event.resources.map((r, i) => (
                    <View key={i} style={[s.chip, { backgroundColor: T.iconBg, borderColor: T.border }]}>
                      <Text style={[s.chipText, { color: T.text }]}>{r}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* ── Approval pipeline (visual tracker) ── */}
        <Text style={[s.section, { color: T.text }]}>Approval Pipeline</Text>
        <View style={[s.pipelineCard, { backgroundColor: T.card, borderColor: T.border }]}>
          {renderPipeline()}
        </View>

        {/* ── Detailed approval chain ── */}
        <Text style={[s.section, { color: T.text }]}>Approval History</Text>

        {(!event.chain || event.chain.length === 0) ? (
          <View style={[s.emptyBox, { backgroundColor: T.card, borderColor: T.border }]}>
            <Ionicons name="hourglass-outline" size={32} color={T.muted} />
            <Text style={[s.emptyText, { color: T.muted }]}>No approvals recorded yet</Text>
          </View>
        ) : (
          <View style={[s.chainWrap, { backgroundColor: T.card, borderColor: T.border }]}>
            {event.chain.map((step, idx) => renderChainStep(step, idx))}
          </View>
        )}

        {/* ── PDF Download CTA ── */}
        <TouchableOpacity
          onPress={handleDownloadPdf}
          disabled={pdfLoading}
          style={[s.downloadCta, { backgroundColor: T.accentSoft, borderColor: T.accent }]}
          activeOpacity={0.85}
        >
          <View style={[s.downloadIcon, { backgroundColor: T.accent }]}>
            {pdfLoading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="download-outline" size={22} color="#fff" />
            }
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.downloadTitle, { color: T.text }]}>Download Proposal PDF</Text>
            <Text style={[s.downloadSub, { color: T.muted }]}>
              {event.currentStage === 'approved'
                ? 'Official approval certificate ready'
                : 'Current event request document'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={T.accent} />
        </TouchableOpacity>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ── PDF Preview Modal ── */}
      <Modal visible={pdfModal} transparent animationType="slide" onRequestClose={() => setPdfModal(false)}>
        <View style={s.modalOverlay}>
          <View style={[s.modalSheet, { backgroundColor: T.card, borderColor: T.border }]}>
            <View style={s.modalHeaderRow}>
              <Text style={[s.modalHeaderTitle, { color: T.text }]}>📄 PDF Ready</Text>
              <TouchableOpacity onPress={() => setPdfModal(false)} style={[s.closeBtn, { backgroundColor: T.iconBg }]}>
                <Ionicons name="close" size={18} color={T.text} />
              </TouchableOpacity>
            </View>
            <Text style={[s.modalBody, { color: T.textSub }]}>
              Your event proposal PDF has been generated. In a production build this opens the device's PDF viewer. 
              The base64 data is ready for printing or sharing.
            </Text>
            <View style={s.modalActions}>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    await Share.share({
                      message: `Event Proposal: ${event.title}\nGenerated by Aether Campus OS`,
                      title: `${event.title} — Event Proposal`,
                    });
                  } catch {}
                }}
                style={[s.modalBtn, { backgroundColor: T.accent }]}
              >
                <Ionicons name="share-outline" size={18} color="#fff" />
                <Text style={[s.modalBtnText, { color: '#fff' }]}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPdfModal(false)}
                style={[s.modalBtn, { backgroundColor: T.iconBg, borderColor: T.border, borderWidth: 1 }]}
              >
                <Text style={[s.modalBtnText, { color: T.text }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Sub-component ─────────────────────────────────────────────────────────
function MetaRow({ icon, label, value, T }) {
  return (
    <View style={s.metaRow}>
      <View style={[s.metaIcon, { backgroundColor: T.iconBg }]}>
        <Ionicons name={icon} size={14} color={T.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.metaLabel, { color: T.muted }]}>{label}</Text>
        <Text style={[s.metaValue, { color: T.text }]}>{value || '—'}</Text>
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  center:   { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll:   { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 },

  // Header
  header: {
    paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn:     { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, marginHorizontal: 12, fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  pdfBtn:      { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },

  // Status banner
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 16, borderWidth: 1.5, padding: 14, marginBottom: 16,
  },
  bannerText: { fontSize: 14, fontWeight: '800' },

  // Info card
  card: { borderRadius: 20, borderWidth: 1.5, marginBottom: 20, overflow: 'hidden' },
  cardAccentBar: { height: 5 },
  cardBody:      { padding: 16 },
  eventTitle:    { fontSize: 20, fontWeight: '900', letterSpacing: -0.5, marginBottom: 8 },
  eventDesc:     { fontSize: 14, lineHeight: 20, marginBottom: 16 },

  // Meta grid
  metaGrid: { gap: 10 },
  metaRow:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  metaLabel:{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  metaValue:{ fontSize: 14, fontWeight: '700', marginTop: 1 },

  // Resource chips
  resourcesWrap: { marginTop: 16 },
  sectionLabel:  { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  resourceChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:          { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  chipText:      { fontSize: 12, fontWeight: '700' },

  // Section titles
  section: { fontSize: 17, fontWeight: '900', marginBottom: 10, letterSpacing: -0.3 },

  // Pipeline visual
  pipelineCard:  { borderRadius: 16, borderWidth: 1.5, padding: 16, marginBottom: 20 },
  pipeline:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  pipeStep:      { flex: 1, alignItems: 'center', position: 'relative' },
  pipeDot:       { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  pipeConnector: { position: 'absolute', top: 13, left: '50%', right: '-50%', height: 2 },
  pipeLabel:     { fontSize: 9, textAlign: 'center', marginTop: 6, letterSpacing: 0.3, fontWeight: '700' },

  // Chain
  emptyBox:  { borderRadius: 16, borderWidth: 1.5, padding: 32, alignItems: 'center', gap: 8, marginBottom: 16 },
  emptyText: { fontSize: 14, fontWeight: '600' },
  chainWrap: { borderRadius: 20, borderWidth: 1.5, padding: 16, marginBottom: 20 },
  chainStep: { marginBottom: 0 },
  chainLine: { width: 2, height: 20, marginLeft: 15, marginBottom: -4 },
  chainDot:  { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  chainContent: { borderRadius: 14, borderWidth: 1.5, padding: 12, marginBottom: 12, marginLeft: 8 },
  chainHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  chainRole:    { fontSize: 14, fontWeight: '800' },
  chainBadge:   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  chainBadgeText: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  chainTime:    { fontSize: 11, marginBottom: 6 },
  chainComment: { fontSize: 13, fontStyle: 'italic', borderLeftWidth: 3, paddingLeft: 10, lineHeight: 20 },

  // Download CTA
  downloadCta:   { flexDirection: 'row', alignItems: 'center', borderRadius: 18, borderWidth: 1.5, padding: 16, gap: 14, marginBottom: 20 },
  downloadIcon:  { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  downloadTitle: { fontSize: 15, fontWeight: '800' },
  downloadSub:   { fontSize: 12, marginTop: 2 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  modalSheet:   { borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, padding: 24 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalHeaderTitle: { fontSize: 18, fontWeight: '900' },
  closeBtn:     { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  modalBody:    { fontSize: 14, lineHeight: 20, marginBottom: 20 },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalBtn:     { flex: 1, flexDirection: 'row', paddingVertical: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 8 },
  modalBtnText: { fontSize: 15, fontWeight: '800' },
});
