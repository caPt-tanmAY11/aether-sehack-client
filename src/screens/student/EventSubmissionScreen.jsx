import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { eventsApi } from '../../api/events.api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EventSubmissionScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('Auditorium');
  
  const d = new Date();
  const [start, setStart] = useState(d);
  const [end, setEnd] = useState(new Date(d.getTime() + 2 * 60 * 60 * 1000));
  
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');
  const [activeField, setActiveField] = useState('start');

  const [expectedAttendance, setExpectedAttendance] = useState('100');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleShowPicker = (field, mode) => {
    setActiveField(field);
    setPickerMode(mode);
    setShowPicker(true);
  };

  const handlePickerChange = (event, selectedDate) => {
    setShowPicker(false);
    if (!selectedDate) return;
    if (activeField === 'start') setStart(selectedDate);
    else setEnd(selectedDate);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await eventsApi.createEvent({
        title,
        description,
        venue,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
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

        <Text className="text-muted text-sm font-bold mb-2">Start Time</Text>
        <View className="flex-row gap-2 mb-4">
          <TouchableOpacity 
            onPress={() => handleShowPicker('start', 'date')}
            className="flex-1 bg-surface p-3 rounded-xl border border-border flex-row items-center justify-between"
          >
            <Text className="text-white">{start.toLocaleDateString()}</Text>
            <Ionicons name="calendar-outline" size={16} color="#64748b" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleShowPicker('start', 'time')}
            className="flex-1 bg-surface p-3 rounded-xl border border-border flex-row items-center justify-between"
          >
            <Text className="text-white">{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            <Ionicons name="time-outline" size={16} color="#64748b" />
          </TouchableOpacity>
        </View>

        <Text className="text-muted text-sm font-bold mb-2">End Time</Text>
        <View className="flex-row gap-2 mb-4">
          <TouchableOpacity 
            onPress={() => handleShowPicker('end', 'date')}
            className="flex-1 bg-surface p-3 rounded-xl border border-border flex-row items-center justify-between"
          >
            <Text className="text-white">{end.toLocaleDateString()}</Text>
            <Ionicons name="calendar-outline" size={16} color="#64748b" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleShowPicker('end', 'time')}
            className="flex-1 bg-surface p-3 rounded-xl border border-border flex-row items-center justify-between"
          >
            <Text className="text-white">{end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            <Ionicons name="time-outline" size={16} color="#64748b" />
          </TouchableOpacity>
        </View>

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

      {showPicker && (
        <DateTimePicker
          value={activeField === 'start' ? start : end}
          mode={pickerMode}
          is24Hour={false}
          display="default"
          onChange={handlePickerChange}
        />
      )}
    </ScrollView>
  );
}
