import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import StudentTabs from './StudentTabs';
import ChatbotScreen from '../screens/student/ChatbotScreen';
import EventSubmissionScreen from '../screens/student/EventSubmissionScreen';
import VacantRoomsScreen from '../screens/student/VacantRoomsScreen';
import NotificationsScreen from '../screens/student/NotificationsScreen';
import NoticesScreen from '../screens/student/NoticesScreen';
import ClubsScreen from '../screens/student/ClubsScreen';
import ChatScreen from '../screens/student/ChatScreen';
import StudentAdvisingScreen from '../screens/student/StudentAdvisingScreen';
import LeaveApplicationScreen from '../screens/student/LeaveApplicationScreen';
import ChatInboxScreen from '../screens/student/ChatInboxScreen';
import GlobalEventCalendarScreen from '../screens/student/GlobalEventCalendarScreen';
import MiniAppMarketplaceScreen from '../screens/student/MiniAppMarketplaceScreen';
import MiniAppShellScreen from '../screens/student/MiniAppShellScreen';
import MyDuesScreen from '../screens/student/MyDuesScreen';
import MiniAppDeveloperPortalScreen from '../screens/student/MiniAppDeveloperPortalScreen';
import BatchesScreen from '../screens/student/BatchesScreen';
import TimetableScreen from '../screens/student/TimetableScreen';
import AttendanceScreen from '../screens/student/AttendanceScreen';
import SyllabusScreen from '../screens/student/SyllabusScreen';
import IssuesScreen from '../screens/student/IssuesScreen';
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
      <Stack.Screen name="Chat" component={ChatScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Advising" component={StudentAdvisingScreen} />
      <Stack.Screen name="LeaveApplication" component={LeaveApplicationScreen} />
      <Stack.Screen name="ChatInbox" component={ChatInboxScreen} />
      <Stack.Screen name="GlobalEventCalendar" component={GlobalEventCalendarScreen} />
      <Stack.Screen name="MiniAppMarketplace" component={MiniAppMarketplaceScreen} />
      <Stack.Screen name="MiniAppShell" component={MiniAppShellScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="MiniAppDeveloperPortal" component={MiniAppDeveloperPortalScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="MyDues" component={MyDuesScreen} />
      <Stack.Screen name="Batches" component={BatchesScreen} />
      <Stack.Screen name="Timetable" component={TimetableScreen} />
      <Stack.Screen name="Attendance" component={AttendanceScreen} />
      <Stack.Screen name="Syllabus" component={SyllabusScreen} />
      <Stack.Screen name="Issues" component={IssuesScreen} />
    </Stack.Navigator>
  );
}
