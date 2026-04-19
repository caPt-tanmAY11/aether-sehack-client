import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CommitteeDashboardScreen from '../screens/committee/CommitteeDashboardScreen';
import GlobalEventCalendarScreen from '../screens/student/GlobalEventCalendarScreen';
import EventSubmissionScreen from '../screens/student/EventSubmissionScreen';
import EventDetailScreen from '../screens/shared/EventDetailScreen';

const Stack = createStackNavigator();

export default function CommitteeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CommitteeDashboard" component={CommitteeDashboardScreen} />
      <Stack.Screen name="GlobalEventCalendar" component={GlobalEventCalendarScreen} />
      <Stack.Screen name="EventSubmission" component={EventSubmissionScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ animation: 'slide_from_right' }} />
    </Stack.Navigator>
  );
}
