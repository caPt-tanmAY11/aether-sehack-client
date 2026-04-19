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
      <View style={{ flex: 1, backgroundColor: '#f7f9fb', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#6b38d4" size="large" />
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
    <View style={{ flex: 1, backgroundColor: '#f7f9fb' }}>
      {/* Top Header */}
      <View style={{ paddingTop: 50, paddingBottom: 16, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 12, zIndex: 10, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#eceef0' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, backgroundColor: '#eceef0', borderRadius: 999 }}>
          <Ionicons name="arrow-back" size={24} color="#091426" />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: '800', color: '#091426', fontFamily: 'Plus Jakarta Sans' }}>Campus Events</Text>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 150 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6b38d4" />}
      >
        <View style={{ backgroundColor: '#ffffff', borderRadius: 24, padding: 16, shadowColor: '#091426', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 2, marginBottom: 24 }}>
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

        <Text style={{ color: '#091426', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Agenda for {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        
        {filteredEvents.length === 0 ? (
          <View style={{ backgroundColor: '#ffffff', borderRadius: 24, padding: 32, alignItems: 'center', shadowColor: '#091426', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 12, elevation: 1 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#eceef0', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Ionicons name="calendar-clear-outline" size={32} color="#8590a6" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#091426' }}>No Events Scheduled</Text>
            <Text style={{ color: '#45474c', marginTop: 4 }}>The campus is quiet today.</Text>
          </View>
        ) : (
          filteredEvents.map(event => {
            const isPending = event.currentStage !== 'approved';
            const startTime = new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const endTime = new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <View 
                key={event._id} 
                style={{
                  backgroundColor: isPending ? '#ffffff' : '#e9ddff',
                  borderRadius: 20,
                  padding: 16,
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  shadowColor: '#091426',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: isPending ? 0.02 : 0.08,
                  shadowRadius: 12,
                  elevation: 1,
                  opacity: isPending ? 0.8 : 1
                }}
              >
                <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: isPending ? '#eceef0' : '#ffffff', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                  <Ionicons name={isPending ? 'time-outline' : 'calendar'} size={24} color={isPending ? '#8590a6' : '#6b38d4'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#091426', fontSize: 16, fontWeight: 'bold', marginBottom: 2 }}>{event.title}</Text>
                  <Text style={{ color: '#45474c', fontSize: 12 }}>{startTime} - {endTime} • {event.venue}</Text>
                  <Text style={{ color: '#6b38d4', fontSize: 10, fontWeight: 'bold', marginTop: 4 }}>{event.templateType ? event.templateType.toUpperCase() : 'PLAIN'} TEMPLATE</Text>
                  {isPending && <Text style={{ color: '#eab308', fontSize: 10, fontWeight: 'bold', marginTop: 4, textTransform: 'uppercase' }}>Pending ({event.currentStage})</Text>}
                </View>
                <TouchableOpacity onPress={() => viewPdf(event._id)} style={{ padding: 12, backgroundColor: '#ffffff', borderRadius: 999, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}>
                  <Ionicons name="document-text-outline" size={20} color="#6b38d4" />
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
