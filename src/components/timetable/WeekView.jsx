import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function WeekView({ timetable }) {
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return DAYS.includes(today) ? today : 'Monday';
  });

  if (!timetable || !timetable.slots) {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <Ionicons name="calendar-outline" size={48} color="#334155" />
        <Text className="text-muted mt-4 text-center">No timetable available for this semester.</Text>
      </View>
    );
  }

  const daySlots = timetable.slots.filter(s => s.day === selectedDay).sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <View className="flex-1">
      {/* Day Selector */}
      <View className="h-14">
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

      {/* Slots List */}
      <ScrollView className="flex-1 px-4 pt-4">
        {daySlots.length === 0 ? (
          <View className="items-center py-10">
            <Text className="text-muted">No classes scheduled for {selectedDay}.</Text>
          </View>
        ) : (
          daySlots.map((slot, i) => (
            <View key={i} className="flex-row mb-4">
              <View className="w-20 items-end pr-4">
                <Text className="text-white font-bold">{slot.startTime}</Text>
                <Text className="text-muted text-xs">{slot.endTime}</Text>
              </View>
              <View className="flex-1 bg-card rounded-2xl border border-border p-4 relative overflow-hidden">
                <View className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                <Text className="text-white text-lg font-bold mb-1">{slot.subjectId?.name || 'Unknown Subject'}</Text>
                <Text className="text-muted text-sm mb-3">Prof. {slot.facultyId?.name}</Text>
                
                <View className="flex-row items-center">
                  <Ionicons name="location" size={14} color="#94a3b8" />
                  <Text className="text-muted text-xs ml-1">{slot.roomId?.name || 'TBA'} • Floor {slot.roomId?.floor || '0'}</Text>
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
