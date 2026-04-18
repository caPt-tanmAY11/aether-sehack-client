import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CalendarView({ value, onChange, markedDates = [] }) {
  const today = new Date();

  // markedDates is an array of ISO date strings (e.g., ['2026-10-15', '2026-10-18'])
  
  const [viewDate, setViewDate] = useState(
    value ? new Date(new Date(value).getFullYear(), new Date(value).getMonth(), 1) 
          : new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const selectDay = (day) => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const localIso = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    onChange(localIso);
  };

  return (
    <View className="bg-card w-full rounded-3xl p-5 border border-border">
      {/* Month navigation */}
      <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity onPress={prevMonth} className="p-2">
          <Ionicons name="chevron-back" size={20} color="#f1f5f9" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-base">{monthName}</Text>
        <TouchableOpacity onPress={nextMonth} className="p-2">
          <Ionicons name="chevron-forward" size={20} color="#f1f5f9" />
        </TouchableOpacity>
      </View>

      {/* Day headers */}
      <View className="flex-row mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <Text key={d} className="flex-1 text-center text-muted text-xs font-bold">{d}</Text>
        ))}
      </View>

      {/* Day grid */}
      <View className="flex-row flex-wrap">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <View key={`empty-${i}`} style={{ width: '14.28%' }} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const dateStr = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
          const isoStr = new Date(dateStr.getTime() - (dateStr.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
          
          const isSelected = value === isoStr;
          const isToday = today.getDate() === day && today.getMonth() === viewDate.getMonth() && today.getFullYear() === viewDate.getFullYear();
          const hasEvent = markedDates.includes(isoStr);

          return (
            <TouchableOpacity
              key={day}
              onPress={() => selectDay(day)}
              style={{ width: '14.28%' }}
              className={`aspect-square items-center justify-center rounded-full mb-1 ${isSelected ? 'bg-primary' : ''}`}
            >
              <Text className={`text-sm ${isSelected ? 'text-white font-bold' : isToday ? 'text-primary font-bold' : 'text-slate-300'}`}>
                {day}
              </Text>
              {hasEvent && (
                <View className={`w-1.5 h-1.5 rounded-full mt-0.5 absolute bottom-1 ${isSelected ? 'bg-white' : 'bg-warning'}`} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
