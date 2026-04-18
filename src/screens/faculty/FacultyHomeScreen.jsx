import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function FacultyHomeScreen() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const navigation = useNavigation();

  return (
    <ScrollView className="flex-1 bg-surface px-4 py-6">
      <View className="flex-row justify-between items-center mb-8">
        <View>
          <Text className="text-muted text-sm uppercase tracking-wider font-bold">Faculty Portal</Text>
          <Text className="text-white text-2xl font-bold">Prof. {user?.name}</Text>
        </View>
        <TouchableOpacity onPress={logout} className="p-2 bg-card rounded-full border border-border">
          <Ionicons name="log-out-outline" size={24} color="#f1f5f9" />
        </TouchableOpacity>
      </View>

      <Text className="text-white text-lg font-bold mb-4">Quick Actions</Text>
      <View className="flex-row flex-wrap justify-between">
        <TouchableOpacity 
          onPress={() => navigation.navigate('TimetableUpload')}
          className="w-[48%] bg-card p-4 rounded-2xl border border-border mb-4 items-center"
        >
          <View className="w-12 h-12 rounded-full bg-success/20 items-center justify-center mb-3">
            <Ionicons name="calendar" size={24} color="#22c55e" />
          </View>
          <Text className="text-white font-bold text-center">Upload Timetable</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.navigate('SyllabusUpdate')}
          className="w-[48%] bg-card p-4 rounded-2xl border border-border mb-4 items-center"
        >
          <View className="w-12 h-12 rounded-full bg-warning/20 items-center justify-center mb-3">
            <Ionicons name="document-text" size={24} color="#f59e0b" />
          </View>
          <Text className="text-white font-bold text-center">Update Syllabus</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.navigate('AttendanceOverride')}
          className="w-full bg-card p-4 rounded-2xl border border-border mb-4 items-center flex-row justify-center"
        >
          <Ionicons name="shield-checkmark" size={24} color="#6366f1" className="mr-2" />
          <Text className="text-white font-bold text-center ml-2">Override Student Attendance</Text>
        </TouchableOpacity>
      </View>
      
      <Text className="text-white text-lg font-bold mb-4 mt-2">Today's Next Class</Text>
      <View className="bg-primary/20 p-4 rounded-2xl border border-primary mb-6 flex-row items-center justify-between">
        <View>
          <Text className="text-primary font-bold text-sm mb-1 uppercase tracking-wider">Upcoming</Text>
          <Text className="text-white text-lg font-bold mb-1">Check full timetable</Text>
          <Text className="text-slate-300 text-sm mt-1">Navigate to Timetable view to see classes.</Text>
        </View>
        <View className="w-12 h-12 bg-primary rounded-full items-center justify-center">
          <Ionicons name="time" size={24} color="white" />
        </View>
      </View>
    </ScrollView>
  );
}
