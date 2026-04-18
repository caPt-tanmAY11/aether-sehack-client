import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/student/HomeScreen';
import TimetableScreen from '../screens/student/TimetableScreen';
import AttendanceScreen from '../screens/student/AttendanceScreen';
import SyllabusScreen from '../screens/student/SyllabusScreen';
import EventsScreen from '../screens/student/EventsScreen';
import IssuesScreen from '../screens/student/IssuesScreen';
import ProfileScreen from '../screens/student/ProfileScreen';
import ClubsScreen from '../screens/student/ClubsScreen';
import BatchesScreen from '../screens/student/BatchesScreen';
import MiniAppMarketplaceScreen from '../screens/student/MiniAppMarketplaceScreen';

const Tab = createBottomTabNavigator();

export default function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Timetable') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Attendance') iconName = focused ? 'location' : 'location-outline';
          else if (route.name === 'Syllabus') iconName = focused ? 'book' : 'book-outline';
          else if (route.name === 'Events') iconName = focused ? 'flag' : 'flag-outline';
          else if (route.name === 'Issues') iconName = focused ? 'warning' : 'warning-outline';
          else if (route.name === 'Clubs') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Batches') iconName = focused ? 'layers' : 'layers-outline';
          else if (route.name === 'Apps') iconName = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor: '#334155',
          paddingBottom: 5,
          paddingTop: 5,
        },
        headerStyle: {
          backgroundColor: '#0f172a',
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: '#f1f5f9',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Timetable" component={TimetableScreen} />
      <Tab.Screen name="Attendance" component={AttendanceScreen} />
      <Tab.Screen name="Syllabus" component={SyllabusScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Issues" component={IssuesScreen} />
      <Tab.Screen name="Clubs" component={ClubsScreen} />
      <Tab.Screen name="Batches" component={BatchesScreen} />
      <Tab.Screen name="Apps" component={MiniAppMarketplaceScreen} options={{ title: 'Mini Apps' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
