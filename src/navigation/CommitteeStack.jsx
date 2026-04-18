import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CommitteeDashboardScreen from '../screens/committee/CommitteeDashboardScreen';
import GlobalEventCalendarScreen from '../screens/student/GlobalEventCalendarScreen';
import EventSubmissionScreen from '../screens/student/EventSubmissionScreen';

const Stack = createStackNavigator();

export default function CommitteeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CommitteeDashboard" component={CommitteeDashboardScreen} />
      <Stack.Screen name="GlobalEventCalendar" component={GlobalEventCalendarScreen} />
      <Stack.Screen name="EventSubmission" component={EventSubmissionScreen} />
    </Stack.Navigator>
  );
}
