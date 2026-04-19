import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, StyleSheet, ScrollView,
} from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { authApi } from '../../api/auth.api';
import { Ionicons } from '@expo/vector-icons';

/* ─── Light Theme Design Tokens (matches app LIGHT theme) ─── */
const BG      = '#f7f9fb';
const CARD    = '#ffffff';
const ACCENT  = '#6b38d4';
const NAVY    = '#091426';
const MUTED   = '#8590a6';
const BORDER  = '#eceef0';
const ERROR   = '#ba1a1a';
const ERR_BG  = '#ffdad6';

export default function LoginScreen() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [focused, setFocused]   = useState(null);

  const login = useAuthStore(s => s.login);

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.login(email.toLowerCase().trim(), password);
      login(data.user, data.accessToken, data.refreshToken);
      try {
        const fullUser = await authApi.getProfile();
        login(fullUser, data.accessToken, data.refreshToken);
      } catch { /* profile fetch is optional */ }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials or server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={s.root}
    >
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* ── Neubrutalism top stripe */}
        <View style={s.stripe}>
          <Text style={s.stripeText}>AETHER CAMPUS OS</Text>
          <View style={s.stripeDot} />
          <Text style={s.stripeText}>SECURE LOGIN</Text>
        </View>

        {/* ── Brand Block */}
        <View style={s.brand}>
          <View style={s.logoBox}>
            <Text style={s.logoChar}>⬡</Text>
          </View>
          <View style={s.brandText}>
            <Text style={s.appName}>AETHER</Text>
            <Text style={s.tagline}>CAMPUS OPERATING SYSTEM</Text>
          </View>
        </View>

        {/* ── Form Card — Neubrutalism on light bg */}
        <View style={s.card}>

          <View style={s.cardLabel}>
            <Text style={s.cardLabelText}>// AUTHENTICATE</Text>
          </View>

          <Text style={s.cardTitle}>Welcome{'\n'}Back.</Text>
          <Text style={s.cardSub}>Sign in to your campus dashboard</Text>

          {error && (
            <View style={s.errorBox}>
              <Ionicons name="alert-circle" size={16} color={ERROR} />
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          {/* Email */}
          <View style={s.field}>
            <Text style={s.fieldLabel}>// COLLEGE EMAIL</Text>
            <View style={[s.inputRow, focused === 'email' && s.inputFocused]}>
              <Ionicons
                name="mail-outline"
                size={17}
                color={focused === 'email' ? ACCENT : MUTED}
                style={s.inputIcon}
              />
              <TextInput
                style={s.input}
                placeholder="student@spit.ac.in"
                placeholderTextColor="#bcc7de"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
              />
            </View>
          </View>

          {/* Password */}
          <View style={s.field}>
            <Text style={s.fieldLabel}>// PASSWORD</Text>
            <View style={[s.inputRow, focused === 'password' && s.inputFocused]}>
              <Ionicons
                name="lock-closed-outline"
                size={17}
                color={focused === 'password' ? ACCENT : MUTED}
                style={s.inputIcon}
              />
              <TextInput
                style={[s.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor="#bcc7de"
                secureTextEntry={!showPwd}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
              />
              <TouchableOpacity onPress={() => setShowPwd(p => !p)} style={s.eyeBtn}>
                <Ionicons
                  name={showPwd ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={MUTED}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={[s.cta, loading && { opacity: 0.65 }]}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text style={s.ctaText}>AUTHENTICATE</Text>
                <View style={s.ctaArrow}>
                  <Ionicons name="arrow-forward" size={16} color={ACCENT} />
                </View>
              </>
            )}
          </TouchableOpacity>

          <Text style={s.footNote}>Secured · SPIT Campus Infrastructure</Text>
        </View>

        {/* Role tags */}
        <View style={s.chipRow}>
          {['STUDENTS', 'FACULTY', 'ADMIN'].map(r => (
            <View key={r} style={s.chip}>
              <Text style={s.chipText}>{r}</Text>
            </View>
          ))}
        </View>

        <Text style={s.version}>Aether v1.0 · Neubrutalism</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: {
    flexGrow: 1, paddingHorizontal: 24, paddingBottom: 48,
    justifyContent: 'center',
  },

  /* Neubrutalist stripe */
  stripe: {
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 2, borderColor: NAVY,
    paddingVertical: 10, marginBottom: 28, marginTop: 60, gap: 10,
  },
  stripeText: { color: MUTED, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  stripeDot:  { width: 6, height: 6, backgroundColor: ACCENT, borderRadius: 0 },

  /* Brand */
  brand: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 28 },
  logoBox: {
    width: 60, height: 60,
    backgroundColor: ACCENT,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: NAVY,
    // Hard NB shadow
    shadowColor: NAVY,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 8,
    borderRadius: 0,
  },
  logoChar: { fontSize: 26, color: '#ffffff', fontWeight: '900' },
  brandText: { flex: 1 },
  appName: {
    fontSize: 34, fontWeight: '900', color: NAVY,
    letterSpacing: 8, lineHeight: 36,
  },
  tagline: {
    fontSize: 8, color: MUTED, fontWeight: '800',
    letterSpacing: 2, textTransform: 'uppercase', marginTop: 4,
  },

  /* Card — white bg, hard black border + shadow (NB on light) */
  card: {
    backgroundColor: CARD,
    borderWidth: 2, borderColor: NAVY,
    padding: 24, marginBottom: 20,
    shadowColor: NAVY,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 10,
    borderRadius: 0,
  },
  cardLabel: {
    borderLeftWidth: 3, borderColor: ACCENT,
    paddingLeft: 8, marginBottom: 12,
  },
  cardLabelText: { color: ACCENT, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  cardTitle:  { fontSize: 34, fontWeight: '900', color: NAVY, letterSpacing: -1, lineHeight: 38, marginBottom: 6 },
  cardSub:    { fontSize: 13, color: MUTED, marginBottom: 24, fontWeight: '600' },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: ERR_BG,
    borderWidth: 2, borderColor: ERROR,
    padding: 12, marginBottom: 20, borderRadius: 0,
  },
  errorText: { color: ERROR, fontSize: 13, fontWeight: '600', flex: 1 },

  field: { marginBottom: 18 },
  fieldLabel: {
    fontSize: 9, fontWeight: '900', color: MUTED,
    letterSpacing: 2, marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: BG,
    borderWidth: 2, borderColor: BORDER,
    paddingHorizontal: 14, paddingVertical: 13,
    borderRadius: 0,
  },
  inputFocused: { borderColor: ACCENT, backgroundColor: '#faf8ff' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: NAVY, fontWeight: '500' },
  eyeBtn: { paddingLeft: 8, padding: 4 },

  /* NB CTA: navy bg, hard white shadow */
  cta: {
    backgroundColor: NAVY,
    borderWidth: 2, borderColor: NAVY,
    paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 12, marginTop: 6,
    shadowColor: ACCENT,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 8,
    borderRadius: 0,
  },
  ctaText:  { color: '#ffffff', fontSize: 15, fontWeight: '900', letterSpacing: 3 },
  ctaArrow: {
    width: 28, height: 28, backgroundColor: '#ffffff',
    alignItems: 'center', justifyContent: 'center', borderRadius: 0,
  },
  footNote: {
    textAlign: 'center', color: '#c5c6cd',
    fontSize: 10, marginTop: 18, fontWeight: '700', letterSpacing: 1,
  },

  chipRow: {
    flexDirection: 'row', justifyContent: 'center',
    gap: 0, marginBottom: 14,
  },
  chip: {
    borderWidth: 2, borderColor: NAVY,
    paddingHorizontal: 14, paddingVertical: 6,
    backgroundColor: CARD, marginLeft: -2, borderRadius: 0,
  },
  chipText: { fontSize: 10, fontWeight: '900', color: MUTED, letterSpacing: 1.5 },
  version:  { textAlign: 'center', color: '#c5c6cd', fontSize: 10, fontWeight: '700', letterSpacing: 2 },
});
