import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { analyticsApi } from '../../api/analytics.api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function AdminHomeScreen() {
  const user = useAuthStore(state => state.user);
  const role = useAuthStore(state => state.role);
  const subRole = useAuthStore(state => state.subRole);
  const logout = useAuthStore(state => state.logout);
  const navigation = useNavigation();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = (role === 'dean' || role === 'superadmin') ? await analyticsApi.getDeanDashboard() : await analyticsApi.getHodDashboard();
        setStats(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (role === 'dean' || role === 'hod' || role === 'superadmin') {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [role]);

  return (
    <ScrollView className="flex-1 bg-surface px-4 py-6">
      <View className="flex-row justify-between items-center mb-8">
        <View>
          <Text className="text-muted text-sm uppercase tracking-wider font-bold">{role} Dashboard</Text>
          <Text className="text-white text-2xl font-bold">{user?.name}</Text>
        </View>
        <TouchableOpacity onPress={logout} className="p-2 bg-card rounded-full border border-border">
          <Ionicons name="log-out-outline" size={24} color="#f1f5f9" />
        </TouchableOpacity>
      </View>

      <View className="flex-row flex-wrap justify-between mb-6">
        <View className="w-[48%] bg-card p-4 rounded-2xl border border-border mb-4">
          <Ionicons name="people" size={28} color="#6366f1" className="mb-2" />
          {loading ? <ActivityIndicator size="small" color="#6366f1" /> : (
            <Text className="text-white text-2xl font-bold mb-1">{stats?.deanReport?.totalStudents || stats?.departmentSize || 0}</Text>
          )}
          <Text className="text-muted text-sm">Active Students</Text>
        </View>
        <View className="w-[48%] bg-card p-4 rounded-2xl border border-border mb-4">
          <Ionicons name="document-text" size={28} color="#22c55e" className="mb-2" />
          {loading ? <ActivityIndicator size="small" color="#22c55e" /> : (
            <Text className="text-white text-2xl font-bold mb-1">{stats?.attendance?.avgAttendancePercent ?? 0}%</Text>
          )}
          <Text className="text-muted text-sm">Avg Attendance</Text>
        </View>
        
        {(role === 'dean' || role === 'hod' || role === 'superadmin') && (
          <TouchableOpacity 
            onPress={() => navigation.navigate('IssuesResolution')}
            className="w-full bg-card p-4 rounded-2xl border border-border mt-2 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Ionicons name="warning" size={28} color="#f59e0b" className="mr-3" />
              <View>
                <Text className="text-white text-lg font-bold mb-1">Campus Issues</Text>
                <Text className="text-muted text-sm">Review & Resolve</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>

      <Text className="text-white text-lg font-bold mb-4">Action Queue</Text>
      
      {(role === 'council' || role === 'hod' || role === 'dean' || role === 'superadmin') && (
        <TouchableOpacity 
          onPress={() => navigation.navigate('EventApprovals')}
          className="bg-card p-4 rounded-2xl border border-border mb-4 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-success/20 items-center justify-center mr-3">
              <Ionicons name="flag" size={20} color="#22c55e" />
            </View>
            <View>
              <Text className="text-white font-bold text-lg">Event Approvals</Text>
              <Text className="text-muted text-sm">Pending requests</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#64748b" />
        </TouchableOpacity>
      )}

      {(role === 'hod' || role === 'superadmin') && (
        <TouchableOpacity 
          onPress={() => navigation.navigate('TimetableReview')}
          className="bg-card p-4 rounded-2xl border border-border mb-4 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-3">
              <Ionicons name="calendar" size={20} color="#6366f1" />
            </View>
            <View>
              <Text className="text-white font-bold text-lg">Timetable Review</Text>
              <Text className="text-muted text-sm">Review drafts</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#64748b" />
        </TouchableOpacity>
      )}

      {(role === 'hod') && (
        <TouchableOpacity 
          onPress={() => navigation.navigate('LeaveApprovals')}
          className="bg-card p-4 rounded-2xl border border-border mb-4 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-warning/20 items-center justify-center mr-3">
              <Ionicons name="time" size={20} color="#f59e0b" />
            </View>
            <View>
              <Text className="text-white font-bold text-lg">Leave Approvals</Text>
              <Text className="text-muted text-sm">Review faculty requests</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#64748b" />
        </TouchableOpacity>
      )}

      {(role === 'hod' || role === 'dean' || role === 'superadmin') && (
        <TouchableOpacity 
          onPress={() => navigation.navigate('RaiseDue')}
          className="bg-card p-4 rounded-2xl border border-border mb-4 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-error/20 items-center justify-center mr-3">
              <Ionicons name="cash" size={20} color="#ef4444" />
            </View>
            <View>
              <Text className="text-white font-bold text-lg">Issue Fine/Bill</Text>
              <Text className="text-muted text-sm">Raise student dues</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#64748b" />
        </TouchableOpacity>
      )}
      
      <View className="h-20" />
    </ScrollView>
  );
}
