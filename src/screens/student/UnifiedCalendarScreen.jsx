import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, ScrollView, TouchableOpacity } from 'react-native';
import { timetableApi } from '../../api/timetable.api';
import { eventsApi } from '../../api/events.api';
import { Ionicons } from '@expo/vector-icons';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function UnifiedCalendarScreen() {
  const [timetable, setTimetable] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return DAYS.includes(today) ? today : 'Monday';
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ttData, evData] = await Promise.all([
        timetableApi.getMyTimetable().catch(() => null),
        eventsApi.getApprovedEvents().catch(() => [])
      ]);
      setTimetable(ttData);
      setEvents(evData || []);
    } catch (err) {
      setError('Failed to load unified calendar');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-surface justify-center items-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  // Process and merge timetable slots and events for the selected day
  const mergedSlots = [];

  if (timetable && timetable.slots) {
    const ttSlots = timetable.slots.filter(s => s.day === selectedDay).map(s => ({
      type: 'class',
      title: s.subjectId?.name || 'Class',
      subtitle: `Prof. ${s.facultyId?.name}`,
      location: s.roomId?.name || 'TBA',
      startTime: s.startTime,
      endTime: s.endTime,
      color: 'bg-primary',
      borderColor: 'border-primary'
    }));
    mergedSlots.push(...ttSlots);
  }

  events.forEach(e => {
    const dateObj = new Date(e.startTime);
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    if (dayOfWeek === selectedDay) {
      // format HH:MM
      const st = dateObj.getHours().toString().padStart(2, '0') + ':' + dateObj.getMinutes().toString().padStart(2, '0');
      const etObj = new Date(e.endTime);
      const et = etObj.getHours().toString().padStart(2, '0') + ':' + etObj.getMinutes().toString().padStart(2, '0');
      
      mergedSlots.push({
        type: 'event',
        title: e.title,
        subtitle: 'Special Event',
        location: e.venue,
        startTime: st,
        endTime: et,
        color: 'bg-secondary',
        borderColor: 'border-secondary'
      });
    }
  });

  // Sort chronologically
  mergedSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <View className="flex-1 bg-surface pt-4">
      {error && (
        <View className="mx-4 mb-4 bg-error/20 p-3 rounded-lg border border-error/50">
          <Text className="text-error text-center">{error}</Text>
        </View>
      )}

      {/* Header */}
      <View className="px-4 mb-4">
        <Text className="text-white text-2xl font-bold">Unified Calendar</Text>
        <Text className="text-muted">Academic schedule + Operational events</Text>
      </View>

      {/* Day Selector */}
      <View className="h-14 mb-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-2" contentContainerStyle={{ gap: 8 }}>
          {DAYS.map(day => {
            const isActive = day === selectedDay;
            return (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-full border ${isActive ? 'bg-primary border-primary' : 'bg-card border-border'}`}
              >
                <Text className={`${isActive ? 'text-white' : 'text-muted'} font-bold`}>{day.substring(0, 3)}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Timeline */}
      <ScrollView className="flex-1 px-4 pt-4">
        {mergedSlots.length === 0 ? (
          <View className="items-center py-10">
            <Ionicons name="calendar-clear-outline" size={48} color="#334155" />
            <Text className="text-muted mt-4">No events or classes for {selectedDay}.</Text>
          </View>
        ) : (
          mergedSlots.map((slot, i) => (
            <View key={i} className="flex-row mb-4">
              <View className="w-20 items-end pr-4">
                <Text className="text-white font-bold">{slot.startTime}</Text>
                <Text className="text-muted text-xs">{slot.endTime}</Text>
              </View>
              <View className={`flex-1 bg-card rounded-2xl border border-border p-4 relative overflow-hidden`}>
                <View className={`absolute left-0 top-0 bottom-0 w-1 ${slot.color}`} />
                
                <View className="flex-row justify-between items-start mb-1">
                  <Text className="text-white text-lg font-bold flex-1 mr-2" numberOfLines={2}>{slot.title}</Text>
                  {slot.type === 'event' && (
                    <View className="bg-secondary/20 px-2 py-1 rounded-md border border-secondary/50">
                      <Text className="text-secondary text-[10px] font-bold uppercase">EVENT</Text>
                    </View>
                  )}
                </View>
                
                <Text className="text-muted text-sm mb-3">{slot.subtitle}</Text>
                
                <View className="flex-row items-center">
                  <Ionicons name="location" size={14} color="#94a3b8" />
                  <Text className="text-muted text-xs ml-1">{slot.location}</Text>
                </View>
              </View>
            </View>
          ))
        )}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
