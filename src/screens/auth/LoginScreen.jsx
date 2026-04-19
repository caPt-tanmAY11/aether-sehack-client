import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, StyleSheet, ScrollView,
} from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { authApi } from '../../api/auth.api';
import { Ionicons } from '@expo/vector-icons';

const ACCENT   = '#6b38d4';
const NAVY     = '#091426';
const BG       = '#f7f9fb';
const CARD_BG  = '#ffffff';
const MUTED    = '#8590a6';
const BORDER   = '#e4e6ea';
const ERROR    = '#ba1a1a';
const ERR_SOFT = '#ffdad6';

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
        {/* Decorative top accent */}
        <View style={s.topAccent}>
          <View style={s.accentCircleL} />
          <View style={s.accentCircleR} />
        </View>

        {/* Brand */}
        <View style={s.brand}>
          <View style={s.logoWrap}>
            <View style={s.logoHex}>
              <Text style={s.logoChar}>⬡</Text>
            </View>
            <View style={s.logoPulse} />
          </View>
          <Text style={s.appName}>AETHER</Text>
          <Text style={s.tagline}>Campus Operating System</Text>
        </View>

        {/* Form Card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Welcome back</Text>
          <Text style={s.cardSub}>Sign in to your campus dashboard</Text>

          {error && (
            <View style={s.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={ERROR} />
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          {/* Email */}
          <View style={s.field}>
            <Text style={s.fieldLabel}>College Email</Text>
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
            <Text style={s.fieldLabel}>Password</Text>
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
                <Text style={s.ctaText}>Authenticate</Text>
                <View style={s.ctaArrow}>
                  <Ionicons name="arrow-forward" size={16} color={ACCENT} />
                </View>
              </>
            )}
          </TouchableOpacity>

          <Text style={s.footNote}>
            Secured · SPIT Campus Infrastructure
          </Text>
        </View>

        {/* Bottom pill chips */}
        <View style={s.chipRow}>
          {['Students', 'Faculty', 'Admin'].map(r => (
            <View key={r} style={s.chip}>
              <Text style={s.chipText}>{r}</Text>
            </View>
          ))}
        </View>

        <Text style={s.version}>Aether v1.0 · Glass UI</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 48,
    justifyContent: 'center',
    overflow: 'hidden',
  },

  /* Decorative blobs */
  topAccent: {
    position: 'absolute',
    top: -80,
    left: -60,
    right: -60,
    height: 300,
    overflow: 'hidden',
  },
  accentCircleL: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(107,56,212,0.08)',
    top: 0,
    left: -60,
  },
  accentCircleR: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(107,56,212,0.05)',
    top: 60,
    right: -40,
  },

  /* Brand */
  brand: { alignItems: 'center', paddingTop: 80, marginBottom: 36 },
  logoWrap: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  logoHex: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ACCENT,
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { height: 8 },
    elevation: 10,
  },
  logoPulse: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(107,56,212,0.25)',
  },
  logoChar: { fontSize: 28, color: '#ffffff' },
  appName: {
    fontSize: 34,
    fontWeight: '900',
    color: NAVY,
    letterSpacing: 8,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 12,
    color: MUTED,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  /* Card */
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 28,
    padding: 28,
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 8,
    marginBottom: 24,
  },
  cardTitle: { fontSize: 24, fontWeight: '900', color: NAVY, letterSpacing: -0.5 },
  cardSub: { fontSize: 14, color: MUTED, marginTop: 4, marginBottom: 24 },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: ERR_SOFT,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: ERROR,
  },
  errorText: { color: ERROR, fontSize: 13, fontWeight: '600', flex: 1 },

  field: { marginBottom: 18 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#45474c',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  inputFocused: {
    borderColor: ACCENT,
    backgroundColor: '#faf8ff',
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: NAVY, fontWeight: '500' },
  eyeBtn: { paddingLeft: 8, padding: 4 },

  cta: {
    backgroundColor: NAVY,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 6,
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  ctaText: { color: '#ffffff', fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  ctaArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footNote: {
    textAlign: 'center',
    color: '#c5c6cd',
    fontSize: 11,
    marginTop: 20,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  /* Bottom chips */
  chipRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: BORDER,
  },
  chipText: { fontSize: 12, fontWeight: '600', color: MUTED },
  version: { textAlign: 'center', color: '#c5c6cd', fontSize: 11, fontWeight: '500' },
});
