import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { eventsApi } from '../../api/events.api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { handleViewPdf } from '../../utils/pdf';

export default function EventApprovalsScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.getPending();
      setEvents(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch pending events');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    try {
      setLoading(true);
      await eventsApi.review(id, status, `Reviewed as ${status}`);
      Alert.alert('Success', `Event ${status}`);
      fetchPending();
    } catch (err) {
      Alert.alert('Error', 'Failed to review event');
      setLoading(false);
    }
  };

  if (loading && events.length === 0) {
    return <View className="flex-1 bg-surface justify-center items-center"><ActivityIndicator color="#6366f1" size="large" /></View>;
  }

  return (
    <ScrollView className="flex-1 bg-surface px-4 py-6">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Event Approvals</Text>
      </View>

      {events.length === 0 ? (
        <Text className="text-muted text-center mt-10">No pending events requiring your approval.</Text>
      ) : (
        events.map((ev, i) => (
          <View key={i} className="bg-card p-4 rounded-2xl border border-border mb-4">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1 mr-2">
                <Text className="text-white font-bold text-lg">{ev.title}</Text>
                <Text className="text-muted text-sm">{ev.requestedBy?.name || 'Unknown'} • {new Date(ev.startTime).toLocaleDateString()}</Text>
              </View>
              <View className="flex-row items-center">
                <View className="bg-warning/20 px-2 py-1 rounded-md border border-warning/50 mr-2">
                  <Text className="text-warning text-xs font-bold capitalize">{ev.currentStage} Stage</Text>
                </View>
                <TouchableOpacity onPress={() => {
                  handleViewPdf(`/events/${ev._id}/pdf`, `Event_Request_${ev._id}`).catch(err => Alert.alert('Error', err.message));
                }} className="p-2 bg-surface rounded-full border border-border">
                  <Ionicons name="document-text-outline" size={20} color="#818cf8" />
                </TouchableOpacity>
              </View>
            </View>
            <Text className="text-slate-300 text-sm mb-4">{ev.description}</Text>
            
            {ev.conflictChecked && ev.conflictResult?.msg && (
              <View className="bg-surface p-3 rounded-xl border border-border mb-4 flex-row items-center">
                <Ionicons name={ev.conflictResult.msg.includes('Conflict') ? "warning" : "checkmark-circle"} size={20} color={ev.conflictResult.msg.includes('Conflict') ? "#f59e0b" : "#22c55e"} />
                <Text className="text-slate-300 text-xs ml-2 flex-1">{ev.conflictResult.msg}</Text>
              </View>
            )}

            <View className="flex-row justify-between">
              <TouchableOpacity 
                onPress={() => handleReview(ev._id, 'rejected')}
                className="flex-1 bg-surface border border-error/50 p-3 rounded-xl mr-2 items-center"
              >
                <Text className="text-error font-bold">Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleReview(ev._id, 'approved')}
                className="flex-1 bg-primary p-3 rounded-xl ml-2 items-center"
              >
                <Text className="text-white font-bold">Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}
