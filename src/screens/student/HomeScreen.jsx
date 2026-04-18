import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const navigation = useNavigation();

  return (
    <ScrollView className="flex-1 bg-surface px-4 py-6">
      <View className="flex-row justify-between items-center mb-8">
        <View>
          <Text className="text-muted text-sm uppercase tracking-wider font-bold">Welcome back,</Text>
          <Text className="text-white text-2xl font-bold">{user?.name}</Text>
        </View>
        <TouchableOpacity onPress={logout} className="p-2 bg-card rounded-full border border-border">
          <Ionicons name="log-out-outline" size={24} color="#f1f5f9" />
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between mb-6">
        <View className="bg-card flex-1 mr-2 p-4 rounded-2xl border border-border">
          <Ionicons name="school" size={28} color="#6366f1" className="mb-2" />
          <Text className="text-white text-2xl font-bold mb-1">Semester 3</Text>
          <Text className="text-muted text-sm">COMPS</Text>
        </View>
        <View className="bg-card flex-1 ml-2 p-4 rounded-2xl border border-border">
          <Ionicons name="stats-chart" size={28} color="#22c55e" className="mb-2" />
          <Text className="text-white text-2xl font-bold mb-1">85%</Text>
          <Text className="text-muted text-sm">Overall Attendance</Text>
        </View>
      </View>

      <Text className="text-white text-lg font-bold mb-4">Quick Actions</Text>
      <View className="flex-row flex-wrap justify-between">
        <TouchableOpacity className="w-[48%] bg-card p-4 rounded-2xl border border-border mb-4 items-center">
          <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center mb-3">
            <Ionicons name="location" size={24} color="#6366f1" />
          </View>
          <Text className="text-white font-bold">Mark Attendance</Text>
        </TouchableOpacity>
        <TouchableOpacity className="w-[48%] bg-card p-4 rounded-2xl border border-border mb-4 items-center">
          <View className="w-12 h-12 rounded-full bg-warning/20 items-center justify-center mb-3">
            <Ionicons name="warning" size={24} color="#f59e0b" />
          </View>
          <Text className="text-white font-bold">Report Issue</Text>
        </TouchableOpacity>
        <TouchableOpacity className="w-[48%] bg-card p-4 rounded-2xl border border-border mb-4 items-center">
          <View className="w-12 h-12 rounded-full bg-success/20 items-center justify-center mb-3">
            <Ionicons name="calendar" size={24} color="#22c55e" />
          </View>
          <Text className="text-white font-bold">Browse Events</Text>
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
      </View>

      <TouchableOpacity 
        onPress={() => navigation.navigate('VacantRooms')}
        className="w-full bg-card p-4 rounded-2xl border border-border mb-8 flex-row items-center justify-between"
      >
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-indigo-500/20 items-center justify-center mr-4">
            <Ionicons name="door-open" size={24} color="#818cf8" />
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
