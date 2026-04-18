import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth.store';
import { apiClient } from '../../api/client';
import { useNavigation } from '@react-navigation/native';
import CalendarView from '../../components/CalendarView';

export default function CommitteeDashboardScreen() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const navigation = useNavigation();

  const [club, setClub] = useState(null);
  const [requests, setRequests] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);

  // For the specific calendar
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  });

  const fetchData = async () => {
    try {
      // 1. Fetch club info
      const listRes = await apiClient.get(`/clubs?category=`);
      const allClubs = listRes.data.data;
      const myClub = allClubs.find(c => c.name.toLowerCase() === user.name.toLowerCase());
      
      if (myClub) {
        const detailRes = await apiClient.get(`/clubs/${myClub._id}`);
        setClub(detailRes.data.data);
      }

      // 2. Fetch pending requests
      const reqRes = await apiClient.get('/clubs/pending-requests');
      if (reqRes.data.data.length > 0) {
        setRequests(reqRes.data.data[0].requests);
      } else {
        setRequests([]);
      }

      // 3. Fetch events
      const evRes = await apiClient.get('/events/me');
      setEvents(evRes.data.data || []);
      
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load committee data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleReviewRequest = async (requestId, decision) => {
    if (!club) return;
    try {
      await apiClient.patch(`/clubs/${club._id}/join-requests/${requestId}/review`, { decision });
      Alert.alert('Success', `Request ${decision}`);
      fetchData();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to review request');
    }
  };

  if (loading) {
    return <View className="flex-1 bg-surface justify-center items-center"><ActivityIndicator color="#6366f1" size="large" /></View>;
  }

  const filteredEvents = events.filter(e => {
    if (!e.startTime) return false;
    const eDate = new Date(e.startTime);
    const localIso = new Date(eDate.getTime() - (eDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    return localIso === selectedDate;
  });

  return (
    <ScrollView 
      className="flex-1 bg-surface px-4 py-6"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-8 pt-8">
        <View>
          <Text className="text-muted text-sm uppercase tracking-wider font-bold">Committee Portal</Text>
          <Text className="text-white text-2xl font-bold">{user?.name}</Text>
        </View>
        <View className="flex-row">
          <TouchableOpacity onPress={() => navigation.navigate('GlobalEventCalendar')} className="p-2 bg-card rounded-full border border-border mr-2">
            <Ionicons name="calendar-outline" size={24} color="#f1f5f9" />
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} className="p-2 bg-card rounded-full border border-border">
            <Ionicons name="log-out-outline" size={24} color="#f1f5f9" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Overview Cards */}
      <View className="flex-row justify-between mb-6">
        <TouchableOpacity 
          onPress={() => setShowMembersModal(true)} 
          className="bg-card flex-1 mr-2 p-4 rounded-2xl border border-border"
        >
          <Ionicons name="people" size={28} color="#6366f1" className="mb-2" />
          <Text className="text-white text-2xl font-bold mb-1">{club?.members?.length || 0}</Text>
          <Text className="text-muted text-sm">Active Members</Text>
        </TouchableOpacity>
        <View className="bg-card flex-1 ml-2 p-4 rounded-2xl border border-border">
          <Ionicons name="mail-unread" size={28} color="#f59e0b" className="mb-2" />
          <Text className="text-white text-2xl font-bold mb-1">{requests.length}</Text>
          <Text className="text-muted text-sm">Join Requests</Text>
        </View>
      </View>

      {/* Event Submission Shortcut */}
      <TouchableOpacity 
        onPress={() => navigation.navigate('EventSubmission')}
        className="w-full bg-primary/20 p-4 rounded-2xl border border-primary mb-8 flex-row items-center justify-between"
      >
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-primary items-center justify-center mr-3">
            <Ionicons name="add" size={24} color="white" />
          </View>
          <View>
            <Text className="text-white text-lg font-bold">Host an Event</Text>
            <Text className="text-indigo-200 text-sm mt-0.5">Submit an event request</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#818cf8" />
      </TouchableOpacity>

      {/* Join Requests */}
      <Text className="text-white text-lg font-bold mb-4">Pending Requests</Text>
      {requests.length === 0 ? (
        <Text className="text-muted mb-6">No pending join requests.</Text>
      ) : (
        requests.map((req, i) => (
          <View key={i} className="bg-card p-4 rounded-2xl border border-border mb-3">
            <View className="flex-row justify-between items-start mb-2">
              <View>
                <Text className="text-white font-bold">{req.userId?.name}</Text>
                <Text className="text-muted text-xs">{req.userId?.email} • Div {req.userId?.division}</Text>
              </View>
              <View className="bg-warning/20 px-2 py-1 rounded border border-warning/50">
                <Text className="text-warning text-xs font-bold uppercase">Pending</Text>
              </View>
            </View>
            {req.message ? (
              <Text className="text-slate-300 text-sm italic mb-3">"{req.message}"</Text>
            ) : null}
            <View className="flex-row gap-2 mt-2">
              <TouchableOpacity onPress={() => handleReviewRequest(req._id, 'approved')} className="flex-1 bg-success/20 py-2 rounded-xl border border-success/50 items-center">
                <Text className="text-success font-bold text-sm">Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleReviewRequest(req._id, 'waitlisted')} className="flex-1 bg-warning/20 py-2 rounded-xl border border-warning/50 items-center">
                <Text className="text-warning font-bold text-sm">Waitlist</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleReviewRequest(req._id, 'rejected')} className="flex-1 bg-error/20 py-2 rounded-xl border border-error/50 items-center">
                <Text className="text-error font-bold text-sm">Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {/* Committee Calendar */}
      <Text className="text-white text-lg font-bold mb-4 mt-6">My Events Calendar</Text>
      <View className="mb-4">
        <CalendarView 
          value={selectedDate} 
          onChange={setSelectedDate} 
          markedDates={events.map(e => {
            if(!e.startTime) return '';
            const eDate = new Date(e.startTime);
            return new Date(eDate.getTime() - (eDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
          }).filter(Boolean)} 
        />
      </View>

      {filteredEvents.length === 0 ? (
        <View className="items-center py-8 bg-card border border-border rounded-2xl mb-8">
          <Ionicons name="calendar-clear-outline" size={40} color="#64748b" />
          <Text className="text-muted mt-2">No events scheduled on this date.</Text>
        </View>
      ) : (
        <View className="mb-8">
          {filteredEvents.map(event => {
            const isPending = event.currentStage !== 'approved';
            return (
              <View key={event._id} className={`p-4 rounded-2xl border mb-3 flex-row items-center ${isPending ? 'bg-surface border-border opacity-70' : 'bg-card border-primary/50'}`}>
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${isPending ? 'bg-surface border border-border' : 'bg-primary/20'}`}>
                  <Ionicons name={isPending ? 'time-outline' : 'calendar'} size={20} color={isPending ? '#64748b' : '#818cf8'} />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold">{event.title}</Text>
                  <Text className="text-muted text-xs mt-0.5">
                    {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  {isPending && <Text className="text-warning text-xs font-bold mt-1">Pending ({event.currentStage})</Text>}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Members Modal */}
      <Modal visible={showMembersModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/70">
          <View className="bg-surface w-full rounded-t-3xl border-t border-border p-6 h-3/4">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-xl font-bold">Committee Members</Text>
              <TouchableOpacity onPress={() => setShowMembersModal(false)} className="p-2 bg-card rounded-full border border-border">
                <Ionicons name="close" size={20} color="#f1f5f9" />
              </TouchableOpacity>
            </View>
            <ScrollView className="flex-1">
              {!club?.members || club.members.length === 0 ? (
                <Text className="text-muted text-center mt-10">No active members.</Text>
              ) : (
                club.members.map((member, i) => (
                  <View key={i} className="flex-row items-center bg-card p-4 rounded-xl border border-border mb-3">
                    <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center mr-4">
                      <Ionicons name="person" size={20} color="#818cf8" />
                    </View>
                    <View>
                      <Text className="text-white font-bold text-base">{member.userId?.name || 'Unknown User'}</Text>
                      <Text className="text-primary text-xs uppercase font-bold mt-1">{member.role.replace('_', ' ')}</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
