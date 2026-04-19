import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/ThemeContext';

const EXCLUDE_FROM_DOCK = ['Profile'];

function getIcon(name, focused) {
  const map = {
    Home:          ['home',              'home-outline'],
    Personal:      ['home',              'home-outline'],
    Timetable:     ['calendar',          'calendar-outline'],
    Attendance:    ['checkmark-circle',  'checkmark-circle-outline'],
    Syllabus:      ['book',              'book-outline'],
    Events:        ['flag',              'flag-outline'],
    Issues:        ['alert-circle',      'alert-circle-outline'],
    Clubs:         ['people',            'people-outline'],
    Batches:       ['layers',            'layers-outline'],
    Apps:          ['grid',              'grid-outline'],
    Notices:       ['megaphone',         'megaphone-outline'],
    Advising:      ['school',            'school-outline'],
    Leave:         ['calendar-clear',    'calendar-clear-outline'],
    Admin:         ['briefcase',         'briefcase-outline'],
    Council:       ['shield-checkmark',  'shield-checkmark-outline'],
    Analytics:     ['bar-chart',         'bar-chart-outline'],
    Approvals:     ['checkmark-done',    'checkmark-done-outline'],
    Notifications: ['notifications',     'notifications-outline'],
  };
  const pair = map[name];
  if (!pair) return 'ellipse';
  return focused ? pair[0] : pair[1];
}

export default function FloatingTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);
  const { theme } = useTheme();

  const visible = state.routes.filter(r => !EXCLUDE_FROM_DOCK.includes(r.name));
  const mainRoutes = visible.slice(0, 4);
  const extraRoutes = visible.slice(4);

  const pressTab = (route, isFocused) => {
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
  };

  const renderMain = (route) => {
    const origIdx = state.routes.findIndex(r => r.key === route.key);
    const focused = state.index === origIdx;
    const { options } = descriptors[route.key];
    const label = options.tabBarLabel ?? options.title ?? route.name;
    const icon = getIcon(route.name, focused);

    return (
      <TouchableOpacity
        key={route.key}
        onPress={() => pressTab(route, focused)}
        style={[
          s.tab,
          focused && { backgroundColor: theme.dockActive },
        ]}
        activeOpacity={0.75}
      >
        <Ionicons name={icon} size={20} color={focused ? theme.dockActiveText : theme.dockInactive} />
        <Text
          style={[s.label, { color: focused ? theme.dockActiveText : theme.dockInactive }]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderExtra = (route) => {
    const origIdx = state.routes.findIndex(r => r.key === route.key);
    const focused = state.index === origIdx;
    const { options } = descriptors[route.key];
    const label = options.tabBarLabel ?? options.title ?? route.name;
    const icon = getIcon(route.name, focused);

    return (
      <TouchableOpacity
        key={route.key}
        onPress={() => { pressTab(route, focused); setExpanded(false); }}
        style={[s.extraRow, { borderBottomColor: theme.panelBorder }]}
        activeOpacity={0.7}
      >
        <View style={[s.extraIcon, { backgroundColor: focused ? theme.accent : theme.panelIconBg }]}>
          <Ionicons name={icon} size={20} color={focused ? '#ffffff' : theme.panelIconColor} />
        </View>
        <Text style={[s.extraLabel, { color: focused ? theme.accent : theme.panelText }]} numberOfLines={1}>
          {label}
        </Text>
        {focused && <View style={[s.dot, { backgroundColor: theme.accent }]} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[s.wrapper, { bottom: insets.bottom + 16 }]}>
      {expanded && extraRoutes.length > 0 && (
        <View style={[
          s.panel,
          {
            backgroundColor: theme.panelBg,
            shadowColor: theme.dockShadow,
            borderWidth: theme.mode === 'light' ? 1 : 0,
            borderColor: theme.border,
          }
        ]}>
          <Text style={[s.panelTitle, { color: theme.muted }]}>MORE OPTIONS</Text>
          {extraRoutes.map(renderExtra)}
        </View>
      )}

      <View style={[
        s.dock,
        {
          backgroundColor: theme.dockBg,
          shadowColor: theme.dockShadow,
          borderWidth: theme.mode === 'light' ? 0 : 0,
          borderColor: theme.border,
        }
      ]}>
        {mainRoutes.map(renderMain)}

        {extraRoutes.length > 0 && (
          <TouchableOpacity
            onPress={() => setExpanded(p => !p)}
            style={[s.tab, expanded && { backgroundColor: theme.accent }]}
            activeOpacity={0.75}
          >
            <Ionicons
              name={expanded ? 'close' : 'ellipsis-horizontal'}
              size={20}
              color={expanded ? '#ffffff' : theme.dockInactive}
            />
            <Text style={[s.label, { color: expanded ? '#ffffff' : theme.dockInactive }]}>
              {expanded ? 'Close' : 'More'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 50,
  },
  dock: {
    flexDirection: 'row',
    borderRadius: 28,
    paddingVertical: 8,
    paddingHorizontal: 6,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 40,
    elevation: 16,
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 20,
    gap: 3,
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  panel: {
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 16,
  },
  panelTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  extraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  extraIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraLabel: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    letterSpacing: -0.2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
