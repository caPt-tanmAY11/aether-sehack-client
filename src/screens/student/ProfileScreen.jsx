import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth.store';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/ThemeContext';

export default function ProfileScreen() {
  const user       = useAuthStore(s => s.user);
  const logout     = useAuthStore(s => s.logout);
  const navigation = useNavigation();
  const { theme: T, isDark, toggle } = useTheme();

  const initials = user?.name?.split(' ').map(w => w[0]).slice(0, 2).join('') || 'U';

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Home');
  };

  const fields = [
    { label: 'Role',       value: `${user?.role || 'N/A'} ${user?.subRole ? `(${user?.subRole})` : ''}`.trim(), icon: 'shield-outline' },
    { label: 'Department', value: user?.departmentId?.name || 'N/A', icon: 'business-outline' },
    { label: 'Division',   value: user?.division || 'N/A',           icon: 'layers-outline' },
    { label: 'Semester',   value: user?.semester ? `Semester ${user.semester}` : 'N/A', icon: 'school-outline' },
    { label: 'Email',      value: user?.email || 'N/A',              icon: 'mail-outline' },
    { label: 'Version',    value: '1.0.0 · Glass UI',                icon: 'information-circle-outline' },
  ];

  return (
    <View style={[s.root, { backgroundColor: T.bg }]}>

      {/* Header */}
      <View style={[s.header, { backgroundColor: T.headerBg, borderBottomColor: T.headerBorder }]}>
        <TouchableOpacity onPress={handleBack} style={[s.backBtn, { backgroundColor: T.iconBg }]} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={T.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: T.text }]}>My Profile</Text>
        <TouchableOpacity onPress={toggle} style={[s.backBtn, { backgroundColor: T.iconBg }]} activeOpacity={0.7}>
          <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={18} color={T.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={s.hero}>
          <View style={[s.avatarRing, { borderColor: T.accent }]}>
            <View style={[s.avatar, { backgroundColor: T.accentSoft }]}>
              <Text style={[s.avatarText, { color: T.accent }]}>{initials}</Text>
            </View>
          </View>
          <Text style={[s.name, { color: T.text }]}>{user?.name}</Text>
          <Text style={[s.email, { color: T.muted }]}>{user?.email}</Text>
          <View style={[s.rolePill, { backgroundColor: T.accentSoft }]}>
            <Ionicons name="shield-checkmark-outline" size={12} color={T.accent} />
            <Text style={[s.roleText, { color: T.accent }]}>
              {(user?.role || 'user').charAt(0).toUpperCase() + (user?.role || 'user').slice(1)}
            </Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={[s.infoCard, { backgroundColor: T.card, borderColor: T.border }]}>
          <Text style={[s.infoCardTitle, { color: T.muted }]}>Account Details</Text>
          {fields.map((f, i) => (
            <View
              key={i}
              style={[
                s.fieldRow,
                i < fields.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: T.borderLight },
              ]}
            >
              <View style={[s.fieldIcon, { backgroundColor: T.accentSoft }]}>
                <Ionicons name={f.icon} size={16} color={T.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.fieldLabel, { color: T.muted }]}>{f.label}</Text>
                <Text style={[s.fieldValue, { color: T.text }]}>{f.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          onPress={logout}
          style={[s.signoutBtn, { backgroundColor: T.card, borderColor: T.errorSoft }]}
          activeOpacity={0.85}
        >
          <Ionicons name="log-out-outline" size={20} color={T.error} />
          <Text style={[s.signoutText, { color: T.error }]}>Sign Out</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <Text style={[s.footerBrand, { color: T.muted }]}>AETHER · Campus OS</Text>
          <Text style={[s.footerSub, { color: T.muted, opacity: 0.5 }]}>v1.0.0 Glass UI</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 },

  header: {
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  backBtn:     { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },

  hero: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 20 },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    padding: 3,
    marginBottom: 20,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { height: 6 },
    elevation: 6,
  },
  avatar:      { flex: 1, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  avatarText:  { fontSize: 34, fontWeight: '900', letterSpacing: -1 },
  name:        { fontSize: 26, fontWeight: '900', letterSpacing: -0.5, textAlign: 'center' },
  email:       { fontSize: 14, marginTop: 6, textAlign: 'center' },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 14,
  },
  roleText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },

  infoCard: {
    borderRadius: 24,
    padding: 22,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
    marginBottom: 16,
  },
  infoCardTitle: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 },
  fieldRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14 },
  fieldIcon:     { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  fieldLabel:    { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 },
  fieldValue:    { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },

  signoutBtn: {
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { height: 3 },
    elevation: 2,
  },
  signoutText:  { fontWeight: '800', fontSize: 16 },
  footerBrand:  { fontSize: 12, fontWeight: '800', letterSpacing: 2, marginTop: 8 },
  footerSub:    { fontSize: 11, marginTop: 4, fontWeight: '500' },
});
