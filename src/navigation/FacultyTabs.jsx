import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import FacultyHomeScreen from '../screens/faculty/FacultyHomeScreen';
import ProfileScreen from '../screens/student/ProfileScreen'; // Reusing profile screen

const Tab = createBottomTabNavigator();

export default function FacultyTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Notices') iconName = focused ? 'megaphone' : 'megaphone-outline';
          else if (route.name === 'Advising') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Leave') iconName = focused ? 'calendar' : 'calendar-outline';
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
      <Tab.Screen name="Home" component={FacultyHomeScreen} options={{ title: 'Faculty Portal' }} />
      <Tab.Screen name="Notices" component={require('../screens/student/NoticesScreen').default} />
      <Tab.Screen name="Advising" component={require('../screens/faculty/AdvisingScreen').default} />
      <Tab.Screen name="Leave" component={require('../screens/faculty/LeaveScreen').default} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
