import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../api/client';
import { useNavigation } from '@react-navigation/native';
import CalendarView from '../../components/CalendarView';
import { handleViewPdf } from '../../utils/pdf';

export default function GlobalEventCalendarScreen() {
  const navigation = useNavigation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Start view at today
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  });

  const fetchEvents = async () => {
    try {
      const res = await apiClient.get('/events');
      setEvents(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const viewPdf = async (eventId) => {
    try {
      await handleViewPdf(`/events/${eventId}/pdf`, `Event_Request_${eventId}`);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-surface justify-center items-center">
        <ActivityIndicator color="#6366f1" size="large" />
      </View>
    );
  }

  // Filter events strictly for the selected Date
  const filteredEvents = events.filter(e => {
    if (!e.startTime) return false;
    const eDate = new Date(e.startTime);
    const localIso = new Date(eDate.getTime() - (eDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    return localIso === selectedDate;
  });

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="px-4 pt-12 pb-4 bg-card border-b border-border flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">College Events</Text>
      </View>

      <ScrollView 
        className="flex-1 px-4 pt-6"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
      >
        <View className="mb-6">
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

        <Text className="text-white text-lg font-bold mb-4">Events on {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        
        {filteredEvents.length === 0 ? (
          <View className="items-center py-10 bg-card border border-border rounded-2xl">
            <Ionicons name="calendar-clear-outline" size={48} color="#64748b" />
            <Text className="text-muted mt-4 text-center px-4">No events scheduled for this date.</Text>
          </View>
        ) : (
          filteredEvents.map(event => {
            const isPending = event.currentStage !== 'approved';
            const startTime = new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const endTime = new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <View 
                key={event._id} 
                className={`p-4 rounded-2xl border mb-3 flex-row items-center ${isPending ? 'bg-surface border-border opacity-70' : 'bg-card border-primary/50'}`}
              >
                <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${isPending ? 'bg-surface border border-border' : 'bg-primary/20'}`}>
                  <Ionicons name={isPending ? 'time-outline' : 'calendar'} size={24} color={isPending ? '#64748b' : '#818cf8'} />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-base font-bold">{event.title}</Text>
                  <Text className="text-muted text-xs mt-0.5">{startTime} - {endTime} • {event.venue}</Text>
                  <Text className="text-indigo-300 text-xs mt-0.5 font-bold">{event.templateType ? event.templateType.toUpperCase() : 'PLAIN'} TEMPLATE</Text>
                  {isPending && <Text className="text-warning text-xs font-bold mt-1">Pending Approval ({event.currentStage})</Text>}
                </View>
                <TouchableOpacity onPress={() => viewPdf(event._id)} className="p-2 bg-surface rounded-full border border-border ml-2">
                  <Ionicons name="document-text-outline" size={20} color="#818cf8" />
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
