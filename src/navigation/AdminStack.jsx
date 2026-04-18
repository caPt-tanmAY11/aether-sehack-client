import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminTabs from './AdminTabs';
import EventApprovalsScreen from '../screens/admin/EventApprovalsScreen';
import TimetableReviewScreen from '../screens/admin/TimetableReviewScreen';
import IssuesResolutionScreen from '../screens/admin/IssuesResolutionScreen';
import AnalyticsDashboardScreen from '../screens/admin/AnalyticsDashboardScreen';

const Stack = createStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      <Stack.Screen name="EventApprovals" component={EventApprovalsScreen} />
      <Stack.Screen name="TimetableReview" component={TimetableReviewScreen} />
      <Stack.Screen name="IssuesResolution" component={IssuesResolutionScreen} />
      <Stack.Screen name="AnalyticsDashboard" component={AnalyticsDashboardScreen} />
    </Stack.Navigator>
  );
}
