import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import FacultyTabs from './FacultyTabs';
import TimetableUploadScreen from '../screens/faculty/TimetableUploadScreen';
import AttendanceOverrideScreen from '../screens/faculty/AttendanceOverrideScreen';
import SyllabusUpdateScreen from '../screens/faculty/SyllabusUpdateScreen';

const Stack = createStackNavigator();

export default function FacultyStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FacultyTabs" component={FacultyTabs} />
      <Stack.Screen name="TimetableUpload" component={TimetableUploadScreen} />
      <Stack.Screen name="AttendanceOverride" component={AttendanceOverrideScreen} />
      <Stack.Screen name="SyllabusUpdate" component={SyllabusUpdateScreen} />
    </Stack.Navigator>
  );
}
