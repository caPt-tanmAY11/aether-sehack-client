import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { syllabusApi } from '../../api/syllabus.api';
import { useAuthStore } from '../../store/auth.store';
import { useFocusEffect } from '@react-navigation/native';

export default function SyllabusScreen() {
  const [syllabusData, setSyllabusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const user = useAuthStore(state => state.user);

  useFocusEffect(
    useCallback(() => {
      fetchSyllabus();
    }, [])
  );

  const fetchSyllabus = async () => {
    try {
      setLoading(true);
      // Pass semester from the logged-in student; backend also reads from token
      const currentYear = new Date().getFullYear();
      const academicYear = `${currentYear}-${currentYear + 1}`;
      const data = await syllabusApi.getMySummary(user?.semester, academicYear);
      setSyllabusData(data || []);
    } catch (err) {
      console.error('Syllabus fetch error:', err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  if (loading) {
    return (
      <View className="flex-1 bg-surface justify-center items-center">
        <ActivityIndicator color="#6366f1" size="large" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-surface px-4 pt-6">
      <Text className="text-white text-2xl font-bold mb-1">Syllabus</Text>
      <Text className="text-muted text-sm mb-6">
        Semester {user?.semester || '?'} · {user?.departmentId?.name || 'Your Department'}
      </Text>

      {syllabusData.length === 0 ? (
        <View className="items-center py-16">
          <Ionicons name="book-outline" size={56} color="#334155" />
          <Text className="text-muted text-lg mt-4">No syllabus data available.</Text>
          <Text className="text-muted text-sm mt-2 text-center px-8">
            Your faculty hasn't set up syllabus trackers yet for Semester {user?.semester}.
          </Text>
        </View>
      ) : (
        syllabusData.map((item, index) => {
          const isExpanded = expanded[item._id || index];
          const done = item.topics?.filter(t => t.status === 'done').length || 0;
          const total = item.topics?.length || 0;
          const pct = total > 0 ? Math.round((done / total) * 100) : item.completionPercent || 0;

          return (
            <TouchableOpacity
              key={item._id || index}
              onPress={() => toggle(item._id || index)}
              activeOpacity={0.8}
              className="bg-card rounded-2xl border border-border mb-4 overflow-hidden"
            >
              {/* Header */}
              <View className="p-4">
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1 mr-3">
                    <Text className="text-white text-base font-bold">{item.subjectId?.name}</Text>
                    <Text className="text-muted text-xs mt-0.5">
                      {item.subjectId?.code} · Prof. {item.facultyId?.name}
                    </Text>
                  </View>
                  <View className="items-center">
                    <View className="w-14 h-14 rounded-full border-4 border-primary/30 items-center justify-center">
                      <Text className="text-white text-sm font-bold">{pct}%</Text>
                    </View>
                  </View>
                </View>

                {/* Progress Bar */}
                <View className="h-2 bg-surface rounded-full overflow-hidden mb-2">
                  <View
                    className={`h-full rounded-full ${pct >= 75 ? 'bg-success' : pct >= 40 ? 'bg-warning' : 'bg-primary'}`}
                    style={{ width: `${pct}%` }}
                  />
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-muted text-xs">{done}/{total} topics covered</Text>
                  <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color="#64748b" />
                </View>
              </View>

              {/* Topics Accordion */}
              {isExpanded && total > 0 && (
                <View className="border-t border-border px-4 pb-4 pt-3">
                  {item.topics.map((topic, ti) => (
                    <View
                      key={topic._id || ti}
                      className="flex-row items-start py-2 border-b border-border/30"
                    >
                      <View
                        className={`w-5 h-5 rounded-full mr-3 mt-0.5 items-center justify-center flex-shrink-0 ${
                          topic.status === 'done' ? 'bg-success' : 'bg-surface border border-muted'
                        }`}
                      >
                        {topic.status === 'done' && (
                          <Ionicons name="checkmark" size={12} color="white" />
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className={`text-sm leading-5 ${topic.status === 'done' ? 'text-white' : 'text-muted'}`}>
                          {topic.name}
                        </Text>
                        {topic.completedAt && (
                          <Text className="text-muted text-xs mt-0.5">
                            Done on {new Date(topic.completedAt).toLocaleDateString()}
                          </Text>
                        )}
                        {topic.notes && (
                          <Text className="text-muted text-xs mt-0.5 italic">{topic.notes}</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {isExpanded && total === 0 && (
                <View className="border-t border-border px-4 pb-4 pt-3">
                  <Text className="text-muted text-sm text-center">No topics defined yet.</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })
      )}
      <View className="h-10" />
    </ScrollView>
  );
}
