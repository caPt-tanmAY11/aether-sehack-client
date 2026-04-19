import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FloatingTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const [isExpanded, setIsExpanded] = useState(false);

  const mainRoutes = state.routes.slice(0, 4);
  const extraRoutes = state.routes.slice(4);

  const renderTab = (route, index, isExtra = false) => {
    const { options } = descriptors[route.key];
    const label =
      options.tabBarLabel !== undefined
        ? options.tabBarLabel
        : options.title !== undefined
        ? options.title
        : route.name;

    const isFocused = state.index === index;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
      if (isExtra) setIsExpanded(false);
    };

    let iconName;
    if (route.name === 'Home' || route.name === 'Personal') iconName = isFocused ? 'home' : 'home-outline';
    else if (route.name === 'Timetable') iconName = isFocused ? 'calendar' : 'calendar-outline';
    else if (route.name === 'Attendance') iconName = isFocused ? 'location' : 'location-outline';
    else if (route.name === 'Syllabus') iconName = isFocused ? 'book' : 'book-outline';
    else if (route.name === 'Events') iconName = isFocused ? 'flag' : 'flag-outline';
    else if (route.name === 'Issues') iconName = isFocused ? 'warning' : 'warning-outline';
    else if (route.name === 'Clubs') iconName = isFocused ? 'people' : 'people-outline';
    else if (route.name === 'Batches') iconName = isFocused ? 'layers' : 'layers-outline';
    else if (route.name === 'Apps') iconName = isFocused ? 'apps' : 'apps-outline';
    else if (route.name === 'Profile') iconName = isFocused ? 'person' : 'person-outline';
    else iconName = 'ellipse'; 

    return (
      <TouchableOpacity
        key={route.key}
        onPress={onPress}
        style={[styles.tabButton, isFocused && !isExtra && styles.activeTabButton, isExtra && styles.extraTabButton]}
        activeOpacity={0.8}
      >
        <Ionicons 
          name={iconName} 
          size={isExtra ? 20 : 22} 
          color={isFocused ? (isExtra ? '#6b38d4' : '#ffffff') : '#94a3b8'} 
        />
        <Text 
          style={[styles.tabLabel, isFocused && !isExtra && styles.activeTabLabel, isExtra && { marginLeft: 12, marginTop: 0, fontSize: 14, color: isFocused ? '#6b38d4' : '#091426' }]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { bottom: insets.bottom + 20 }]}>
      {isExpanded && (
        <View style={styles.expandedMenu}>
            {extraRoutes.map((route) => {
                const originalIndex = state.routes.findIndex(r => r.key === route.key);
                return renderTab(route, originalIndex, true);
            })}
        </View>
      )}
      
      <View style={styles.blurContainer}>
        {mainRoutes.map((route, idx) => renderTab(route, idx, false))}

        {extraRoutes.length > 0 && (
          <TouchableOpacity
            onPress={() => setIsExpanded(!isExpanded)}
            style={[styles.tabButton, isExpanded && styles.activeTabButton]}
            activeOpacity={0.8}
          >
            <Ionicons 
              name="ellipsis-horizontal" 
              size={22} 
              color={isExpanded ? '#ffffff' : '#94a3b8'} 
            />
            <Text style={[styles.tabLabel, isExpanded && styles.activeTabLabel]}>
              More
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: '4%',
    right: '4%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  expandedMenu: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#091426',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
    alignItems: 'flex-start'
  },
  blurContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 8,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#091426',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 999,
  },
  extraTabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  activeTabButton: {
    backgroundColor: '#6b38d4', 
  },
  tabLabel: {
    fontFamily: 'Plus Jakarta Sans', 
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeTabLabel: {
    color: '#ffffff',
  },
});
