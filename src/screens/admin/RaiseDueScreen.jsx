import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { paymentsApi } from '../../api/payments.api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const DUE_TYPES = [
  { label: 'Library Fine', value: 'library', icon: 'library' },
  { label: 'Canteen Bill', value: 'canteen', icon: 'restaurant' },
  { label: 'Lab Due', value: 'lab', icon: 'flask' },
  { label: 'Other', value: 'other', icon: 'receipt' },
];

export default function RaiseDueScreen() {
  const navigation = useNavigation();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form state
  const [type, setType] = useState('library');
  const [amount, setAmount] = useState(''); // in Rupees (we convert to paise)
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length > 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = async () => {
    try {
      setSearching(true);
      const data = await paymentsApi.searchStudents(searchQuery);
      setSearchResults(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleRaiseDue = async () => {
    if (!selectedStudent || !amount || !description || !dueDate) {
      Alert.alert('Error', 'Please fill all fields and select a student');
      return;
    }

    try {
      setSubmitting(true);
      const amountPaise = Math.round(parseFloat(amount) * 100);
      
      await paymentsApi.raiseDue({
        studentId: selectedStudent._id,
        type,
        amount: amountPaise,
        description,
        dueDate: new Date(dueDate),
      });

      Alert.alert('Success', `Due raised for ${selectedStudent.name}`);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to raise due');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-surface px-4 py-6">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Issue Fine/Bill</Text>
      </View>

      {/* Student Search */}
      <Text className="text-muted text-xs font-bold uppercase tracking-wider mb-2">1. Select Student</Text>
      {selectedStudent ? (
        <View className="bg-primary/20 border border-primary p-4 rounded-2xl flex-row items-center justify-between mb-6">
          <View className="flex-1">
            <Text className="text-white font-bold">{selectedStudent.name}</Text>
            <Text className="text-muted text-xs">ENR: {selectedStudent.enrollmentNo}</Text>
            <Text className="text-muted text-xs">{selectedStudent.departmentId?.name} • Sem {selectedStudent.semester}</Text>
          </View>
          <TouchableOpacity onPress={() => setSelectedStudent(null)} className="p-2">
            <Ionicons name="close-circle" size={24} color="#f87171" />
          </TouchableOpacity>
        </View>
      ) : (
        <View className="mb-6">
          <View className="bg-card flex-row items-center px-4 rounded-2xl border border-border">
            <Ionicons name="search" size={20} color="#64748b" />
            <TextInput
              placeholder="Search by name or enrollment number..."
              placeholderTextColor="#64748b"
              className="flex-1 h-12 text-white ml-2"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searching && <ActivityIndicator size="small" color="#6366f1" />}
          </View>

          {searchResults.length > 0 && (
            <View className="bg-card border-x border-b border-border rounded-b-2xl overflow-hidden mt-[-10px] pt-[10px]">
              {searchResults.map((s) => (
                <TouchableOpacity
                  key={s._id}
                  onPress={() => setSelectedStudent(s)}
                  className="p-4 border-t border-border"
                >
                  <Text className="text-white font-bold">{s.name}</Text>
                  <Text className="text-muted text-xs">ENR: {s.enrollmentNo} • {s.departmentId?.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Due Details */}
      <Text className="text-muted text-xs font-bold uppercase tracking-wider mb-2">2. Due Details</Text>
      
      {/* Type Picker */}
      <View className="flex-row flex-wrap justify-between mb-4">
        {DUE_TYPES.map((dt) => (
          <TouchableOpacity
            key={dt.value}
            onPress={() => setType(dt.value)}
            className={`w-[48%] p-4 rounded-2xl border mb-3 flex-row items-center ${
              type === dt.value ? 'bg-primary border-primary' : 'bg-card border-border'
            }`}
          >
            <Ionicons name={dt.icon} size={20} color={type === dt.value ? 'white' : '#6366f1'} />
            <Text className={`font-bold ml-2 ${type === dt.value ? 'text-white' : 'text-muted'}`}>
              {dt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="space-y-4">
        <View>
          <Text className="text-muted text-sm mb-2">Amount (₹)</Text>
          <TextInput
            placeholder="e.g. 500.00"
            placeholderTextColor="#64748b"
            keyboardType="numeric"
            className="bg-card h-12 px-4 rounded-xl border border-border text-white"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <View>
          <Text className="text-muted text-sm mb-2">Description</Text>
          <TextInput
            placeholder="e.g. Late return of 'Data Structures' book"
            placeholderTextColor="#64748b"
            multiline
            numberOfLines={3}
            className="bg-card p-4 rounded-xl border border-border text-white"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View>
          <Text className="text-muted text-sm mb-2">Due Date (YYYY-MM-DD)</Text>
          <TextInput
            placeholder="2025-12-31"
            placeholderTextColor="#64748b"
            className="bg-card h-12 px-4 rounded-xl border border-border text-white"
            value={dueDate}
            onChangeText={setDueDate}
          />
        </View>
      </View>

      <TouchableOpacity
        onPress={handleRaiseDue}
        disabled={submitting}
        className="bg-primary rounded-2xl py-4 items-center justify-center mt-8 mb-12"
      >
        {submitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-lg">Raise Due</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
