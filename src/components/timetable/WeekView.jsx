import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/ThemeContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function WeekView({ timetable }) {
  const { theme: T } = useTheme();
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return DAYS.includes(today) ? today : 'Monday';
  });

  if (!timetable || !timetable.slots) {
    return (
      <View style={[s.empty, { backgroundColor: T.bg }]}>
        <View style={[s.emptyIcon, { backgroundColor: T.accentSoft, borderColor: T.accent }]}>
          <Ionicons name="calendar-outline" size={32} color={T.accent} />
        </View>
        <Text style={[s.emptyTitle, { color: T.text }]}>No Timetable Yet</Text>
        <Text style={[s.emptyText, { color: T.muted }]}>No timetable available for this semester.</Text>
      </View>
    );
  }

  const daySlots = timetable.slots
    .filter(s => s.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <View style={[s.root, { backgroundColor: T.bg }]}>
      {/* Day Selector */}
      <View style={[s.dayBar, { backgroundColor: T.card, borderBottomColor: T.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.dayScroll}>
          {DAYS.map(day => {
            const isActive = day === selectedDay;
            return (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDay(day)}
                style={[
                  s.dayPill,
                  { backgroundColor: isActive ? T.accent : T.iconBg, borderColor: isActive ? T.accent : T.border },
                ]}
                activeOpacity={0.8}
              >
                <Text style={[s.dayPillText, { color: isActive ? '#ffffff' : T.muted }]}>
                  {day.substring(0, 3)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Slots */}
      <ScrollView style={s.list} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 160 }}>
        {daySlots.length === 0 ? (
          <View style={[s.noClass, { backgroundColor: T.card, borderColor: T.border }]}>
            <Ionicons name="cafe-outline" size={32} color={T.muted} />
            <Text style={[s.noClassText, { color: T.muted }]}>No classes on {selectedDay}</Text>
          </View>
        ) : (
          daySlots.map((slot, i) => (
            <View key={i} style={s.slotRow}>
              {/* Time column */}
              <View style={s.timeCol}>
                <Text style={[s.timeStart, { color: T.accent }]}>{slot.startTime}</Text>
                <View style={[s.timeLine, { backgroundColor: T.border }]} />
                <Text style={[s.timeEnd, { color: T.muted }]}>{slot.endTime}</Text>
              </View>

              {/* Slot card — neobrutalism */}
              <View style={[s.slotCard, { backgroundColor: T.card, borderColor: T.border }]}>
                <View style={[s.slotAccentBar, { backgroundColor: T.accent }]} />
                <View style={s.slotContent}>
                  <Text style={[s.slotSubject, { color: T.text }]} numberOfLines={2}>
                    {slot.subjectId?.name || 'Unknown Subject'}
                  </Text>
                  <Text style={[s.slotFaculty, { color: T.muted }]}>
                    Prof. {slot.facultyId?.name || 'TBA'}
                  </Text>
                  <View style={s.slotFooter}>
                    <View style={[s.slotRoomBadge, { backgroundColor: T.accentSoft, borderColor: T.accent }]}>
                      <Ionicons name="location-outline" size={11} color={T.accent} />
                      <Text style={[s.slotRoomText, { color: T.accent }]}>
                        {slot.roomId?.name || 'TBA'} · F{slot.roomId?.floor ?? 0}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },

  dayBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
  },
  dayScroll: { paddingHorizontal: 16, gap: 8 },
  dayPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  dayPillText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.3 },

  list: { flex: 1 },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 20, fontWeight: '900', marginBottom: 8 },
  emptyText:  { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  noClass: {
    borderRadius: 20,
    borderWidth: 2,
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  noClassText: { fontSize: 15, fontWeight: '700' },

  slotRow: { flexDirection: 'row', marginBottom: 16, gap: 12 },

  timeCol: { width: 52, alignItems: 'center', paddingTop: 4 },
  timeStart: { fontSize: 12, fontWeight: '900', letterSpacing: -0.3 },
  timeLine: { width: 1, flex: 1, marginVertical: 4 },
  timeEnd: { fontSize: 10, fontWeight: '600' },

  slotCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 0,
    elevation: 3,
  },
  slotAccentBar: { width: 4 },
  slotContent: { flex: 1, padding: 14 },
  slotSubject: { fontSize: 16, fontWeight: '900', letterSpacing: -0.3, marginBottom: 4 },
  slotFaculty: { fontSize: 12, fontWeight: '600', marginBottom: 10 },
  slotFooter:  { flexDirection: 'row' },
  slotRoomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  slotRoomText: { fontSize: 11, fontWeight: '700' },
});
