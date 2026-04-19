import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth.store';

export default function ProfileScreen() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f9fb' }}>
      {/* Top Header */}
      <View style={{ paddingTop: 50, paddingBottom: 16, paddingHorizontal: 24, zIndex: 10, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#eceef0' }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: '#091426', fontFamily: 'Plus Jakarta Sans' }}>My Profile</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
        
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#e9ddff', alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#6b38d4', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 5 }}>
            <Text style={{ color: '#6b38d4', fontSize: 36, fontWeight: '800' }}>{user?.name?.charAt(0)}</Text>
          </View>
          <Text style={{ color: '#091426', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 }}>{user?.name}</Text>
          <Text style={{ color: '#8590a6', fontSize: 14, marginTop: 4 }}>{user?.email}</Text>
        </View>

        <View style={{ backgroundColor: '#ffffff', borderRadius: 24, padding: 20, shadowColor: '#091426', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 16, elevation: 2, marginBottom: 24 }}>
          
          <View style={{ flexDirection: 'row', py: 16, borderBottomWidth: 1, borderBottomColor: '#f2f4f6', paddingVertical: 16 }}>
            <Text style={{ color: '#8590a6', width: 100, fontWeight: '600' }}>Role</Text>
            <Text style={{ color: '#091426', flex: 1, fontWeight: 'bold', textTransform: 'capitalize' }}>{user?.role} {user?.subRole ? `(${user?.subRole})` : ''}</Text>
          </View>

          <View style={{ flexDirection: 'row', py: 16, borderBottomWidth: 1, borderBottomColor: '#f2f4f6', paddingVertical: 16 }}>
            <Text style={{ color: '#8590a6', width: 100, fontWeight: '600' }}>Department</Text>
            <Text style={{ color: '#091426', flex: 1, fontWeight: 'bold' }}>{user?.departmentId?.name || 'N/A'}</Text>
          </View>

          <View style={{ flexDirection: 'row', py: 16, borderBottomWidth: 1, borderBottomColor: '#f2f4f6', paddingVertical: 16 }}>
            <Text style={{ color: '#8590a6', width: 100, fontWeight: '600' }}>Division</Text>
            <Text style={{ color: '#091426', flex: 1, fontWeight: 'bold' }}>{user?.division || 'N/A'}</Text>
          </View>

          <View style={{ flexDirection: 'row', py: 16, borderBottomWidth: 1, borderBottomColor: '#f2f4f6', paddingVertical: 16 }}>
            <Text style={{ color: '#8590a6', width: 100, fontWeight: '600' }}>Semester</Text>
            <Text style={{ color: '#091426', flex: 1, fontWeight: 'bold' }}>{user?.semester || 'N/A'}</Text>
          </View>

          <View style={{ flexDirection: 'row', paddingTop: 16 }}>
            <Text style={{ color: '#8590a6', width: 100, fontWeight: '600' }}>App Version</Text>
            <Text style={{ color: '#091426', flex: 1, fontWeight: 'bold' }}>1.0.0 (Glass UI)</Text>
          </View>

        </View>

        <TouchableOpacity 
          onPress={logout}
          style={{ backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#ffdad6', padding: 16, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
        >
          <Ionicons name="log-out-outline" size={20} color="#ba1a1a" style={{ marginRight: 8 }} />
          <Text style={{ color: '#ba1a1a', fontWeight: 'bold', fontSize: 16 }}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
