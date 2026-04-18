import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CalendarPicker({ label, value, onChange }) {
  const [show, setShow] = useState(false);
  const today = new Date();

  const formatDisplay = (dateStr) => {
    if (!dateStr) return 'Select date';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Build current month grid
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
    // Adjust to local ISO string (prevent UTC offset issues)
    const localIso = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    onChange(localIso);
    setShow(false);
  };

  return (
    <>
      {label && <Text className="text-muted text-sm font-bold mb-2">{label}</Text>}
      <TouchableOpacity
        onPress={() => setShow(true)}
        className="bg-surface border border-border rounded-xl px-4 py-3 mb-4 flex-row items-center justify-between"
      >
        <Text className={value ? 'text-white' : 'text-muted'}>{formatDisplay(value)}</Text>
        <Ionicons name="calendar-outline" size={18} color="#64748b" />
      </TouchableOpacity>

      <Modal visible={show} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/70 px-6">
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
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={() => setShow(false)}
              className="mt-4 bg-surface border border-border py-3 rounded-xl items-center"
            >
              <Text className="text-muted font-bold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
