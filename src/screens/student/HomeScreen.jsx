import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { useNotificationsStore } from '../../store/notifications.store';
import { attendanceApi } from '../../api/attendance.api';
import { timetableApi } from '../../api/timetable.api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const unreadCount = useNotificationsStore(state => state.unreadCount);
  const navigation = useNavigation();

  const [attendance, setAttendance] = useState(null);
  const [nextClass, setNextClass] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [attRes, classRes] = await Promise.all([
          attendanceApi.getReport().catch(() => null),
          timetableApi.getNextClass().catch(() => null)
        ]);
        setAttendance(attRes);
        setNextClass(classRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <ScrollView className="flex-1 bg-surface px-4 py-6">
      <View className="flex-row justify-between items-center mb-8">
        <View>
          <Text className="text-muted text-sm uppercase tracking-wider font-bold">Welcome back,</Text>
          <Text className="text-white text-2xl font-bold">{user?.name}</Text>
          <View className="flex-row items-center mt-1 flex-wrap">
            {user?.semester ? (
              <View className="bg-primary/20 border border-primary/40 px-2.5 py-0.5 rounded-full mr-2">
                <Text className="text-primary text-xs font-bold">Sem {user.semester}</Text>
              </View>
            ) : null}
            {user?.division ? (
              <View className="bg-card border border-border px-2.5 py-0.5 rounded-full mr-2">
                <Text className="text-muted text-xs font-bold">Div {user.division}</Text>
              </View>
            ) : null}
            {user?.departmentId?.name ? (
              <Text className="text-muted text-xs">{user.departmentId.name}</Text>
            ) : null}
          </View>
        </View>
        <View className="flex-row">
          <TouchableOpacity 
            onPress={() => navigation.navigate('Notifications')} 
            className="p-2 bg-card rounded-full border border-border mr-2 relative"
          >
            <Ionicons name="notifications-outline" size={24} color="#f1f5f9" />
            {unreadCount > 0 && (
              <View className="absolute top-0 right-0 bg-error w-5 h-5 rounded-full items-center justify-center">
                <Text className="text-white text-xs font-bold">{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} className="p-2 bg-card rounded-full border border-border">
            <Ionicons name="log-out-outline" size={24} color="#f1f5f9" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row justify-between mb-6">
        <View className="bg-card flex-1 mr-2 p-4 rounded-2xl border border-border">
          <Ionicons name="school" size={28} color="#6366f1" className="mb-2" />
          <Text className="text-white text-2xl font-bold mb-1">Sem {user?.semester || '?'}</Text>
          <Text className="text-muted text-sm">{user?.departmentId?.name || 'Department'}</Text>
        </View>
        <View className="bg-card flex-1 ml-2 p-4 rounded-2xl border border-border">
          <Ionicons name="stats-chart" size={28} color="#22c55e" className="mb-2" />
          {loading ? (
             <ActivityIndicator color="#22c55e" size="small" />
          ) : (
            <Text className="text-white text-2xl font-bold mb-1">{attendance?.overallPercent ?? 0}%</Text>
          )}
          <Text className="text-muted text-sm">Overall Attendance</Text>
        </View>
      </View>

      {nextClass && (
        <View className="bg-primary/20 p-4 rounded-2xl border border-primary mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-primary font-bold text-sm mb-1 uppercase tracking-wider">Next Class</Text>
            <Text className="text-white text-lg font-bold">{nextClass.subject?.name}</Text>
            <Text className="text-slate-300 text-sm mt-1">
              {nextClass.startTime} - {nextClass.endTime} • {nextClass.room?.name}
            </Text>
          </View>
          <View className="w-12 h-12 bg-primary rounded-full items-center justify-center">
            <Ionicons name="time" size={24} color="white" />
          </View>
        </View>
      )}

      <Text className="text-white text-lg font-bold mb-4">Quick Actions</Text>
      <View className="flex-row flex-wrap justify-between">
        <TouchableOpacity 
          onPress={() => navigation.navigate('Attendance')}
          className="w-[48%] bg-card p-4 rounded-2xl border border-border mb-4 items-center"
        >
          <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center mb-3">
            <Ionicons name="location" size={24} color="#6366f1" />
          </View>
          <Text className="text-white font-bold">Mark Attendance</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Issues')}
          className="w-[48%] bg-card p-4 rounded-2xl border border-border mb-4 items-center"
        >
          <View className="w-12 h-12 rounded-full bg-warning/20 items-center justify-center mb-3">
            <Ionicons name="warning" size={24} color="#f59e0b" />
          </View>
          <Text className="text-white font-bold">Report Issue</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Notices')}
          className="w-[48%] bg-card p-4 rounded-2xl border border-border mb-4 items-center"
        >
          <View className="w-12 h-12 rounded-full bg-indigo-500/20 items-center justify-center mb-3">
            <Ionicons name="document-text" size={24} color="#818cf8" />
          </View>
          <Text className="text-white font-bold">Campus Notices</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Chatbot')}
          className="w-[48%] bg-card p-4 rounded-2xl border border-border mb-4 items-center"
        >
          <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center mb-3">
            <Ionicons name="chatbubbles" size={24} color="#6366f1" />
          </View>
          <Text className="text-white font-bold">Ask Aether AI</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Advising')}
          className="w-[48%] bg-card p-4 rounded-2xl border border-border mb-4 items-center"
        >
          <View className="w-12 h-12 rounded-full bg-warning/20 items-center justify-center mb-3">
            <Ionicons name="school-outline" size={24} color="#f59e0b" />
          </View>
          <Text className="text-white font-bold">Advising</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.navigate('LeaveApplication')}
          className="w-[48%] bg-card p-4 rounded-2xl border border-border mb-4 items-center"
        >
          <View className="w-12 h-12 rounded-full bg-success/20 items-center justify-center mb-3">
            <Ionicons name="document-outline" size={24} color="#22c55e" />
          </View>
          <Text className="text-white font-bold">Apply Leave</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.navigate('ChatInbox')}
          className="w-[48%] bg-card p-4 rounded-2xl border border-border mb-4 items-center"
        >
          <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center mb-3">
            <Ionicons name="chatbubbles-outline" size={24} color="#6366f1" />
          </View>
          <Text className="text-white font-bold">Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.navigate('GlobalEventCalendar')}
          className="w-full bg-card p-4 rounded-2xl border border-border mb-4 items-center"
        >
          <View className="w-12 h-12 rounded-full bg-indigo-500/20 items-center justify-center mb-3">
            <Ionicons name="calendar-outline" size={24} color="#818cf8" />
          </View>
          <Text className="text-white font-bold">Global Event Calendar</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        onPress={() => navigation.navigate('VacantRooms')}
        className="w-full bg-card p-4 rounded-2xl border border-border mb-8 flex-row items-center justify-between"
      >
        <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-indigo-500/20 items-center justify-center mr-3">
              <Ionicons name="enter-outline" size={20} color="#818cf8" />
            </View>
          <View>
            <Text className="text-white text-lg font-bold">Vacant Classrooms</Text>
            <Text className="text-muted text-sm mt-1">Find empty rooms right now</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#64748b" />
      </TouchableOpacity>
    </ScrollView>
  );
}
