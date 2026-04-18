import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import AnalyticsDashboardScreen from '../screens/admin/AnalyticsDashboardScreen';
import ProfileScreen from '../screens/student/ProfileScreen'; // Reusing profile screen
import { useAuthStore } from '../store/auth.store';

const Tab = createBottomTabNavigator();

export default function AdminTabs() {
  const role = useAuthStore(state => state.role);
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Analytics') iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          else if (route.name === 'Notices') iconName = focused ? 'megaphone' : 'megaphone-outline';
          else if (route.name === 'Approvals') iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor: '#334155',
        },
        headerStyle: {
          backgroundColor: '#0f172a',
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: '#f1f5f9',
      })}
    >
      <Tab.Screen name="Home" component={AdminHomeScreen} options={{ title: `${role.toUpperCase()} Portal` }} />
      {(role === 'hod' || role === 'dean' || role === 'superadmin') && (
        <Tab.Screen name="Analytics" component={AnalyticsDashboardScreen} />
      )}
      <Tab.Screen name="Notices" component={require('../screens/student/NoticesScreen').default} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
