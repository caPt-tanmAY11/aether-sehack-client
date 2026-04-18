import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth.store';

export default function ProfileScreen() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  return (
    <ScrollView className="flex-1 bg-surface px-4 pt-6">
      <View className="items-center mb-8">
        <View className="w-24 h-24 rounded-full bg-primary/20 items-center justify-center mb-4 border-2 border-primary">
          <Text className="text-primary text-3xl font-bold">{user?.name?.charAt(0)}</Text>
        </View>
        <Text className="text-white text-2xl font-bold">{user?.name}</Text>
        <Text className="text-muted text-base">{user?.email}</Text>
      </View>

      <View className="bg-card rounded-2xl border border-border p-4 mb-6">
        <View className="flex-row py-3 border-b border-border">
          <Text className="text-muted w-24">Role</Text>
          <Text className="text-white capitalize flex-1">{user?.role} {user?.subRole ? `(${user?.subRole})` : ''}</Text>
        </View>
        <View className="flex-row py-3 border-b border-border">
          <Text className="text-muted w-24">Department</Text>
          <Text className="text-white flex-1">{user?.departmentId?.name || 'N/A'}</Text>
        </View>
        <View className="flex-row py-3 border-b border-border">
          <Text className="text-muted w-24">Division</Text>
          <Text className="text-white flex-1">{user?.division || 'N/A'}</Text>
        </View>
        <View className="flex-row py-3 border-b border-border">
          <Text className="text-muted w-24">Semester</Text>
          <Text className="text-white flex-1">{user?.semester || 'N/A'}</Text>
        </View>
        <View className="flex-row py-3">
          <Text className="text-muted w-24">App Version</Text>
          <Text className="text-white flex-1">1.0.0 (Phase 11)</Text>
        </View>
      </View>

      <TouchableOpacity 
        onPress={logout}
        className="bg-error/10 p-4 rounded-xl flex-row justify-center items-center border border-error/30"
      >
        <Ionicons name="log-out-outline" size={24} color="#ef4444" className="mr-2" />
        <Text className="text-error font-bold text-lg ml-2">Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
