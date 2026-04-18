import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { eventsApi } from '../../api/events.api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function EventSubmissionScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('Auditorium');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [expectedAttendance, setExpectedAttendance] = useState('100');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await eventsApi.createEvent({
        title,
        description,
        venue,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        expectedAttendance: Number(expectedAttendance)
      });
      Alert.alert('Success', 'Event submitted to Council for review!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || err.message || 'Failed to submit event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-surface px-4 py-6">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Request Event</Text>
      </View>

      <View className="bg-card p-4 rounded-2xl border border-border mb-4">
        <Text className="text-muted text-sm font-bold mb-2">Event Title</Text>
        <TextInput
          className="bg-surface text-white p-3 rounded-xl border border-border mb-4"
          placeholder="E.g. Tech Symposium 2026"
          placeholderTextColor="#64748b"
          value={title}
          onChangeText={setTitle}
        />

        <Text className="text-muted text-sm font-bold mb-2">Description</Text>
        <TextInput
          className="bg-surface text-white p-3 rounded-xl border border-border mb-4 h-24"
          placeholder="Details..."
          placeholderTextColor="#64748b"
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />

        <Text className="text-muted text-sm font-bold mb-2">Venue</Text>
        <TextInput
          className="bg-surface text-white p-3 rounded-xl border border-border mb-4"
          value={venue}
          onChangeText={setVenue}
        />

        <Text className="text-muted text-sm font-bold mb-2">Start Time (YYYY-MM-DDTHH:mm)</Text>
        <TextInput
          className="bg-surface text-white p-3 rounded-xl border border-border mb-4"
          placeholder="2026-10-15T09:00"
          placeholderTextColor="#64748b"
          value={startTime}
          onChangeText={setStartTime}
        />

        <Text className="text-muted text-sm font-bold mb-2">End Time (YYYY-MM-DDTHH:mm)</Text>
        <TextInput
          className="bg-surface text-white p-3 rounded-xl border border-border mb-4"
          placeholder="2026-10-15T17:00"
          placeholderTextColor="#64748b"
          value={endTime}
          onChangeText={setEndTime}
        />

        <Text className="text-muted text-sm font-bold mb-2">Expected Attendance</Text>
        <TextInput
          className="bg-surface text-white p-3 rounded-xl border border-border mb-4"
          value={expectedAttendance}
          onChangeText={setExpectedAttendance}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity 
        onPress={handleSubmit}
        disabled={loading}
        className="bg-primary p-4 rounded-xl flex-row justify-center items-center mb-8"
      >
        {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Submit Request</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}
