import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/auth.store';
import LoginScreen from '../screens/auth/LoginScreen';
import StudentStack from './StudentStack';
import FacultyStack from './FacultyStack';
import AdminStack from './AdminStack';
import CommitteeStack from './CommitteeStack';
import { useSocket } from '../hooks/SocketContext';

export default function RootNavigator() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const role = useAuthStore(state => state.role);
  
  // The context provider handles connection automatically

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Role based routing
  if (role === 'student') return <StudentStack />;
  if (role === 'faculty') return <FacultyStack />;
  if (role === 'committee') return <CommitteeStack />;
  
  // Council, HOD, Dean, Superadmin
  if (['council', 'hod', 'dean', 'superadmin'].includes(role)) return <AdminStack />;
  
  return <LoginScreen />; // Fallback
}
