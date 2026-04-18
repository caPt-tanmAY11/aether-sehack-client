import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { timetableApi } from '../../api/timetable.api';

export default function VacantRoomsScreen({ navigation }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVacantRooms();
  }, []);

  const fetchVacantRooms = async () => {
    try {
      setLoading(true);
      const data = await timetableApi.getVacantRooms();
      setRooms(data);
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
      {/* Header */}
      <View className="px-4 pt-12 pb-4 bg-card border-b border-border flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 bg-surface rounded-full">
          <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Vacant Classrooms</Text>
      </View>

      <ScrollView className="p-4 flex-1">
        <View className="flex-row items-center mb-6 bg-primary/10 p-4 rounded-xl border border-primary/30">
          <Ionicons name="time" size={24} color="#6366f1" className="mr-3" />
          <Text className="text-indigo-200 flex-1">Showing rooms that are currently empty based on today's timetable.</Text>
        </View>

        {rooms.length === 0 ? (
          <View className="items-center mt-10">
            <Ionicons name="sad-outline" size={48} color="#64748b" className="mb-4" />
            <Text className="text-muted text-lg font-bold">No Vacant Rooms</Text>
            <Text className="text-slate-400 mt-2 text-center">All classrooms are currently occupied.</Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {rooms.map((room) => (
              <View key={room._id} className="w-[48%] bg-card p-4 rounded-2xl border border-border mb-4 items-center">
                <View className="w-12 h-12 rounded-full bg-success/20 items-center justify-center mb-3">
                  <Ionicons name="enter-outline" size={24} color="#22c55e" />
                </View>
                <Text className="text-white text-lg font-bold mb-1">{room.name}</Text>
                <Text className="text-muted text-xs text-center">{room.building} - Flr {room.floor}</Text>
                {room.capacity && <Text className="text-slate-500 text-xs mt-1">Cap: {room.capacity}</Text>}
              </View>
            ))}
          </View>
        )}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
