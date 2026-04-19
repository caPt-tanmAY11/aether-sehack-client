import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { timetableApi } from '../../api/timetable.api';
import { useTheme } from '../../hooks/ThemeContext';
import AppHeader from '../../components/AppHeader';

export default function VacantRoomsScreen() {
  const { theme: T } = useTheme();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchVacantRooms(); }, []);

  const fetchVacantRooms = async () => {
    try {
      setLoading(true);
      const data = await timetableApi.getVacantRooms();
      setRooms(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="Find a Room" showBack />

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={T.accent} size="large" />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

          {/* Info banner */}
          <View style={[s.infoBanner, { backgroundColor: `${T.accent}14`, borderColor: `${T.accent}40` }]}>
            <Ionicons name="time-outline" size={20} color={T.accent} />
            <Text style={{ color: T.text, flex: 1, marginLeft: 10, fontSize: 13, fontWeight: '600' }}>
              Showing rooms currently empty based on today's timetable.
            </Text>
          </View>

          {rooms.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Ionicons name="sad-outline" size={56} color={T.muted} />
              <Text style={{ color: T.text, fontWeight: '900', fontSize: 20, marginTop: 16 }}>No Vacant Rooms</Text>
              <Text style={{ color: T.muted, textAlign: 'center', marginTop: 8 }}>
                All classrooms are currently occupied.
              </Text>
            </View>
          ) : (
            <View style={s.grid}>
              {rooms.map((room) => (
                <View
                  key={room._id}
                  style={[s.roomCard, { backgroundColor: T.card, borderColor: T.border }]}
                >
                  <View style={[s.roomIcon, { backgroundColor: `${T.success}20` }]}>
                    <Ionicons name="enter-outline" size={26} color={T.success} />
                  </View>
                  <Text style={[s.roomName, { color: T.text }]}>{room.name}</Text>
                  <Text style={[s.roomSub, { color: T.muted }]}>
                    {room.building}{room.floor ? ` · Flr ${room.floor}` : ''}
                  </Text>
                  {room.capacity && (
                    <Text style={[s.roomCap, { color: T.muted }]}>Cap: {room.capacity}</Text>
                  )}
                  <View style={[s.freePill, { backgroundColor: `${T.success}18`, borderColor: `${T.success}50` }]}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: T.success, marginRight: 5 }} />
                    <Text style={{ color: T.success, fontSize: 10, fontWeight: '900', letterSpacing: 0.5 }}>FREE NOW</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  infoBanner: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, borderWidth: 1,
    padding: 14, marginBottom: 20,
  },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
  },
  roomCard: {
    width: '47%', borderRadius: 20, borderWidth: 1,
    padding: 16, alignItems: 'center',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06,
    shadowRadius: 12, elevation: 3,
  },
  roomIcon: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  roomName: { fontSize: 18, fontWeight: '900', marginBottom: 4 },
  roomSub:  { fontSize: 12, fontWeight: '600', textAlign: 'center', marginBottom: 4 },
  roomCap:  { fontSize: 11, marginBottom: 8 },
  freePill: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 999, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 4, marginTop: 4,
  },
});
