import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { attendanceApi } from '../../api/attendance.api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function AttendanceOverrideScreen() {
  const [studentId, setStudentId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [status, setStatus] = useState('present');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleOverride = async () => {
    try {
      setLoading(true);
      await attendanceApi.override(studentId, date, startTime, status);
      Alert.alert('Success', 'Attendance overridden successfully!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to override attendance');
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
        <Text className="text-white text-2xl font-bold">Override Attendance</Text>
      </View>

      <View className="bg-card p-4 rounded-2xl border border-border mb-4">
        <Text className="text-muted text-sm font-bold mb-2">Student Enrollment No</Text>
        <TextInput
          className="bg-surface text-white p-3 rounded-xl border border-border mb-4"
          placeholder="e.g. extc2024001"
          placeholderTextColor="#64748b"
          value={studentId}
          onChangeText={setStudentId}
        />

        <Text className="text-muted text-sm font-bold mb-2">Date (YYYY-MM-DD)</Text>
        <TextInput
          className="bg-surface text-white p-3 rounded-xl border border-border mb-4"
          placeholder="2023-10-15"
          placeholderTextColor="#64748b"
          value={date}
          onChangeText={setDate}
        />

        <Text className="text-muted text-sm font-bold mb-2">Slot Start Time (HH:MM)</Text>
        <TextInput
          className="bg-surface text-white p-3 rounded-xl border border-border mb-4"
          placeholder="09:00"
          placeholderTextColor="#64748b"
          value={startTime}
          onChangeText={setStartTime}
        />

        <Text className="text-muted text-sm font-bold mb-2">Status</Text>
        <View className="flex-row mb-2">
          <TouchableOpacity 
            onPress={() => setStatus('present')}
            className={`flex-1 p-3 rounded-l-xl border border-border items-center ${status === 'present' ? 'bg-success/20 border-success' : 'bg-surface'}`}
          >
            <Text className={status === 'present' ? 'text-success font-bold' : 'text-muted'}>Present</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setStatus('absent')}
            className={`flex-1 p-3 border-y border-r border-border items-center ${status === 'absent' ? 'bg-error/20 border-error' : 'bg-surface'}`}
          >
            <Text className={status === 'absent' ? 'text-error font-bold' : 'text-muted'}>Absent</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setStatus('late')}
            className={`flex-1 p-3 rounded-r-xl border-y border-r border-border items-center ${status === 'late' ? 'bg-warning/20 border-warning' : 'bg-surface'}`}
          >
            <Text className={status === 'late' ? 'text-warning font-bold' : 'text-muted'}>Late</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity 
        onPress={handleOverride}
        disabled={loading}
        className="bg-primary p-4 rounded-xl flex-row justify-center items-center"
      >
        {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Save Override</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}
