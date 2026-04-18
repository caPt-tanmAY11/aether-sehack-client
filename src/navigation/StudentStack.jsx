import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import StudentTabs from './StudentTabs';
import ChatbotScreen from '../screens/student/ChatbotScreen';
import EventSubmissionScreen from '../screens/student/EventSubmissionScreen';
import VacantRoomsScreen from '../screens/student/VacantRoomsScreen';

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
    </Stack.Navigator>
  );
}
