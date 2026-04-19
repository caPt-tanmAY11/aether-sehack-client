import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { syllabusApi } from '../../api/syllabus.api';
import { apiClient } from '../../api/client';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/ThemeContext';

export default function SyllabusUpdateScreen() {
  const { theme: T } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // Coordination Modal
  const [coordModalVisible, setCoordModalVisible] = useState(false);
  const [coordNodes, setCoordNodes] = useState([]);
  const [coordLoading, setCoordLoading] = useState(false);
  const [activeSubject, setActiveSubject] = useState(null);

  // Topic Update Modal (for adding notes)
  const [topicModalVisible, setTopicModalVisible] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedTrackerId, setSelectedTrackerId] = useState(null);
  const [topicNotes, setTopicNotes] = useState('');
  const [updatingTopic, setUpdatingTopic] = useState(false);

  useEffect(() => {
    fetchSyllabus();
  }, []);

  const fetchSyllabus = async () => {
    try {
      setLoading(true);
      const trackers = await syllabusApi.getFacultyTrackers();
      
      // Calculate progress percentage for UI
      const processed = trackers.map(t => {
        const completedCount = t.topics.filter(topic => topic.status === 'done').length;
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

  const fetchCoordinationNodes = async (subjectId, subjectName) => {
    try {
      setCoordLoading(true);
      setActiveSubject(subjectName);
      setCoordModalVisible(true);
      const res = await apiClient.get(`/syllabus/coordination/${subjectId}`);
      setCoordNodes(res.data.data || []);
    } catch (err) {
      Alert.alert('Error', 'Failed to load coordination nodes');
      setCoordModalVisible(false);
    } finally {
      setCoordLoading(false);
    }
  };

  const openTopicUpdate = (trackerId, topic) => {
    setSelectedTrackerId(trackerId);
    setSelectedTopic(topic);
    setTopicNotes(topic.notes || '');
    setTopicModalVisible(true);
  };

  const submitTopicUpdate = async (status) => {
    try {
      setUpdatingTopic(true);
      await syllabusApi.updateTopic(selectedTrackerId, { 
        topicId: selectedTopic._id, 
        status, 
        notes: topicNotes 
      });
      setTopicModalVisible(false);
      fetchSyllabus();
    } catch (err) {
      Alert.alert('Error', 'Failed to update topic');
    } finally {
      setUpdatingTopic(false);
    }
  };

  if (loading) return <View style={{ backgroundColor: T.bg }} className="flex-1 justify-center items-center"><ActivityIndicator color={T.accent} size="large" /></View>;

  return (
    <ScrollView style={{ backgroundColor: T.bg }} className="flex-1 px-4 py-6">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={T.text} />
        </TouchableOpacity>
        <Text style={{ color: T.text }} className="text-2xl font-bold">My Syllabus Trackers</Text>
      </View>

      {data?.map((tracker, i) => (
        <View key={i} style={{ backgroundColor: T.card, borderColor: T.border }} className="p-4 rounded-2xl border mb-4">
          <View className="flex-row justify-between mb-2">
            <Text style={{ color: T.text }} className="font-bold flex-1">{tracker.subjectId.name} (Div {tracker.division})</Text>
            <Text style={{ color: T.accent }} className="font-bold">{tracker.progress}%</Text>
          </View>
          <View style={{ backgroundColor: T.bg }} className="h-2 rounded-full overflow-hidden mb-4">
            <View style={{ backgroundColor: T.accent, width: `${tracker.progress}%` }} className="h-full" />
          </View>
          
          <TouchableOpacity 
            onPress={() => fetchCoordinationNodes(tracker.subjectId._id, tracker.subjectId.name)}
            style={{ backgroundColor: `${T.accent}20`, borderColor: `${T.accent}50` }}
            className="flex-row items-center justify-center border py-2 rounded-xl mb-4"
          >
            <Ionicons name="git-network-outline" size={16} color={T.accent} />
            <Text style={{ color: T.accent }} className="font-bold text-xs ml-2">View Coordination Nodes</Text>
          </TouchableOpacity>

          <View style={{ borderTopColor: T.border }} className="border-t pt-4">
            <Text style={{ color: T.text }} className="font-bold mb-2">Topics:</Text>
            {tracker.topics.map(topic => (
              <View key={topic._id} style={{ borderBottomColor: `${T.border}80` }} className="flex-row items-center justify-between py-2 border-b">
                <View className="flex-1 mr-2">
                  <Text style={{ color: T.textSub }}>{topic.name}</Text>
                  {topic.notes ? <Text style={{ color: T.muted }} className="text-xs italic mt-0.5">Note: {topic.notes}</Text> : null}
                </View>
                <TouchableOpacity 
                  onPress={() => openTopicUpdate(tracker._id, topic)}
                  style={{ backgroundColor: topic.status === 'done' ? `${T.success}20` : T.bg, borderColor: topic.status === 'done' ? T.success : T.border }}
                  className="px-3 py-1 rounded-full border"
                >
                  <Text style={{ color: topic.status === 'done' ? T.success : T.muted }} className="text-xs font-bold">
                    {topic.status === 'done' ? 'DONE' : 'PENDING'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      ))}

      <TouchableOpacity 
        style={{ backgroundColor: `${T.accent}20`, borderColor: `${T.accent}50` }}
        className="p-4 rounded-xl border items-center border-dashed mt-4 mb-10"
        onPress={() => Alert.alert('Init', 'Trigger syllabusApi.initTracker')}
      >
        <Text style={{ color: T.accent }} className="font-bold">+ Initialize New Subject Tracker</Text>
      </TouchableOpacity>

      {/* Topic Update Modal */}
      <Modal visible={topicModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/60">
          <View style={{ backgroundColor: T.card }} className="rounded-t-3xl p-6">
            <Text style={{ color: T.text }} className="text-xl font-bold mb-1">Update Topic</Text>
            <Text style={{ color: T.muted }} className="text-sm mb-6">{selectedTopic?.name}</Text>

            <Text style={{ color: T.text }} className="font-bold mb-2">Coordination Notes</Text>
            <TextInput
              style={{ backgroundColor: T.bg, color: T.text, borderColor: T.border }}
              className="p-3 rounded-xl border mb-6 min-h-[80px]"
              placeholder="Leave notes for other faculty (e.g. Extra assignment given)" 
              placeholderTextColor={T.muted}
              multiline
              textAlignVertical="top"
              value={topicNotes} 
              onChangeText={setTopicNotes}
            />

            <View className="flex-row gap-3">
              <TouchableOpacity onPress={() => submitTopicUpdate('pending')} disabled={updatingTopic} style={{ backgroundColor: T.bg, borderColor: T.border }} className="flex-1 p-4 rounded-xl border items-center">
                <Text style={{ color: T.text }} className="font-bold">Mark Pending</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => submitTopicUpdate('done')} disabled={updatingTopic} style={{ backgroundColor: T.success }} className="flex-1 p-4 rounded-xl items-center">
                {updatingTopic ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">Mark Done</Text>}
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity onPress={() => setTopicModalVisible(false)} className="mt-4 p-4 rounded-xl items-center">
              <Text style={{ color: T.muted }} className="font-bold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Coordination Nodes Modal */}
      <Modal visible={coordModalVisible} animationType="slide">
        <View style={{ backgroundColor: T.bg }} className="flex-1">
          <View style={{ backgroundColor: T.card, borderBottomColor: T.border, borderBottomWidth: 1 }} className="flex-row justify-between items-center p-4 pt-12">
            <View>
              <Text style={{ color: T.text }} className="text-xl font-bold">Coordination Nodes</Text>
              <Text style={{ color: T.accent }} className="text-xs">{activeSubject}</Text>
            </View>
            <TouchableOpacity onPress={() => setCoordModalVisible(false)} style={{ backgroundColor: T.bg }} className="p-2 rounded-full">
              <Ionicons name="close" size={24} color={T.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView className="flex-1 p-4">
            {coordLoading ? (
              <ActivityIndicator color={T.accent} size="large" className="mt-10" />
            ) : coordNodes.length === 0 ? (
              <Text style={{ color: T.muted }} className="text-center mt-10">No coordination data available.</Text>
            ) : (
              coordNodes.map(node => (
                <View key={node._id} style={{ backgroundColor: T.card, borderColor: T.border }} className="p-4 rounded-2xl border mb-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <View>
                      <Text style={{ color: T.text }} className="font-bold text-lg">{node.facultyId?.name}</Text>
                      <Text style={{ color: T.muted }} className="text-xs">Div {node.division || 'All'}</Text>
                    </View>
                    <View style={{ backgroundColor: `${T.accent}20`, borderColor: `${T.accent}50` }} className="px-3 py-1 rounded-lg border">
                      <Text style={{ color: T.accent }} className="font-bold">{node.completionPercent}%</Text>
                    </View>
                  </View>
                  
                  <View className="mt-2">
                    {node.topics.filter(t => t.notes).length === 0 ? (
                      <Text style={{ color: T.muted }} className="text-xs italic">No notes provided.</Text>
                    ) : (
                      node.topics.filter(t => t.notes).map(topic => (
                        <View key={topic._id} style={{ backgroundColor: T.bg, borderColor: T.border }} className="p-3 rounded-xl mb-2 border">
                          <Text style={{ color: T.textSub }} className="text-xs font-bold mb-1">{topic.name}</Text>
                          <Text style={{ color: T.text }} className="text-sm">{topic.notes}</Text>
                        </View>
                      ))
                    )}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}
