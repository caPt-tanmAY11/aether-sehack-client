import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { analyticsApi } from '../../api/analytics.api';
import { useAuthStore } from '../../store/auth.store';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function AnalyticsDashboardScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const role = useAuthStore(state => state.role);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = (role === 'dean' || role === 'superadmin') ? await analyticsApi.getDeanDashboard() : await analyticsApi.getHodDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <View className="flex-1 bg-surface justify-center items-center"><ActivityIndicator color="#6366f1" size="large" /></View>;
  }

  // Simplified chart rendering using progress bars
  const renderProgressBar = (label, percent, colorClass) => (
    <View className="mb-4">
      <View className="flex-row justify-between mb-1">
        <Text className="text-white text-sm">{label}</Text>
        <Text className="text-muted text-sm">{percent}%</Text>
      </View>
      <View className="h-2 bg-surface rounded-full overflow-hidden">
        <View className={`h-full ${colorClass}`} style={{ width: `${percent}%` }} />
      </View>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-surface px-4 py-6">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Analytics Dashboard</Text>
      </View>

      <Text className="text-white text-lg font-bold mb-4">Overall Metrics</Text>
      <View className="bg-card p-4 rounded-2xl border border-border mb-6">
        {data.attendance ? renderProgressBar('Avg Campus Attendance', data.attendance.avgAttendancePercent, 'bg-primary') : null}
        {data.syllabus ? renderProgressBar('Avg Syllabus Progress', data.syllabus.avgProgressPercent, 'bg-success') : null}
        {data.issues ? renderProgressBar('Issue Resolution Rate', Math.round((data.issues.resolved / (data.issues.total || 1)) * 100), 'bg-warning') : null}
      </View>

      <Text className="text-white text-lg font-bold mb-4">Detailed Reports (JSON Dump)</Text>
      <View className="bg-card p-4 rounded-2xl border border-border mb-8">
        <Text className="text-muted text-xs font-mono">{JSON.stringify(data, null, 2)}</Text>
      </View>

    </ScrollView>
  );
}
