import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/ThemeContext';

export default function CalendarPicker({ label, value, onChange }) {
  const { theme: T } = useTheme();
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
    const localIso = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    onChange(localIso);
    setShow(false);
  };

  return (
    <>
      {label && <Text style={{ color: T.muted }} className="text-sm font-bold mb-2">{label}</Text>}
      <TouchableOpacity
        onPress={() => setShow(true)}
        style={{ backgroundColor: T.bg, borderColor: T.border, borderWidth: 1 }}
        className="rounded-xl px-4 py-3 mb-4 flex-row items-center justify-between"
      >
        <Text style={{ color: value ? T.text : T.muted }}>{formatDisplay(value)}</Text>
        <Ionicons name="calendar-outline" size={18} color={T.muted} />
      </TouchableOpacity>

      <Modal visible={show} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/70 px-6">
          <View style={{ backgroundColor: T.card, borderColor: T.border, borderWidth: 1 }} className="w-full rounded-3xl p-5">
            {/* Month navigation */}
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity onPress={prevMonth} className="p-2">
                <Ionicons name="chevron-back" size={20} color={T.text} />
              </TouchableOpacity>
              <Text style={{ color: T.text }} className="font-bold text-base">{monthName}</Text>
              <TouchableOpacity onPress={nextMonth} className="p-2">
                <Ionicons name="chevron-forward" size={20} color={T.text} />
              </TouchableOpacity>
            </View>

            {/* Day headers */}
            <View className="flex-row mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <Text key={d} style={{ color: T.muted }} className="flex-1 text-center text-xs font-bold">{d}</Text>
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
                    style={{
                      width: '14.28%',
                      backgroundColor: isSelected ? T.accent : 'transparent',
                    }}
                    className="aspect-square items-center justify-center rounded-full mb-1"
                  >
                    <Text style={{
                      color: isSelected ? '#ffffff' : isToday ? T.accent : T.text,
                      fontWeight: (isSelected || isToday) ? 'bold' : 'normal',
                      fontSize: 13,
                    }}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={() => setShow(false)}
              style={{ backgroundColor: T.bg, borderColor: T.border, borderWidth: 1 }}
              className="mt-4 py-3 rounded-xl items-center"
            >
              <Text style={{ color: T.muted }} className="font-bold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
