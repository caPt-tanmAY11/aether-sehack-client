import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { timetableApi } from '../../api/timetable.api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function TimetableUploadScreen() {
  const [semester, setSemester] = useState('3');
  const [division, setDivision] = useState('A');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [jsonInput, setJsonInput] = useState('[]');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleUpload = async () => {
    try {
      setLoading(true);
      const parsedSlots = JSON.parse(jsonInput);
      await timetableApi.upload({
        semester: Number(semester),
        division,
        academicYear,
        slots: parsedSlots
      });
      Alert.alert('Success', 'Timetable submitted for HOD review!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || err.message || 'Failed to upload timetable');
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
        <Text className="text-white text-2xl font-bold">Upload Timetable</Text>
      </View>

      <View className="bg-card p-4 rounded-2xl border border-border mb-4">
        <Text className="text-muted text-sm font-bold mb-2">Semester</Text>
        <TextInput
          className="bg-surface text-white p-3 rounded-xl border border-border mb-4"
          value={semester}
          onChangeText={setSemester}
          keyboardType="numeric"
        />

        <Text className="text-muted text-sm font-bold mb-2">Division</Text>
        <TextInput
          className="bg-surface text-white p-3 rounded-xl border border-border mb-4"
          value={division}
          onChangeText={setDivision}
        />

        <Text className="text-muted text-sm font-bold mb-2">Academic Year</Text>
        <TextInput
          className="bg-surface text-white p-3 rounded-xl border border-border mb-4"
          value={academicYear}
          onChangeText={setAcademicYear}
        />

        <Text className="text-muted text-sm font-bold mb-2">Slots (JSON Array)</Text>
        <TextInput
          className="bg-surface text-white p-3 rounded-xl border border-border h-40"
          value={jsonInput}
          onChangeText={setJsonInput}
          multiline
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity 
        onPress={handleUpload}
        disabled={loading}
        className="bg-primary p-4 rounded-xl flex-row justify-center items-center mb-8"
      >
        {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Submit to HOD</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}
