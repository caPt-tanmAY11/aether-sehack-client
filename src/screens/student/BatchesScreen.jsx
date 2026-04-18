import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { apiClient } from '../../api/client';
import { Ionicons } from '@expo/vector-icons';

export default function BatchesScreen() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/batches/student');
      setBatches(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-surface justify-center items-center">
        <ActivityIndicator color="#6366f1" size="large" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-surface px-4 py-6">
      <Text className="text-white text-2xl font-bold mb-6">My Batches</Text>

      {batches.length === 0 ? (
        <View className="items-center mt-10">
          <Ionicons name="people-outline" size={48} color="#475569" />
          <Text className="text-muted mt-4">You are not assigned to any batches yet.</Text>
        </View>
      ) : (
        batches.map((batch) => (
          <View key={batch._id} className="bg-card p-4 rounded-2xl border border-border mb-4">
            <View className="flex-row items-center mb-2">
              <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-3">
                <Ionicons name="people" size={20} color="#6366f1" />
              </View>
              <View>
                <Text className="text-white text-lg font-bold">{batch.name}</Text>
                <Text className="text-muted text-sm">Sem {batch.semester} • Div {batch.division}</Text>
              </View>
            </View>
            <View className="mt-3 border-t border-border pt-3">
              <Text className="text-slate-300">
                Faculty: <Text className="text-white font-bold">{batch.facultyId?.name}</Text>
              </Text>
              <Text className="text-slate-300">
                Academic Year: <Text className="text-white font-bold">{batch.academicYear}</Text>
              </Text>
            </View>
          </View>
        ))
      )}
      <View className="h-20" />
    </ScrollView>
  );
}
