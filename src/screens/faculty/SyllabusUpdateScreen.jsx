import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { syllabusApi } from '../../api/syllabus.api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function SyllabusUpdateScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchSyllabus();
  }, []);

  const fetchSyllabus = async () => {
    try {
      setLoading(true);
      const trackers = await syllabusApi.getFacultyTrackers();
      
      // Calculate progress percentage for UI
      const processed = trackers.map(t => {
        const completedCount = t.topics.filter(topic => topic.status === 'completed').length;
        const totalTopics = t.topics.length || 1;
        return {
          ...t,
          progress: Math.round((completedCount / totalTopics) * 100),
          completedCount,
          totalTopics
        };
      });
      
      setData(processed);
      setLoading(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to load syllabus data');
      setLoading(false);
    }
  };

  if (loading) return <View className="flex-1 bg-surface justify-center items-center"><ActivityIndicator color="#6366f1" size="large" /></View>;

  return (
    <ScrollView className="flex-1 bg-surface px-4 py-6">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">My Syllabus Trackers</Text>
      </View>

      {data?.map((tracker, i) => (
        <View key={i} className="bg-card p-4 rounded-2xl border border-border mb-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-white font-bold flex-1">{tracker.subjectId.name} (Div {tracker.division})</Text>
            <Text className="text-primary font-bold">{tracker.progress}%</Text>
          </View>
          <View className="h-2 bg-surface rounded-full overflow-hidden mb-4">
            <View className="h-full bg-primary" style={{ width: `${tracker.progress}%` }} />
          </View>
          
          <TouchableOpacity 
            className="bg-surface p-3 rounded-xl border border-border items-center flex-row justify-center"
            onPress={async () => {
              try {
                await syllabusApi.updateTopic(tracker._id, { topicIndex: tracker.completedCount, completed: true });
                Alert.alert('Success', 'Topic marked done');
                fetchSyllabus();
              } catch (err) { Alert.alert('Error', 'Failed to update'); }
            }}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#f1f5f9" className="mr-2" />
            <Text className="text-white font-bold ml-2">Mark Next Topic Done</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity 
        className="bg-primary/20 p-4 rounded-xl border border-primary/50 items-center border-dashed mt-4"
        onPress={() => Alert.alert('Init', 'Trigger syllabusApi.initTracker')}
      >
        <Text className="text-primary font-bold">+ Initialize New Subject Tracker</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
