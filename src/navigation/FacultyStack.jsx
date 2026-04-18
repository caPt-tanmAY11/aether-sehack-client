import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import FacultyTabs from './FacultyTabs';
import TimetableUploadScreen from '../screens/faculty/TimetableUploadScreen';
import AttendanceOverrideScreen from '../screens/faculty/AttendanceOverrideScreen';
import AttendanceViewerScreen from '../screens/faculty/AttendanceViewerScreen';
import SyllabusUpdateScreen from '../screens/faculty/SyllabusUpdateScreen';
import NoticesScreen from '../screens/student/NoticesScreen';
import CreateNoticeScreen from '../screens/faculty/CreateNoticeScreen';
import AdvisingScreen from '../screens/faculty/AdvisingScreen';
import LeaveScreen from '../screens/faculty/LeaveScreen';
import BatchesScreen from '../screens/faculty/BatchesScreen';
import FacultyChatScreen from '../screens/faculty/FacultyChatScreen';
import StudentLeavesScreen from '../screens/faculty/StudentLeavesScreen';
import FacultyTimetableStatusScreen from '../screens/faculty/FacultyTimetableStatusScreen';
import NotificationsScreen from '../screens/student/NotificationsScreen';

const Stack = createStackNavigator();

export default function FacultyStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FacultyTabs" component={FacultyTabs} />
      <Stack.Screen name="TimetableUpload" component={TimetableUploadScreen} />
      <Stack.Screen name="AttendanceOverride" component={AttendanceOverrideScreen} />
      <Stack.Screen name="AttendanceViewer" component={AttendanceViewerScreen} />
      <Stack.Screen name="SyllabusUpdate" component={SyllabusUpdateScreen} />
      <Stack.Screen name="Notices" component={NoticesScreen} />
      <Stack.Screen name="CreateNotice" component={CreateNoticeScreen} />
      <Stack.Screen name="Advising" component={AdvisingScreen} />
      <Stack.Screen name="Leave" component={LeaveScreen} />
      <Stack.Screen name="Batches" component={BatchesScreen} />
      <Stack.Screen name="FacultyChat" component={FacultyChatScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="StudentLeaves" component={StudentLeavesScreen} />
      <Stack.Screen name="TimetableStatus" component={FacultyTimetableStatusScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}
