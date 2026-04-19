import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal } from 'react-native';
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

  const [templateType, setTemplateType] = useState('plain');
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

  const [conflictData, setConflictData] = useState(null);
  const [showConflictModal, setShowConflictModal] = useState(false);

  const handleSubmit = async (force = false) => {
    try {
      setLoading(true);
      const res = await eventsApi.createEvent({
        title,
        description,
        venue,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        expectedAttendance: Number(expectedAttendance),
        templateType
      });
      
      Alert.alert('Success', 'Event submitted to Council for review!');
      navigation.goBack();
    } catch (err) {
      if (err?.response?.status === 409) {
        setConflictData(err.response.data);
        setShowConflictModal(true);
      } else {
        Alert.alert('Error', err?.response?.data?.message || err.message || 'Failed to submit event');
      }
    } finally {
      setLoading(false);
    }
  };

  const applySlot = (slot) => {
    // slot format from AI: "YYYY-MM-DD HH:mm - HH:mm"
    try {
      const parts = slot.split(' '); // ["2024-05-20", "10:00", "-", "12:00"]
      const datePart = parts[0];
      const startTime = parts[1];
      const endTime = parts[3];
      
      const newStart = new Date(`${datePart}T${startTime}:00`);
      const newEnd = new Date(`${datePart}T${endTime}:00`);
      
      if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) throw new Error('Invalid Date');

      setStart(newStart);
      setEnd(newEnd);
      setShowConflictModal(false);
      Alert.alert('Slot Applied', 'The suggested time slot has been applied to your form. You can now resubmit.');
    } catch (e) {
      console.error('Failed to parse suggested slot', e);
      Alert.alert('Error', 'Failed to apply this slot. Please select another or enter manually.');
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
        <Text className="text-white text-lg font-bold mb-4">Select Event Template</Text>
        <View className="flex-row gap-2 mb-2">
          {['plain', 'case_study', 'hackathon'].map(type => (
            <TouchableOpacity 
              key={type}
              onPress={() => setTemplateType(type)}
              className={`flex-1 p-3 rounded-xl border ${templateType === type ? 'bg-primary border-primary' : 'bg-surface border-border'} items-center`}
            >
              <Text className={`text-sm font-bold ${templateType === type ? 'text-white' : 'text-muted'}`}>
                {type === 'plain' ? 'Plain Event' : type === 'case_study' ? 'Case Study' : 'Hackathon'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text className="text-indigo-200 text-xs italic mb-4">
          {templateType === 'hackathon' && 'Includes: IT Lab permissions, Security Guard CC, AC, Wi-Fi, Smart Board'}
          {templateType === 'case_study' && 'Includes: 4 Classrooms, Dept Office, AC, Wi-Fi, Smart Board'}
          {templateType === 'plain' && 'Includes: 1 Classroom, AC, Wi-Fi, Smart Board'}
        </Text>

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

      {/* AI Conflict Resolver Modal */}
      <Modal
        visible={showConflictModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConflictModal(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-surface rounded-t-[32px] p-6 border-t border-primary/30">
            <View className="items-center mb-6">
              <View className="w-16 h-16 rounded-full bg-error/20 items-center justify-center mb-4 border border-error/30">
                <Ionicons name="warning" size={32} color="#ef4444" />
              </View>
              <Text className="text-white text-xl font-bold text-center">AI Conflict Resolver</Text>
              <Text className="text-muted text-center mt-2 px-4">
                {conflictData?.message || 'The selected venue is occupied during this time.'}
              </Text>
            </View>

            <Text className="text-primary font-bold text-sm mb-3 uppercase tracking-widest">AI Suggested Slots</Text>
            {conflictData?.data?.suggestions?.length > 0 ? (
              conflictData.data.suggestions.map((slot, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => applySlot(slot)}
                  className="bg-card border border-border p-4 rounded-2xl mb-3 flex-row items-center justify-between"
                >
                  <View className="flex-1">
                    <Text className="text-white font-bold">{slot}</Text>
                    <Text className="text-muted text-xs mt-1">Free for booking • 95%+ Approval Probability</Text>
                  </View>
                  <Ionicons name="add-circle" size={24} color="#6366f1" />
                </TouchableOpacity>
              ))
            ) : (
              <View className="bg-card p-4 rounded-2xl mb-4 items-center">
                <Text className="text-muted text-sm italic">AI is unable to find alternative slots for this date.</Text>
              </View>
            )}

            <TouchableOpacity 
              onPress={() => setShowConflictModal(false)}
              className="mt-4 bg-surface border border-border p-4 rounded-2xl items-center"
            >
              <Text className="text-white font-bold">Cancel</Text>
            </TouchableOpacity>
            <View className="h-6" />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
