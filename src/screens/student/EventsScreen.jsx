import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { eventsApi } from '../../api/events.api';
import { useAuthStore } from '../../store/auth.store';
import { useNavigation } from '@react-navigation/native';
export default function EventsScreen() {
  const [activeTab, setActiveTab] = useState('approved'); // 'approved' or 'mine'
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = useAuthStore(state => state.role);
  const subRole = useAuthStore(state => state.subRole);
  const navigation = useNavigation();
  const canRaiseEvent = role === 'student' || role === 'council';

  useEffect(() => {
    fetchEvents();
  }, [activeTab]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      if (activeTab === 'approved') {
        const data = await eventsApi.getApprovedEvents();
        setEvents(data);
      } else {
        const data = await eventsApi.getMyRequests();
        setMyEvents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-surface justify-center items-center">
        <ActivityIndicator color="#6366f1" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <View className="flex-row mx-4 mt-6 mb-4 bg-card rounded-xl p-1 border border-border">
        <TouchableOpacity 
          onPress={() => setActiveTab('approved')}
          className={`flex-1 py-2 items-center rounded-lg ${activeTab === 'approved' ? 'bg-primary' : 'bg-transparent'}`}
        >
          <Text className={activeTab === 'approved' ? 'text-white font-bold' : 'text-muted font-bold'}>Upcoming</Text>
        </TouchableOpacity>
        {canRaiseEvent && (
          <TouchableOpacity 
            onPress={() => setActiveTab('mine')}
            className={`flex-1 py-2 items-center rounded-lg ${activeTab === 'mine' ? 'bg-primary' : 'bg-transparent'}`}
          >
            <Text className={activeTab === 'mine' ? 'text-white font-bold' : 'text-muted font-bold'}>My Requests</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="p-4 pt-0">
        {activeTab === 'approved' ? (
          events.length === 0 ? (
            <Text className="text-center text-gray-500 mt-10">
              No upcoming events available
            </Text>
          ) : (
            events.map((event, index) => (
              <View
                key={index}
                className="bg-card p-4 rounded-xl mb-4 border border-border"
              >
                <Text className="text-lg font-bold text-white">
                  {event.title}
                </Text>
                <Text className="text-muted mt-1 mb-2">
                  {new Date(event.startTime).toLocaleString()} • {event.venue}
                </Text>
                <Text className="text-slate-300">
                  {event.description}
                </Text>
              </View>
            ))
          )
        ) : (
          myEvents.length === 0 ? (
            <Text className="text-center text-gray-500 mt-10">
              You haven't requested any events.
            </Text>
          ) : (
            myEvents.map((event, index) => (
              <View
                key={index}
                className="bg-card p-4 rounded-xl mb-4 border border-border"
              >
                <View className="flex-row justify-between mb-2">
                  <Text className="text-lg font-bold text-white flex-1 mr-2">
                    {event.title}
                  </Text>
                  <View className={`px-2 py-1 rounded-md border ${event.currentStage === 'approved' ? 'bg-success/20 border-success/50' : event.currentStage === 'rejected' ? 'bg-error/20 border-error/50' : 'bg-warning/20 border-warning/50'}`}>
                    <Text className={`${event.currentStage === 'approved' ? 'text-success' : event.currentStage === 'rejected' ? 'text-error' : 'text-warning'} text-xs font-bold capitalize`}>{event.currentStage}</Text>
                  </View>
                </View>
                <Text className="text-muted mb-2">
                  {new Date(event.startTime).toLocaleString()} • {event.venue}
                </Text>
                {event.documentUrl && (
                  <View className="bg-surface p-2 rounded-lg mt-2 flex-row items-center border border-border">
                    <Ionicons name="document-text" size={16} color="#64748b" className="mr-2" />
                    <Text className="text-slate-400 text-xs">Approval Doc Generated</Text>
                  </View>
                )}
              </View>
            ))
          )
        )}
        <View className="h-20" />
      </ScrollView>

      {canRaiseEvent && activeTab === 'approved' && (
        <TouchableOpacity
          className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg"
          onPress={() => navigation.navigate('EventSubmission')}

        >
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}