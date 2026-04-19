import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import FloatingTabBar from '../components/FloatingTabBar';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import HomeScreen from '../screens/student/HomeScreen';
import AnalyticsDashboardScreen from '../screens/admin/AnalyticsDashboardScreen';
import EventApprovalsScreen from '../screens/admin/EventApprovalsScreen';
import NotificationsScreen from '../screens/student/NotificationsScreen';
import ProfileScreen from '../screens/student/ProfileScreen'; // Reusing profile screen
import { useAuthStore } from '../store/auth.store';

const Tab = createBottomTabNavigator();

export default function AdminTabs() {
  const role = useAuthStore(state => state.role);
  
  return (
    <>
    <Tab.Navigator
      tabBar={props => <FloatingTabBar {...props} />}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Personal') iconName = focused ? 'person-circle' : 'person-circle-outline';
          else if (route.name === 'Admin' || route.name === 'Council') iconName = focused ? 'briefcase' : 'briefcase-outline';
          else if (route.name === 'Analytics') iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          else if (route.name === 'Approvals') iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
          else if (route.name === 'Notifications') iconName = focused ? 'notifications' : 'notifications-outline';
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
        headerShown: false,
      })}
    >
      <Tab.Screen name="Personal" component={HomeScreen} options={{ title: 'Personal' }} />
      <Tab.Screen 
        name={role === 'council' ? 'Council' : 'Admin'} 
        component={AdminHomeScreen} 
        options={{ title: role === 'council' ? 'Council Duties' : 'Admin' }} 
      />
      {(role === 'hod' || role === 'dean' || role === 'superadmin') && (
        <Tab.Screen name="Analytics" component={AnalyticsDashboardScreen} />
      )}
      {(role === 'council' || role === 'hod' || role === 'dean' || role === 'superadmin') && (
        <Tab.Screen name="Approvals" component={EventApprovalsScreen} options={{ title: 'Approvals' }} />
      )}
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
    </>
  );
}
