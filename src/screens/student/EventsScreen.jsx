import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { eventsApi } from '../../api/events.api';
import { useAuthStore } from '../../store/auth.store';
import { useNavigation } from '@react-navigation/native';

export default function EventsScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const subRole = useAuthStore(state => state.subRole);
  const navigation = useNavigation();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.getApprovedEvents();
      setEvents(data);
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
      <ScrollView className="p-4">
        {events.length === 0 ? (
          <Text className="text-center text-gray-500 mt-10">
            No events available
          </Text>
        ) : (
          events.map((event, index) => (
            <View
              key={index}
              className="bg-white p-4 rounded-xl mb-4 shadow"
            >
              <Text className="text-lg font-bold text-gray-800">
                {event.title}
              </Text>
              <Text className="text-gray-600 mt-1">
                {event.description}
              </Text>
            </View>
          ))
        )}
        <View className="h-20" />
      </ScrollView>

      {subRole === 'committee_head' && (
        <TouchableOpacity
          className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg"
          onPress={() => navigation.navigate('CreateEvent')} // optional, safe
        >
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}