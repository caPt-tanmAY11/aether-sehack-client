import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
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
    <View style={{ flex: 1, backgroundColor: '#f7f9fb' }}>
        {/* Top App Bar fixed at top */}
        <View style={{ paddingTop: 50, paddingBottom: 16, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#eceef0' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, overflow: 'hidden', backgroundColor: '#e0e3e5' }}>
                    <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVIWY4ppmBzumHMrG_-pUWUKlkUk1XXcIKHFIRNFRWfPTtwkaHNv-JVkfZ3PsciVV6U7hvUxjj2F-GpfGRLaqbE0iEJ70bF3x79lOfSBwXnWRYAtAWlBRJt4FNc8NxtPNI7x-JCXVOzTM6egZ9ncS6w1aL0q5aynuqDeRTvnASV2SRtPA-DxnUK99PYMyfuMG8w8iuYtilYWnHELqNZ_Usm90dNLBG_T7A23Jv7VLN15MThhlMBlbD4Oxfir4oxxrkzdgS8w8lTw' }} style={{ width: '100%', height: '100%' }} />
                </View>
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#091426', letterSpacing: -0.5, fontFamily: 'Plus Jakarta Sans' }}>Scholar Flow</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <TouchableOpacity onPress={logout}>
                    <Ionicons name="log-out-outline" size={24} color="#091426" />
                </TouchableOpacity>
            </View>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
            {/* Welcome Header */}
            <View style={{ marginBottom: 30 }}>
                <Text style={{ color: '#6b38d4', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>{role} Portal</Text>
                <Text style={{ fontSize: 42, fontWeight: '900', color: '#091426', lineHeight: 46, letterSpacing: -1 }}>Welcome, {user?.name?.split(' ')[0]}</Text>
                <Text style={{ color: '#45474c', marginTop: 8 }}>Campus administration overview.</Text>
            </View>

            {/* Bento Grid */}
            <View style={{ flexDirection: 'row', gap: 16, marginBottom: 24 }}>
                <View style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: 24, padding: 20, shadowColor: '#091426', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 24, elevation: 2 }}>
                    <Text style={{ color: '#091426', fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>Active Students</Text>
                    <Text style={{ color: '#45474c', fontSize: 12, marginBottom: 16 }}>Total Enrolled</Text>
                    {loading ? <ActivityIndicator color="#6b38d4" /> : (
                        <View style={{ alignItems: 'flex-start', justifyContent: 'center', paddingVertical: 10 }}>
                            <Text style={{ fontSize: 36, fontWeight: '800', color: '#6b38d4' }}>{stats?.deanReport?.totalStudents || stats?.departmentSize || 0}</Text>
                        </View>
                    )}
                </View>
                
                <View style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: 24, padding: 20, shadowColor: '#091426', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 24, elevation: 2 }}>
                    <Text style={{ color: '#091426', fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>Avg Attendance</Text>
                    <Text style={{ color: '#45474c', fontSize: 12, marginBottom: 16 }}>Campus Pulse</Text>
                    {loading ? <ActivityIndicator color="#22c55e" /> : (
                        <View style={{ alignItems: 'flex-start', justifyContent: 'center', paddingVertical: 10 }}>
                            <Text style={{ fontSize: 36, fontWeight: '800', color: '#22c55e' }}>{stats?.attendance?.avgAttendancePercent ?? 0}%</Text>
                        </View>
                    )}
                </View>
            </View>

            {(role === 'dean' || role === 'hod' || role === 'superadmin') && (
            <TouchableOpacity onPress={() => navigation.navigate('IssuesResolution')} style={{ backgroundColor: '#ffdad6', borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: '#ba1a1a', alignItems: 'center', justifyContent: 'center', shadowColor: '#ba1a1a', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: {height: 4} }}>
                    <Ionicons name="warning" size={32} color="#ffffff" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: '#ba1a1a', fontWeight: 'bold', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Action Required</Text>
                    <Text style={{ color: '#93000a', fontWeight: 'bold', fontSize: 18, lineHeight: 22 }}>Review Campus Issues</Text>
                </View>
            </TouchableOpacity>
            )}

            {/* Quick Actions ScrollView */}
            <Text style={{ color: '#091426', fontWeight: 'bold', fontSize: 18, marginBottom: 16, paddingHorizontal: 4 }}>Administrative Queue</Text>
            <View style={{ flexDirection: 'column', gap: 12 }}>
                
                {(role === 'council' || role === 'hod' || role === 'dean' || role === 'superadmin') && (
                <TouchableOpacity onPress={() => navigation.navigate('EventApprovals')} style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#d8e3fb', alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name="flag" size={24} color="#091426" />
                        </View>
                        <View>
                            <Text style={{ color: '#091426', fontWeight: 'bold', fontSize: 16 }}>Event Approvals</Text>
                            <Text style={{ color: '#45474c', fontSize: 12 }}>Pending requests</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#c5c6cd" />
                </TouchableOpacity>
                )}

                {(role === 'hod' || role === 'superadmin') && (
                <TouchableOpacity onPress={() => navigation.navigate('TimetableReview')} style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#e9ddff', alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name="calendar" size={24} color="#6b38d4" />
                        </View>
                        <View>
                            <Text style={{ color: '#091426', fontWeight: 'bold', fontSize: 16 }}>Timetable Review</Text>
                            <Text style={{ color: '#45474c', fontSize: 12 }}>Review drafts</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#c5c6cd" />
                </TouchableOpacity>
                )}

                {(role === 'hod') && (
                <TouchableOpacity onPress={() => navigation.navigate('LeaveApprovals')} style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(245, 158, 11, 0.15)', alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name="time" size={24} color="#f59e0b" />
                        </View>
                        <View>
                            <Text style={{ color: '#091426', fontWeight: 'bold', fontSize: 16 }}>Leave Approvals</Text>
                            <Text style={{ color: '#45474c', fontSize: 12 }}>Review faculty requests</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#c5c6cd" />
                </TouchableOpacity>
                )}

                {(role === 'hod' || role === 'dean' || role === 'superadmin') && (
                <TouchableOpacity onPress={() => navigation.navigate('RaiseDue')} style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#ffdad6', alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name="cash" size={24} color="#ba1a1a" />
                        </View>
                        <View>
                            <Text style={{ color: '#091426', fontWeight: 'bold', fontSize: 16 }}>Issue Fine/Bill</Text>
                            <Text style={{ color: '#45474c', fontSize: 12 }}>Raise student dues</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#c5c6cd" />
                </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    </View>
  );
}
