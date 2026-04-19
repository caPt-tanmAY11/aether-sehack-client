import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/auth.store';
import { useNotificationsStore } from '../store/notifications.store';
import { useTheme } from '../hooks/ThemeContext';

/**
 * Shared app header — shows on every screen.
 * Props:
 *   title?: string   — override the default page title
 *   showBack?: bool  — show a back chevron instead of profile avatar
 */
export default function AppHeader({ title, showBack = false }) {
  const navigation = useNavigation();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const unreadCount = useNotificationsStore(s => s.unreadCount);
  const { theme: T, isDark, toggle } = useTheme();

  const firstName = user?.name?.split(' ')[0] || 'User';
  const initials = user?.name?.split(' ').map(w => w[0]).slice(0, 2).join('') || 'U';

  return (
    <View style={[s.header, { backgroundColor: T.headerBg, borderBottomColor: T.headerBorder }]}>
      <View style={s.left}>
        {showBack ? (
          <TouchableOpacity
            onPress={() => navigation.canGoBack() ? navigation.goBack() : null}
            style={[s.iconBtn, { backgroundColor: T.iconBg }]}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={20} color={T.text} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={[s.avatar, { backgroundColor: T.accentSoft, borderColor: T.accent }]}
            activeOpacity={0.8}
          >
            <Text style={[s.avatarText, { color: T.accent }]}>{initials}</Text>
          </TouchableOpacity>
        )}
        <View>
          {title ? (
            <Text style={[s.pageTitle, { color: T.text }]}>{title}</Text>
          ) : (
            <>
              <Text style={[s.helloText, { color: T.muted }]}>Hey, <Text style={{ color: T.accent, fontWeight: '900' }}>{firstName}</Text></Text>
              <Text style={[s.brandSub, { color: T.muted }]}>Central Hub</Text>
            </>
          )}
        </View>
      </View>

      <View style={s.right}>
        <TouchableOpacity
          onPress={toggle}
          style={[s.iconBtn, { backgroundColor: T.iconBg }]}
          activeOpacity={0.7}
        >
          <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={18} color={T.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications')}
          style={[s.iconBtn, { backgroundColor: T.iconBg }]}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={18} color={T.text} />
          {unreadCount > 0 && (
            <View style={s.badge}>
              <Text style={s.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={logout}
          style={[s.iconBtn, { backgroundColor: T.iconBg }]}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={18} color={T.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 4,
    zIndex: 10,
  },
  left:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  avatar: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2,
  },
  avatarText: { fontSize: 14, fontWeight: '900', letterSpacing: -0.3 },

  helloText:  { fontSize: 16, fontWeight: '600' },
  brandSub:   { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 1 },
  pageTitle:  { fontSize: 18, fontWeight: '900', letterSpacing: -0.4 },

  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: -1, right: -1,
    backgroundColor: '#ba1a1a',
    minWidth: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  badgeText: { color: '#ffffff', fontSize: 9, fontWeight: '800' },
});
