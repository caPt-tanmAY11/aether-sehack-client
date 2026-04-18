import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { syllabusApi } from '../../api/syllabus.api';

export default function SyllabusScreen() {
  const [syllabusData, setSyllabusData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSyllabus();
  }, []);

  const fetchSyllabus = async () => {
    try {
      setLoading(true);
      const data = await syllabusApi.getMySummary();
      setSyllabusData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View className="flex-1 bg-surface justify-center items-center"><ActivityIndicator color="#6366f1" size="large" /></View>;

  return (
    <ScrollView className="flex-1 bg-surface px-4 pt-4">
      {syllabusData.length === 0 ? (
        <View className="items-center py-10">
          <Text className="text-muted">No syllabus data available.</Text>
        </View>
      ) : (
        syllabusData.map((item, index) => (
          <View key={index} className="bg-card p-4 rounded-2xl border border-border mb-4">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-1">
                <Text className="text-white text-lg font-bold">{item.subjectId?.name}</Text>
                <Text className="text-muted text-sm">{item.subjectId?.code} • Prof. {item.facultyId?.name}</Text>
              </View>
              <View className="w-12 h-12 rounded-full border-4 border-primary items-center justify-center">
                <Text className="text-white text-xs font-bold">{item.completionPercent}%</Text>
              </View>
            </View>

            <View className="border-t border-border pt-3 mt-1">
              {item.topics?.map((topic, i) => (
                <View key={i} className="flex-row items-center mb-2">
                  <View className={`w-4 h-4 rounded-full mr-3 ${topic.status === 'done' ? 'bg-success' : 'bg-surface border border-muted'}`} />
                  <Text className={`flex-1 ${topic.status === 'done' ? 'text-white' : 'text-muted'}`}>
                    {topic.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))
      )}
      <View className="h-10" />
    </ScrollView>
  );
}
