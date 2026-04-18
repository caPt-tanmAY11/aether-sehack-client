import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { pluginsApi } from '../../api/plugins.api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// Icon map for known plugin slugs — falls back to a default grid icon
const PLUGIN_ICONS = {
  'canteen-tracker':   { name: 'restaurant',         color: '#f59e0b' },
  'research-portal':   { name: 'flask',               color: '#8b5cf6' },
  'library-catalog':   { name: 'library',             color: '#3b82f6' },
  'lost-and-found':    { name: 'search',              color: '#ec4899' },
  'sports-booking':    { name: 'football',            color: '#22c55e' },
  'alumni-connect':    { name: 'people-circle',       color: '#06b6d4' },
};

const DEFAULT_ICON = { name: 'grid', color: '#6366f1' };

export default function MiniAppMarketplaceScreen() {
  const navigation = useNavigation();
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(null); // slug of the one being launched

  useFocusEffect(
    useCallback(() => {
      fetchPlugins();
    }, [])
  );

  const fetchPlugins = async () => {
    try {
      setLoading(true);
      const data = await pluginsApi.getPlugins();
      setPlugins(data || []);
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
        slug: plugin.slug,
        name: plugin.name,
        appUrl: data.plugin.appUrl,
        token: data.token,
      });
    } catch (err) {
      Alert.alert('Launch Failed', err?.response?.data?.message || 'Could not launch this mini-app.');
    } finally {
      setLaunching(null);
    }
  };

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="px-4 pt-12 pb-4 bg-card border-b border-border">
        <Text className="text-muted text-xs uppercase font-bold tracking-wider mb-1">Aether</Text>
        <Text className="text-white text-2xl font-bold">Mini Apps</Text>
        <Text className="text-muted text-sm mt-1">Student-built tools, securely integrated</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="items-center mt-16">
            <ActivityIndicator color="#6366f1" size="large" />
            <Text className="text-muted mt-4">Loading apps...</Text>
          </View>
        ) : plugins.length === 0 ? (
          <View className="items-center mt-16">
            <Ionicons name="grid-outline" size={56} color="#334155" />
            <Text className="text-muted text-center mt-4 text-base">No mini-apps available yet.</Text>
            <Text className="text-slate-600 text-center text-sm mt-2">
              Student developers can submit apps to the Aether team.
            </Text>
          </View>
        ) : (
          <>
            <Text className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-3">
              {plugins.length} App{plugins.length !== 1 ? 's' : ''} Available
            </Text>

            {/* 2-column grid */}
            <View className="flex-row flex-wrap justify-between">
              {plugins.map((plugin) => {
                const iconDef = PLUGIN_ICONS[plugin.slug] || DEFAULT_ICON;
                const isLaunching = launching === plugin.slug;
                return (
                  <TouchableOpacity
                    key={plugin.slug}
                    onPress={() => handleLaunch(plugin)}
                    disabled={isLaunching}
                    activeOpacity={0.8}
                    className="w-[48%] bg-card rounded-2xl border border-border mb-4 p-4 items-center"
                  >
                    {/* Icon */}
                    <View
                      className="w-14 h-14 rounded-2xl items-center justify-center mb-3"
                      style={{ backgroundColor: `${iconDef.color}22` }}
                    >
                      {isLaunching
                        ? <ActivityIndicator color={iconDef.color} />
                        : <Ionicons name={iconDef.name} size={28} color={iconDef.color} />
                      }
                    </View>

                    {/* Name */}
                    <Text className="text-white font-bold text-sm text-center mb-1" numberOfLines={1}>
                      {plugin.name}
                    </Text>

                    {/* Description */}
                    <Text className="text-muted text-xs text-center" numberOfLines={2}>
                      {plugin.description}
                    </Text>

                    {/* Version badge */}
                    <View className="mt-2 bg-surface px-2 py-0.5 rounded-full border border-border">
                      <Text className="text-slate-500 text-xs">v{plugin.version}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Developer callout */}
            <TouchableOpacity 
              onPress={() => navigation.navigate('MiniAppDeveloperPortal')}
              className="bg-primary/10 border border-primary/30 rounded-2xl p-4 mt-2 mb-8"
            >
              <View className="flex-row items-center mb-2 justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="code-slash" size={20} color="#6366f1" />
                  <Text className="text-primary font-bold ml-2">Build for Aether</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6366f1" />
              </View>
              <Text className="text-slate-400 text-sm">
                Student developers can build mini-apps using the Aether Plugin API. Tap here to register your app.
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}
