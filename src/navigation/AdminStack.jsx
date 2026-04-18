import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminTabs from './AdminTabs';
import EventApprovalsScreen from '../screens/admin/EventApprovalsScreen';
import TimetableReviewScreen from '../screens/admin/TimetableReviewScreen';
import IssuesResolutionScreen from '../screens/admin/IssuesResolutionScreen';
import AnalyticsDashboardScreen from '../screens/admin/AnalyticsDashboardScreen';
import LeaveApprovalsScreen from '../screens/admin/LeaveApprovalsScreen';
import NoticesScreen from '../screens/student/NoticesScreen';
import CreateNoticeScreen from '../screens/faculty/CreateNoticeScreen';
import ClubsScreen from '../screens/student/ClubsScreen';
import AdvisingScreen from '../screens/faculty/AdvisingScreen'; // Reuse faculty screen for HOD view
import RaiseDueScreen from '../screens/admin/RaiseDueScreen';

const Stack = createStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      <Stack.Screen name="EventApprovals" component={EventApprovalsScreen} />
      <Stack.Screen name="TimetableReview" component={TimetableReviewScreen} />
      <Stack.Screen name="IssuesResolution" component={IssuesResolutionScreen} />
      <Stack.Screen name="AnalyticsDashboard" component={AnalyticsDashboardScreen} />
      <Stack.Screen name="LeaveApprovals" component={LeaveApprovalsScreen} />
      <Stack.Screen name="Notices" component={NoticesScreen} />
      <Stack.Screen name="CreateNotice" component={CreateNoticeScreen} />
      <Stack.Screen name="Clubs" component={ClubsScreen} />
      <Stack.Screen name="Advising" component={AdvisingScreen} />
      <Stack.Screen name="RaiseDue" component={RaiseDueScreen} />
    </Stack.Navigator>
  );
}
