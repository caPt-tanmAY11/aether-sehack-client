import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { pluginsApi } from '../../api/plugins.api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../hooks/ThemeContext';

const PLUGIN_ICONS = {
  'canteen-tracker':  { name: 'restaurant',   color: '#f59e0b' },
  'research-portal':  { name: 'flask',         color: '#8b5cf6' },
  'library-catalog':  { name: 'library',       color: '#3b82f6' },
  'lost-and-found':   { name: 'search',        color: '#ec4899' },
  'sports-booking':   { name: 'football',      color: '#22c55e' },
  'alumni-connect':   { name: 'people-circle', color: '#06b6d4' },
};
const DEFAULT_ICON = { name: 'grid', color: '#6b38d4' };

export default function MiniAppMarketplaceScreen() {
  const { theme: T } = useTheme();
  const navigation = useNavigation();
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(null);

  useFocusEffect(useCallback(() => { fetchPlugins(); }, []));

  const fetchPlugins = async () => {
    try {
      setLoading(true);
      setPlugins(await pluginsApi.getPlugins() || []);
    } catch (err) {
      console.error('Failed to fetch plugins', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLaunch = async (plugin) => {
    try {
      setLaunching(plugin.slug);
      const data = await pluginsApi.getLaunchToken(plugin.slug);
      navigation.navigate('MiniAppShell', {
        slug: plugin.slug, name: plugin.name,
        appUrl: data.plugin.appUrl, token: data.token,
      });
    } catch (err) {
      Alert.alert('Launch Failed', err?.response?.data?.message || 'Could not launch this mini-app.');
    } finally {
      setLaunching(null);
    }
  };

  return (
    <View style={[s.root, { backgroundColor: T.bg }]}>

      {/* Header */}
      <View style={[s.header, { backgroundColor: T.card, borderBottomColor: T.border }]}>
        <Text style={[s.eyebrow, { color: T.accent }]}>Aether Platform</Text>
        <Text style={[s.title, { color: T.text }]}>Mini Apps</Text>
        <Text style={[s.subtitle, { color: T.muted }]}>Student-built tools, securely integrated</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={s.center}>
            <ActivityIndicator color={T.accent} size="large" />
            <Text style={[s.loadingText, { color: T.muted }]}>Loading apps...</Text>
          </View>
        ) : plugins.length === 0 ? (
          <View style={s.center}>
            <View style={[s.emptyIcon, { backgroundColor: T.accentSoft, borderColor: T.accent }]}>
              <Ionicons name="grid-outline" size={32} color={T.accent} />
            </View>
            <Text style={[s.emptyTitle, { color: T.text }]}>No Apps Yet</Text>
            <Text style={[s.emptyText, { color: T.muted }]}>
              No mini-apps available yet. Student developers can submit apps to the Aether team.
            </Text>
          </View>
        ) : (
          <>
            <Text style={[s.countLabel, { color: T.muted }]}>
              {plugins.length} App{plugins.length !== 1 ? 's' : ''} Available
            </Text>

            {/* 2-column grid */}
            <View style={s.grid}>
              {plugins.map((plugin) => {
                const iconDef = PLUGIN_ICONS[plugin.slug] || DEFAULT_ICON;
                const isLaunching = launching === plugin.slug;
                return (
                  <TouchableOpacity
                    key={plugin.slug}
                    onPress={() => handleLaunch(plugin)}
                    disabled={isLaunching}
                    activeOpacity={0.8}
                    style={[s.pluginCard, { backgroundColor: T.card, borderColor: T.border }]}
                  >
                    <View style={[s.pluginIcon, { backgroundColor: `${iconDef.color}20` }]}>
                      {isLaunching
                        ? <ActivityIndicator color={iconDef.color} />
                        : <Ionicons name={iconDef.name} size={26} color={iconDef.color} />
                      }
                    </View>
                    <Text style={[s.pluginName, { color: T.text }]} numberOfLines={1}>
                      {plugin.name}
                    </Text>
                    <Text style={[s.pluginDesc, { color: T.muted }]} numberOfLines={2}>
                      {plugin.description}
                    </Text>
                    <View style={[s.versionBadge, { backgroundColor: T.iconBg, borderColor: T.border }]}>
                      <Text style={[s.versionText, { color: T.muted }]}>v{plugin.version}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Dev callout */}
            <TouchableOpacity
              onPress={() => navigation.navigate('MiniAppDeveloperPortal')}
              style={[s.devCard, { backgroundColor: T.accentSoft, borderColor: T.accent }]}
              activeOpacity={0.85}
            >
              <View style={s.devCardRow}>
                <View style={[s.devIcon, { backgroundColor: T.accent }]}>
                  <Ionicons name="code-slash" size={18} color="#ffffff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.devTitle, { color: T.accent }]}>Build for Aether</Text>
                  <Text style={[s.devSub, { color: T.textSub }]}>
                    Student developers can build mini-apps using the Aether Plugin API.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={T.accent} />
              </View>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1 },

  header: {
    paddingTop: 52, paddingBottom: 18, paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  eyebrow:   { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 },
  title:     { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  subtitle:  { fontSize: 13, marginTop: 4 },

  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 160 },

  center:      { alignItems: 'center', paddingTop: 48, gap: 14 },
  loadingText: { fontSize: 14, fontWeight: '600' },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2,
  },
  emptyTitle: { fontSize: 20, fontWeight: '900' },
  emptyText:  { fontSize: 13, textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },

  countLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  pluginCard: {
    width: '48%',
    borderRadius: 20, borderWidth: 2,
    padding: 16, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 0, elevation: 3,
  },
  pluginIcon: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  pluginName:    { fontSize: 14, fontWeight: '900', letterSpacing: -0.2, marginBottom: 4, textAlign: 'center' },
  pluginDesc:    { fontSize: 11, textAlign: 'center', lineHeight: 16, marginBottom: 10 },
  versionBadge:  { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  versionText:   { fontSize: 10, fontWeight: '700' },

  devCard: {
    borderRadius: 20, borderWidth: 2, padding: 16, marginTop: 8,
  },
  devCardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  devIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  devTitle: { fontSize: 15, fontWeight: '900', marginBottom: 4 },
  devSub:   { fontSize: 12, lineHeight: 17 },
});
