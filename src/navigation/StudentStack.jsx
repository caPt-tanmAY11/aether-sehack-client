import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import StudentTabs from './StudentTabs';
import ChatbotScreen from '../screens/student/ChatbotScreen';
import EventSubmissionScreen from '../screens/student/EventSubmissionScreen';
import VacantRoomsScreen from '../screens/student/VacantRoomsScreen';
import NotificationsScreen from '../screens/student/NotificationsScreen';
import NoticesScreen from '../screens/student/NoticesScreen';
import ClubsScreen from '../screens/student/ClubsScreen';

const Stack = createStackNavigator();

export default function StudentStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudentTabs" component={StudentTabs} />
      <Stack.Screen 
        name="Chatbot" 
        component={ChatbotScreen} 
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="EventSubmission" component={EventSubmissionScreen} />
      <Stack.Screen name="VacantRooms" component={VacantRoomsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Notices" component={NoticesScreen} />
      <Stack.Screen name="Clubs" component={ClubsScreen} />
    </Stack.Navigator>
  );
}
