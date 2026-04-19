import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { paymentsApi } from '../../api/payments.api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/ThemeContext';
import CalendarPicker from '../../components/CalendarPicker';

const DUE_TYPES = [
  { label: 'Library Fine', value: 'library', icon: 'library' },
  { label: 'Canteen Bill', value: 'canteen', icon: 'restaurant' },
  { label: 'Lab Due',      value: 'lab',     icon: 'flask' },
  { label: 'Other',        value: 'other',   icon: 'receipt' },
];

export default function RaiseDueScreen() {
  const navigation = useNavigation();
  const { theme: T } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [type, setType] = useState('library');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 2) handleSearch();
      else setSearchResults([]);
    }, 500);
    return () => clearTimeout(timer);
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
      await paymentsApi.raiseDue({
        studentId: selectedStudent._id,
        type,
        amount: Math.round(parseFloat(amount) * 100),
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
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      {/* Header */}
      <View style={{ backgroundColor: T.card, borderBottomColor: T.border, borderBottomWidth: 1, paddingTop: 52, paddingBottom: 14, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 14 }}>
          <Ionicons name="arrow-back" size={24} color={T.text} />
        </TouchableOpacity>
        <View>
          <Text style={{ color: T.text, fontSize: 20, fontWeight: '900' }}>Issue Fine / Bill</Text>
          <Text style={{ color: T.muted, fontSize: 12 }}>Raise a due for a student</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>

        {/* ── Step 1: Select Student ── */}
        <Text style={{ color: T.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
          1. Select Student
        </Text>

        {selectedStudent ? (
          <View style={{ backgroundColor: `${T.accent}15`, borderColor: T.accent, borderWidth: 1, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: T.text, fontWeight: '800', fontSize: 15 }}>{selectedStudent.name}</Text>
              <Text style={{ color: T.muted, fontSize: 12, marginTop: 2 }}>ENR: {selectedStudent.enrollmentNo}</Text>
              <Text style={{ color: T.muted, fontSize: 12 }}>{selectedStudent.departmentId?.name} · Sem {selectedStudent.semester}</Text>
            </View>
            <TouchableOpacity onPress={() => { setSelectedStudent(null); setSearchQuery(''); }}>
              <Ionicons name="close-circle" size={26} color={T.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ marginBottom: 20 }}>
            {/* Search box */}
            <View style={{ backgroundColor: T.card, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, borderRadius: 14, borderColor: T.border, borderWidth: 1 }}>
              <Ionicons name="search" size={20} color={T.muted} />
              <TextInput
                placeholder="Search by name or enrollment no..."
                placeholderTextColor={T.muted}
                style={{ flex: 1, height: 48, color: T.text, marginLeft: 10, fontSize: 14 }}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searching && <ActivityIndicator size="small" color={T.accent} />}
            </View>

            {/* Dropdown results */}
            {searchResults.length > 0 && (
              <View style={{ backgroundColor: T.card, borderColor: T.border, borderWidth: 1, borderRadius: 14, marginTop: 6, overflow: 'hidden' }}>
                {searchResults.map((s, i) => (
                  <TouchableOpacity
                    key={s._id}
                    onPress={() => { setSelectedStudent(s); setSearchResults([]); setSearchQuery(''); }}
                    style={{ padding: 14, borderTopColor: i === 0 ? 'transparent' : T.border, borderTopWidth: i === 0 ? 0 : 1 }}
                  >
                    <Text style={{ color: T.text, fontWeight: '700', fontSize: 14 }}>{s.name}</Text>
                    <Text style={{ color: T.muted, fontSize: 12, marginTop: 2 }}>ENR: {s.enrollmentNo} · {s.departmentId?.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── Step 2: Due Details ── */}
        <Text style={{ color: T.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          2. Due Details
        </Text>

        {/* Type Picker */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 14 }}>
          {DUE_TYPES.map(dt => (
            <TouchableOpacity
              key={dt.value}
              onPress={() => setType(dt.value)}
              style={{
                width: '48%', padding: 14, borderRadius: 16, marginBottom: 10,
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: type === dt.value ? T.accent : T.card,
                borderColor: type === dt.value ? T.accent : T.border,
                borderWidth: 1,
              }}
            >
              <Ionicons name={dt.icon} size={20} color={type === dt.value ? '#ffffff' : T.accent} />
              <Text style={{ color: type === dt.value ? '#ffffff' : T.text, fontWeight: '700', marginLeft: 8, fontSize: 13 }}>
                {dt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Amount */}
        <Text style={{ color: T.muted, fontSize: 13, fontWeight: '700', marginBottom: 6 }}>Amount (₹)</Text>
        <TextInput
          placeholder="e.g. 500.00"
          placeholderTextColor={T.muted}
          keyboardType="numeric"
          style={{ backgroundColor: T.card, color: T.text, borderColor: T.border, borderWidth: 1, height: 48, paddingHorizontal: 14, borderRadius: 12, marginBottom: 14, fontSize: 14 }}
          value={amount}
          onChangeText={setAmount}
        />

        {/* Description */}
        <Text style={{ color: T.muted, fontSize: 13, fontWeight: '700', marginBottom: 6 }}>Description</Text>
        <TextInput
          placeholder="e.g. Late return of 'Data Structures' book"
          placeholderTextColor={T.muted}
          multiline
          numberOfLines={3}
          style={{ backgroundColor: T.card, color: T.text, borderColor: T.border, borderWidth: 1, padding: 14, borderRadius: 12, marginBottom: 14, fontSize: 14, textAlignVertical: 'top', minHeight: 80 }}
          value={description}
          onChangeText={setDescription}
        />

        {/* Due Date */}
        <CalendarPicker label="Due Date" value={dueDate} onChange={setDueDate} />

        {/* Submit */}
        <TouchableOpacity
          onPress={handleRaiseDue}
          disabled={submitting}
          style={{ backgroundColor: T.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' }}
        >
          {submitting
            ? <ActivityIndicator color="#ffffff" />
            : <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 16 }}>Raise Due</Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
