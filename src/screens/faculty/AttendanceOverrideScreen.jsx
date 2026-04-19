import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { attendanceApi } from '../../api/attendance.api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/ThemeContext';

export default function AttendanceOverrideScreen() {
  const { theme: T } = useTheme();
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
    <ScrollView style={{ backgroundColor: T.bg }} className="flex-1 px-4 py-6">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={T.text} />
        </TouchableOpacity>
        <Text style={{ color: T.text }} className="text-2xl font-bold">Override Attendance</Text>
      </View>

      <View style={{ backgroundColor: T.card, borderColor: T.border }} className="p-4 rounded-2xl border mb-4">
        <Text style={{ color: T.muted }} className="text-sm font-bold mb-2">Student Enrollment No</Text>
        <TextInput
          style={{ backgroundColor: T.bg, color: T.text, borderColor: T.border }}
          className="p-3 rounded-xl border mb-4"
          placeholder="e.g. extc2024001"
          placeholderTextColor={T.muted}
          value={studentId}
          onChangeText={setStudentId}
        />

        <Text style={{ color: T.muted }} className="text-sm font-bold mb-2">Date (YYYY-MM-DD)</Text>
        <TextInput
          style={{ backgroundColor: T.bg, color: T.text, borderColor: T.border }}
          className="p-3 rounded-xl border mb-4"
          placeholder="2023-10-15"
          placeholderTextColor={T.muted}
          value={date}
          onChangeText={setDate}
        />

        <Text style={{ color: T.muted }} className="text-sm font-bold mb-2">Slot Start Time (HH:MM)</Text>
        <TextInput
          style={{ backgroundColor: T.bg, color: T.text, borderColor: T.border }}
          className="p-3 rounded-xl border mb-4"
          placeholder="09:00"
          placeholderTextColor={T.muted}
          value={startTime}
          onChangeText={setStartTime}
        />

        <Text style={{ color: T.muted }} className="text-sm font-bold mb-2">Status</Text>
        <View className="flex-row mb-2">
          <TouchableOpacity 
            onPress={() => setStatus('present')}
            style={{ 
              backgroundColor: status === 'present' ? `${T.success}20` : T.bg, 
              borderColor: status === 'present' ? T.success : T.border 
            }}
            className="flex-1 p-3 rounded-l-xl border border-r-0 items-center"
          >
            <Text style={{ color: status === 'present' ? T.success : T.muted }} className="font-bold">Present</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setStatus('absent')}
            style={{ 
              backgroundColor: status === 'absent' ? `${T.error}20` : T.bg, 
              borderColor: status === 'absent' ? T.error : T.border 
            }}
            className="flex-1 p-3 border items-center"
          >
            <Text style={{ color: status === 'absent' ? T.error : T.muted }} className="font-bold">Absent</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setStatus('late')}
            style={{ 
              backgroundColor: status === 'late' ? `${T.warning}20` : T.bg, 
              borderColor: status === 'late' ? T.warning : T.border 
            }}
            className="flex-1 p-3 rounded-r-xl border border-l-0 items-center"
          >
            <Text style={{ color: status === 'late' ? T.warning : T.muted }} className="font-bold">Late</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity 
        onPress={handleOverride}
        disabled={loading}
        style={{ backgroundColor: T.accent }}
        className="p-4 rounded-xl flex-row justify-center items-center"
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Save Override</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}
