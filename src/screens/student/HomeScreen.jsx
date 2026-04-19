import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { useNotificationsStore } from '../../store/notifications.store';
import { attendanceApi } from '../../api/attendance.api';
import { timetableApi } from '../../api/timetable.api';
import { paymentsApi } from '../../api/payments.api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSocket } from '../../hooks/SocketContext';

export default function HomeScreen() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const unreadCount = useNotificationsStore(state => state.unreadCount);
  const navigation = useNavigation();

  const [attendance, setAttendance] = useState(null);
  const [nextClass, setNextClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [outstanding, setOutstanding] = useState({ totalRupees: '0.00', count: 0 });

  const socket = useSocket();

  const fetchDashboardData = async () => {
    try {
      const [attRes, classRes, duesRes] = await Promise.all([
        attendanceApi.getReport().catch(() => null),
        timetableApi.getNextClass().catch(() => null),
        paymentsApi.getOutstanding().catch(() => null),
      ]);
      setAttendance(attRes);
      setNextClass(classRes);
      if (duesRes) setOutstanding(duesRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('attendance_updated', () => {
        fetchDashboardData();
      });
      return () => socket.off('attendance_updated');
    }
  }, [socket]);

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f9fb' }}>
        {/* Top App Bar fixed at top */}
        <View style={{ paddingTop: 50, paddingBottom: 16, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#eceef0' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, overflow: 'hidden', backgroundColor: '#e0e3e5' }}>
                    {/* Placeholder image, fallback to solid color if missing */}
                    <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQCoK3poJqBaoGVvLK9iwuZNCHS77kJ4flg-JrJaJ7YfrmlxU_TvVqCdP40wQ3Jlj8L7IAqhW0AKwVEtWTSQa3P49i6QyLt1-f__ImIm_t5-MDPZG2yqLbTbcPCVbpb6ka8hz06VXqlSfslTyiE9ENRt4oKOvpDBhBnA3dkNK84P8LgUw-IlW4CO3AQ61_g9ZYorFt4hE5kuFE3ZFbU7KiDAm4gX243hNHqCdX2oQ3DEoAZBbxqAF8pzqDeHCWEzaNvhGYfkX7SA' }} style={{ width: '100%', height: '100%' }} />
                </View>
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#091426', letterSpacing: -0.5, fontFamily: 'Plus Jakarta Sans' }}>Scholar Flow</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={{ position: 'relative' }}>
                    <Ionicons name="notifications-outline" size={24} color="#091426" />
                    {unreadCount > 0 && (
                        <View style={{ position: 'absolute', top: -5, right: -5, backgroundColor: '#ba1a1a', width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{unreadCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
                <TouchableOpacity onPress={logout}>
                    <Ionicons name="log-out-outline" size={24} color="#091426" />
                </TouchableOpacity>
            </View>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
            {/* Welcome Header */}
            <View style={{ marginBottom: 30 }}>
                <Text style={{ color: '#6b38d4', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Welcome Back, {user?.name?.split(' ')[0] || 'Student'}</Text>
                <Text style={{ fontSize: 42, fontWeight: '900', color: '#091426', lineHeight: 46, letterSpacing: -1 }}>The Campus is <Text style={{ color: '#6b38d4' }}>Buzzing</Text></Text>
            </View>

            {/* Bento Grid */}
            <View style={{ flexDirection: 'column', gap: 16 }}>
                
                {/* Next Class Hero Card */}
                {nextClass ? (
                    <TouchableOpacity onPress={() => navigation.navigate('Timetable')} activeOpacity={0.9} style={{ backgroundColor: '#091426', borderRadius: 24, padding: 24, overflow: 'hidden', minHeight: 220, justifyContent: 'space-between' }}>
                        <View style={{ zIndex: 10 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginBottom: 16 }}>
                                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80', marginRight: 8 }} />
                                <Text style={{ color: 'white', fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 }}>Next Up • {nextClass.startTime}</Text>
                            </View>
                            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 8, lineHeight: 30 }}>{nextClass.subject?.name}</Text>
                            <Text style={{ color: '#bcc7de', fontSize: 14 }}>{nextClass.room?.name || 'TBA'}</Text>
                        </View>
                        <View style={{ zIndex: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24 }}>
                            <View style={{ backgroundColor: '#6b38d4', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999, flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ color: 'white', fontWeight: 'bold', marginRight: 8 }}>Check-in</Text>
                                <Ionicons name="log-in-outline" size={16} color="white" />
                            </View>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <View style={{ backgroundColor: '#091426', borderRadius: 24, padding: 24, minHeight: 180, justifyContent: 'center' }}>
                         <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>No Upcoming Classes</Text>
                         <Text style={{ color: '#bcc7de', fontSize: 14 }}>You have free time right now!</Text>
                    </View>
                )}

                {/* Academic Progress & Attendance */}
                <View style={{ flexDirection: 'row', gap: 16 }}>
                    {/* Progress */}
                    <View style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: 24, padding: 20, shadowColor: '#091426', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 24, elevation: 2 }}>
                        <Text style={{ color: '#091426', fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>Attendance</Text>
                        <Text style={{ color: '#45474c', fontSize: 12, marginBottom: 16 }}>Overall Status</Text>
                        {loading ? <ActivityIndicator color="#6b38d4" /> : (
                            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 10 }}>
                                <Text style={{ fontSize: 36, fontWeight: '800', color: '#091426' }}>{attendance?.overallPercent ?? 0}%</Text>
                            </View>
                        )}
                        <View style={{ flexDirection: 'row', gap: 4, marginTop: 8 }}>
                            <View style={{ flex: 1, height: 4, backgroundColor: '#6b38d4', borderRadius: 2 }} />
                            <View style={{ flex: 1, height: 4, backgroundColor: '#6b38d4', borderRadius: 2 }} />
                            <View style={{ flex: 1, height: 4, backgroundColor: '#f2f4f6', borderRadius: 2 }} />
                        </View>
                    </View>

                    {/* Due Alerts */}
                    <TouchableOpacity onPress={() => navigation.navigate('MyDues')} style={{ flex: 1, backgroundColor: outstanding.count > 0 ? '#ffdad6' : '#eceef0', borderRadius: 24, padding: 20, justifyContent: 'space-between' }}>
                        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: outstanding.count > 0 ? '#ba1a1a' : '#091426', alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name="wallet-outline" size={24} color="white" />
                        </View>
                        <View style={{ marginTop: 24 }}>
                            <Text style={{ color: outstanding.count > 0 ? '#93000a' : '#6b38d4', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{outstanding.count > 0 ? 'Action Required' : 'All Clear'}</Text>
                            <Text style={{ color: outstanding.count > 0 ? '#ba1a1a' : '#091426', fontWeight: 'bold', fontSize: 18 }}>{outstanding.count > 0 ? `₹${outstanding.totalRupees}` : 'No Dues'}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Club Alert (Hover equivalent) */}
                <TouchableOpacity onPress={() => navigation.navigate('GlobalEventCalendar')} activeOpacity={0.8} style={{ backgroundColor: '#e6e8ea', borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: '#091426', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: {height: 4} }}>
                        <Ionicons name="calendar" size={32} color="#ffffff" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: '#6b38d4', fontWeight: 'bold', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Global Events</Text>
                        <Text style={{ color: '#091426', fontWeight: 'bold', fontSize: 18, lineHeight: 22 }}>Check Campus Pulse</Text>
                        <Text style={{ color: '#45474c', fontSize: 12, marginTop: 4 }}>See what's happening today</Text>
                    </View>
                </TouchableOpacity>

            </View>

            {/* Quick Actions Horizontal Scroller */}
            <View style={{ marginTop: 32 }}>
                <Text style={{ color: '#091426', fontWeight: 'bold', fontSize: 18, marginBottom: 16, paddingHorizontal: 4 }}>Quick Actions</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10, gap: 12 }}>
                    
                    <TouchableOpacity onPress={() => navigation.navigate('Chatbot')} style={{ backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e0e3e5', padding: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 12, minWidth: 160 }}>
                        <Ionicons name="chatbubbles" size={24} color="#6b38d4" />
                        <View>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#091426' }}>Ask Aether</Text>
                            <Text style={{ fontSize: 10, color: '#45474c' }}>AI Copilot</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Attendance')} style={{ backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e0e3e5', padding: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 12, minWidth: 160 }}>
                        <Ionicons name="scan" size={24} color="#6b38d4" />
                        <View>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#091426' }}>Mark Presence</Text>
                            <Text style={{ fontSize: 10, color: '#45474c' }}>Class Check-in</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('VacantRooms')} style={{ backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e0e3e5', padding: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 12, minWidth: 160 }}>
                        <Ionicons name="search" size={24} color="#6b38d4" />
                        <View>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#091426' }}>Find Room</Text>
                            <Text style={{ fontSize: 10, color: '#45474c' }}>Vacant classes</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('LeaveApplication')} style={{ backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e0e3e5', padding: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 12, minWidth: 160 }}>
                        <Ionicons name="calendar-outline" size={24} color="#6b38d4" />
                        <View>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#091426' }}>Apply Leave</Text>
                            <Text style={{ fontSize: 10, color: '#45474c' }}>Absence request</Text>
                        </View>
                    </TouchableOpacity>

                </ScrollView>
            </View>
        </ScrollView>
    </View>
  );
}
