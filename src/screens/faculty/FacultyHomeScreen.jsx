import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function FacultyHomeScreen() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const navigation = useNavigation();

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
                <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
                    <Ionicons name="notifications-outline" size={24} color="#091426" />
                </TouchableOpacity>
                <TouchableOpacity onPress={logout}>
                    <Ionicons name="log-out-outline" size={24} color="#091426" />
                </TouchableOpacity>
            </View>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
            {/* Welcome Header */}
            <View style={{ marginBottom: 30 }}>
                <Text style={{ color: '#6b38d4', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Welcome Back</Text>
                <Text style={{ fontSize: 42, fontWeight: '900', color: '#091426', lineHeight: 46, letterSpacing: -1 }}>Good Morning, {user?.name?.split(' ')[0] || 'Professor'}</Text>
                <Text style={{ color: '#45474c', marginTop: 8 }}>Your morning intelligence report is ready.</Text>
            </View>

            {/* Bento Grid */}
            <View style={{ flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                <View style={{ backgroundColor: '#ffffff', borderRadius: 24, padding: 24, overflow: 'hidden', shadowColor: '#091426', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 24, elevation: 2 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                        <View>
                            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#091426' }}>Class Intelligence</Text>
                            <Text style={{ fontSize: 14, color: '#45474c', marginTop: 4 }}>Average Attendance Trends</Text>
                        </View>
                        <View style={{ backgroundColor: '#e9ddff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 }}>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#23005c' }}>+4.2% vs last term</Text>
                        </View>
                    </View>
                    {/* Mock Graph */}
                    <View style={{ height: 120, flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
                        <View style={{ flex: 1, height: '40%', backgroundColor: '#e0e3e5', borderTopLeftRadius: 8, borderTopRightRadius: 8 }} />
                        <View style={{ flex: 1, height: '65%', backgroundColor: '#e0e3e5', borderTopLeftRadius: 8, borderTopRightRadius: 8 }} />
                        <View style={{ flex: 1, height: '55%', backgroundColor: '#e0e3e5', borderTopLeftRadius: 8, borderTopRightRadius: 8 }} />
                        <View style={{ flex: 1, height: '85%', backgroundColor: '#6b38d4', borderTopLeftRadius: 8, borderTopRightRadius: 8 }} />
                        <View style={{ flex: 1, height: '45%', backgroundColor: '#e0e3e5', borderTopLeftRadius: 8, borderTopRightRadius: 8 }} />
                    </View>
                </View>

                {/* Today Schedule Bento */}
                <View style={{ backgroundColor: '#091426', borderRadius: 24, padding: 24 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#ffffff' }}>Today's Schedule</Text>
                        <Ionicons name="calendar" size={24} color="#ffffff" />
                    </View>
                    <View style={{ gap: 16 }}>
                        <View style={{ borderLeftWidth: 2, borderLeftColor: '#6b38d4', paddingLeft: 16, paddingBottom: 4 }}>
                            <Text style={{ fontSize: 10, fontWeight: '600', color: '#bcc7de', textTransform: 'uppercase', letterSpacing: 1 }}>09:00 AM</Text>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginTop: 4 }}>Check full timetable</Text>
                            <Text style={{ fontSize: 14, color: '#bcc7de', marginTop: 2 }}>Navigate to Timetable view.</Text>
                        </View>
                    </View>
                </View>

                {/* Coordination Hub card */}
                <TouchableOpacity onPress={() => navigation.navigate('FacultyCoordination')} style={{ backgroundColor: '#e6e8ea', borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                        <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#091426', alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name="chatbubbles" size={24} color="#ffffff" />
                        </View>
                        <View>
                            <Text style={{ color: '#091426', fontWeight: 'bold', fontSize: 18 }}>Coordination Hub</Text>
                            <Text style={{ color: '#45474c', fontSize: 12, marginTop: 2 }}>Real-time faculty discussions</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#45474c" />
                </TouchableOpacity>

            </View>

            {/* Quick Actions ScrollView */}
            <Text style={{ color: '#091426', fontWeight: 'bold', fontSize: 18, marginBottom: 16, paddingHorizontal: 4 }}>Manage Portal</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16, paddingBottom: 16 }}>
                {['council', 'hod', 'dean'].includes(user?.role) && (
                <TouchableOpacity onPress={() => navigation.navigate('EventApprovals')} style={{ width: '48%', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#f59e0b', padding: 16, borderRadius: 20, alignItems: 'center' }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(245, 158, 11, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                        <Ionicons name="checkmark-done-circle" size={24} color="#f59e0b" />
                    </View>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#f59e0b', textAlign: 'center' }}>Event Approvals</Text>
                </TouchableOpacity>
                )}
                
                {[
                  { route: 'TimetableUpload', icon: 'calendar', color: '#22c55e', text: 'Upload Timetable' },
                  { route: 'SyllabusUpdate', icon: 'document-text', color: '#f59e0b', text: 'Update Syllabus' },
                  { route: 'AttendanceOverride', icon: 'shield-checkmark', color: '#6b38d4', text: 'Override Attendance' },
                  { route: 'AttendanceViewer', icon: 'eye', color: '#818cf8', text: 'View Attendance' },
                  { route: 'Batches', icon: 'people', color: '#22c55e', text: 'My Batches' },
                  { route: 'StudentLeaves', icon: 'calendar-outline', color: '#f59e0b', text: 'Student Leaves' },
                  { route: 'Advising', icon: 'mail-unread-outline', color: '#6b38d4', text: 'Advising Requests' },
                  { route: 'TimetableStatus', icon: 'hourglass-outline', color: '#f59e0b', text: 'Timetable Status' },
                  { route: 'RaiseDue', icon: 'cash-outline', color: '#ef4444', text: 'Issue Fine/Bill' }
                ].map((item, i) => (
                    <TouchableOpacity key={i} onPress={() => navigation.navigate(item.route)} style={{ width: '48%', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e0e3e5', padding: 16, borderRadius: 20, alignItems: 'center' }}>
                        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `${item.color}15`, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                            <Ionicons name={item.icon} size={24} color={item.color} />
                        </View>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#091426', textAlign: 'center' }}>{item.text}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    </View>
  );
}
