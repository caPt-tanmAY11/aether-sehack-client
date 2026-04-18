import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { timetableApi } from '../../api/timetable.api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function TimetableReviewScreen() {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const data = await timetableApi.getPending();
      setTimetables(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch pending timetables');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    try {
      setLoading(true);
      await timetableApi.review(id, status, `HOD ${status}`);
      Alert.alert('Success', `Timetable ${status}`);
      fetchPending();
    } catch (err) {
      Alert.alert('Error', 'Failed to review timetable');
      setLoading(false);
    }
  };

  if (loading && timetables.length === 0) {
    return <View className="flex-1 bg-surface justify-center items-center"><ActivityIndicator color="#6366f1" size="large" /></View>;
  }

  return (
    <ScrollView className="flex-1 bg-surface px-4 py-6">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Timetable Review</Text>
      </View>

      {timetables.length === 0 ? (
        <Text className="text-muted text-center mt-10">No pending timetables requiring your review.</Text>
      ) : (
        timetables.map((tt, i) => (
          <View key={i} className="bg-card p-4 rounded-2xl border border-border mb-4">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1 mr-2">
                <Text className="text-white font-bold text-lg">Sem {tt.semester} - Div {tt.division}</Text>
                <Text className="text-muted text-sm">{tt.academicYear} • Uploaded by Coord</Text>
              </View>
              <View className="bg-warning/20 px-2 py-1 rounded-md border border-warning/50">
                <Text className="text-warning text-xs font-bold capitalize">{tt.status}</Text>
              </View>
            </View>
            
            <View className="bg-surface p-3 rounded-xl border border-border mb-4 flex-row items-center">
              <Ionicons name="grid" size={20} color="#6366f1" />
              <Text className="text-slate-300 text-xs ml-2 flex-1">{tt.slots?.length || 0} slots configured</Text>
            </View>

            <View className="flex-row justify-between">
              <TouchableOpacity 
                onPress={() => handleReview(tt._id, 'rejected')}
                className="flex-1 bg-surface border border-error/50 p-3 rounded-xl mr-2 items-center"
              >
                <Text className="text-error font-bold">Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleReview(tt._id, 'approved')}
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
