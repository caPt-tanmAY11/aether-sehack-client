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
import ChatbotScreen from '../screens/student/ChatbotScreen';
import EventSubmissionScreen from '../screens/student/EventSubmissionScreen';
import VacantRoomsScreen from '../screens/student/VacantRoomsScreen';
import ChatScreen from '../screens/student/ChatScreen';
import StudentAdvisingScreen from '../screens/student/StudentAdvisingScreen';
import LeaveApplicationScreen from '../screens/student/LeaveApplicationScreen';
import ChatInboxScreen from '../screens/student/ChatInboxScreen';
import GlobalEventCalendarScreen from '../screens/student/GlobalEventCalendarScreen';
import MyDuesScreen from '../screens/student/MyDuesScreen';
import TimetableScreen from '../screens/student/TimetableScreen';
import AttendanceScreen from '../screens/student/AttendanceScreen';
import SyllabusScreen from '../screens/student/SyllabusScreen';
import IssuesScreen from '../screens/student/IssuesScreen';

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
      {/* Student Screens for Council Members */}
      <Stack.Screen name="Chatbot" component={ChatbotScreen} />
      <Stack.Screen name="EventSubmission" component={EventSubmissionScreen} />
      <Stack.Screen name="VacantRooms" component={VacantRoomsScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="StudentAdvising" component={StudentAdvisingScreen} />
      <Stack.Screen name="LeaveApplication" component={LeaveApplicationScreen} />
      <Stack.Screen name="ChatInbox" component={ChatInboxScreen} />
      <Stack.Screen name="GlobalEventCalendar" component={GlobalEventCalendarScreen} />
      <Stack.Screen name="MyDues" component={MyDuesScreen} />
      <Stack.Screen name="Timetable" component={TimetableScreen} />
      <Stack.Screen name="Attendance" component={AttendanceScreen} />
      <Stack.Screen name="Syllabus" component={SyllabusScreen} />
      <Stack.Screen name="Issues" component={IssuesScreen} />
    </Stack.Navigator>
  );
}
