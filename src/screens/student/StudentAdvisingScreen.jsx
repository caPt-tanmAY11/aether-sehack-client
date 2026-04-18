import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { advisingApi } from '../../api/advising.api';
import { apiClient } from '../../api/client';

const STATUS_COLOR = {
  pending: 'text-warning',
  acknowledged: 'text-primary',
  done: 'text-success',
  rejected: 'text-error',
};

export default function StudentAdvisingScreen() {
  const navigation = useNavigation();
  const [faculty, setFaculty] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [facultyRes, requestsRes] = await Promise.all([
        apiClient.get('/auth/users', { params: { role: 'faculty' } }).catch(() => ({ data: { data: [] } })),
        advisingApi.getMyRequests().catch(() => [])
      ]);
      setFaculty(facultyRes.data?.data || []);
      setMyRequests(requestsRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFaculty || !message.trim()) {
      Alert.alert('Incomplete', 'Please select a faculty and write a message.');
      return;
    }
    setSubmitting(true);
    try {
      await advisingApi.createRequest({ facultyId: selectedFaculty._id, message: message.trim() });
      Alert.alert('Success', 'Your advising request has been submitted!');
      setShowModal(false);
      setMessage('');
      setSelectedFaculty(null);
      fetchAll();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <View className="flex-1 bg-surface justify-center items-center"><ActivityIndicator color="#6366f1" size="large" /></View>;
  }

  return (
    <ScrollView className="flex-1 bg-surface px-4 pt-6">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Faculty Advising</Text>
      </View>

      {/* Request Button */}
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        className="bg-primary/20 border border-primary/50 p-4 rounded-2xl mb-6 flex-row items-center"
      >
        <View className="w-12 h-12 bg-primary rounded-full items-center justify-center mr-4">
          <Ionicons name="person-add" size={24} color="white" />
        </View>
        <View>
          <Text className="text-white font-bold text-lg">Request Advising Session</Text>
          <Text className="text-muted text-sm">Contact a faculty member for guidance</Text>
        </View>
      </TouchableOpacity>

      {/* My Requests */}
      <Text className="text-white text-lg font-bold mb-4">My Requests</Text>
      {myRequests.length === 0 ? (
        <Text className="text-muted text-center mb-8">No requests yet.</Text>
      ) : (
        myRequests.map((req, i) => (
          <View key={i} className="bg-card p-4 rounded-2xl border border-border mb-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-white font-bold">{req.facultyId?.name}</Text>
              <Text className={`text-xs font-bold uppercase ${STATUS_COLOR[req.status] || 'text-muted'}`}>
                {req.status}
              </Text>
            </View>
            <Text className="text-slate-300 text-sm mb-2">{req.message}</Text>
            {req.facultyReply ? (
              <View className="bg-primary/10 p-3 rounded-xl border border-primary/30 mt-2">
                <Text className="text-primary text-xs font-bold mb-1">Faculty Reply</Text>
                <Text className="text-slate-300 text-sm">{req.facultyReply}</Text>
              </View>
            ) : null}
            <View className="flex-row justify-between items-center mt-3">
              <Text className="text-muted text-xs">{new Date(req.createdAt).toLocaleDateString()}</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Chat', { facultyId: req.facultyId?._id, facultyName: req.facultyId?.name })}
                className="flex-row items-center bg-primary/20 px-3 py-1.5 rounded-lg"
              >
                <Ionicons name="chatbubble-outline" size={14} color="#6366f1" />
                <Text className="text-primary text-xs font-bold ml-1">Open Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <View className="h-10" />

      {/* Request Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-card rounded-t-3xl p-6">
            <Text className="text-white text-xl font-bold mb-6">New Advising Request</Text>

            <Text className="text-muted text-sm font-bold mb-2">Select Faculty</Text>
            <View className="bg-surface border border-border rounded-xl overflow-hidden mb-4">
              {faculty.length === 0 ? (
                <Text className="text-muted text-sm p-3">No faculty found.</Text>
              ) : (
                faculty.map((f, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setSelectedFaculty(f)}
                    className={`flex-row items-center p-3 ${i < faculty.length - 1 ? 'border-b border-border/50' : ''} ${selectedFaculty?._id === f._id ? 'bg-primary/20' : ''}`}
                  >
                    <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center mr-3">
                      <Text className="text-primary text-xs font-bold">{f.name?.[0]?.toUpperCase()}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className={`font-bold text-sm ${selectedFaculty?._id === f._id ? 'text-primary' : 'text-white'}`}>{f.name}</Text>
                      <Text className="text-muted text-xs">{f.departmentId?.name}</Text>
                    </View>
                    {selectedFaculty?._id === f._id && <Ionicons name="checkmark-circle" size={18} color="#6366f1" />}
                  </TouchableOpacity>
                ))
              )}
            </View>

            <Text className="text-muted text-sm font-bold mb-2">Your Message</Text>
            <TextInput
              className="bg-surface text-white p-4 rounded-xl border border-border mb-6"
              placeholder="Describe what you need guidance on..."
              placeholderTextColor="#64748b"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => { setShowModal(false); setMessage(''); setSelectedFaculty(null); }}
                className="flex-1 p-4 rounded-xl border border-border items-center"
              >
                <Text className="text-muted font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-primary p-4 rounded-xl items-center"
              >
                {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Submit Request</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
