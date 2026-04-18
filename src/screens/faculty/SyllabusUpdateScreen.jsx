import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { syllabusApi } from '../../api/syllabus.api';
import { apiClient } from '../../api/client';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function SyllabusUpdateScreen() {
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
            onPress={() => fetchCoordinationNodes(tracker.subjectId._id, tracker.subjectId.name)}
            className="flex-row items-center justify-center bg-primary/10 border border-primary/30 py-2 rounded-xl mb-4"
          >
            <Ionicons name="git-network-outline" size={16} color="#818cf8" />
            <Text className="text-primary font-bold text-xs ml-2">View Coordination Nodes</Text>
          </TouchableOpacity>

          <View className="border-t border-border pt-4">
            <Text className="text-white font-bold mb-2">Topics:</Text>
            {tracker.topics.map(topic => (
              <View key={topic._id} className="flex-row items-center justify-between py-2 border-b border-border/50">
                <View className="flex-1 mr-2">
                  <Text className="text-slate-300">{topic.name}</Text>
                  {topic.notes ? <Text className="text-muted text-xs italic mt-0.5">Note: {topic.notes}</Text> : null}
                </View>
                <TouchableOpacity 
                  onPress={() => openTopicUpdate(tracker._id, topic)}
                  className={`px-3 py-1 rounded-full border ${topic.status === 'done' ? 'bg-success/20 border-success' : 'bg-surface border-border'}`}
                >
                  <Text className={`text-xs font-bold ${topic.status === 'done' ? 'text-success' : 'text-muted'}`}>
                    {topic.status === 'done' ? 'DONE' : 'PENDING'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      ))}

      <TouchableOpacity 
        className="bg-primary/20 p-4 rounded-xl border border-primary/50 items-center border-dashed mt-4 mb-10"
        onPress={() => Alert.alert('Init', 'Trigger syllabusApi.initTracker')}
      >
        <Text className="text-primary font-bold">+ Initialize New Subject Tracker</Text>
      </TouchableOpacity>

      {/* Topic Update Modal */}
      <Modal visible={topicModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-card rounded-t-3xl p-6">
            <Text className="text-white text-xl font-bold mb-1">Update Topic</Text>
            <Text className="text-muted text-sm mb-6">{selectedTopic?.name}</Text>

            <Text className="text-white font-bold mb-2">Coordination Notes</Text>
            <TextInput
              className="bg-surface text-white p-3 rounded-xl border border-border mb-6 min-h-[80px]"
              placeholder="Leave notes for other faculty (e.g. Extra assignment given)" 
              placeholderTextColor="#64748b"
              multiline
              textAlignVertical="top"
              value={topicNotes} 
              onChangeText={setTopicNotes}
            />

            <View className="flex-row gap-3">
              <TouchableOpacity onPress={() => submitTopicUpdate('pending')} disabled={updatingTopic} className="flex-1 bg-surface p-4 rounded-xl border border-border items-center">
                <Text className="text-white font-bold">Mark Pending</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => submitTopicUpdate('done')} disabled={updatingTopic} className="flex-1 bg-success p-4 rounded-xl items-center">
                {updatingTopic ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Mark Done</Text>}
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity onPress={() => setTopicModalVisible(false)} className="mt-4 p-4 rounded-xl items-center">
              <Text className="text-muted font-bold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Coordination Nodes Modal */}
      <Modal visible={coordModalVisible} animationType="slide">
        <View className="flex-1 bg-surface">
          <View className="flex-row justify-between items-center p-4 pt-12 border-b border-border bg-card">
            <View>
              <Text className="text-white text-xl font-bold">Coordination Nodes</Text>
              <Text className="text-primary text-xs">{activeSubject}</Text>
            </View>
            <TouchableOpacity onPress={() => setCoordModalVisible(false)} className="p-2 bg-surface rounded-full">
              <Ionicons name="close" size={24} color="#f1f5f9" />
            </TouchableOpacity>
          </View>
          
          <ScrollView className="flex-1 p-4">
            {coordLoading ? (
              <ActivityIndicator color="#6366f1" size="large" className="mt-10" />
            ) : coordNodes.length === 0 ? (
              <Text className="text-muted text-center mt-10">No coordination data available.</Text>
            ) : (
              coordNodes.map(node => (
                <View key={node._id} className="bg-card p-4 rounded-2xl border border-border mb-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <View>
                      <Text className="text-white font-bold text-lg">{node.facultyId?.name}</Text>
                      <Text className="text-muted text-xs">Div {node.division || 'All'}</Text>
                    </View>
                    <View className="bg-primary/20 px-3 py-1 rounded-lg border border-primary/50">
                      <Text className="text-primary font-bold">{node.completionPercent}%</Text>
                    </View>
                  </View>
                  
                  <View className="mt-2">
                    {node.topics.filter(t => t.notes).length === 0 ? (
                      <Text className="text-muted text-xs italic">No notes provided.</Text>
                    ) : (
                      node.topics.filter(t => t.notes).map(topic => (
                        <View key={topic._id} className="bg-surface p-3 rounded-xl mb-2 border border-border">
                          <Text className="text-slate-300 text-xs font-bold mb-1">{topic.name}</Text>
                          <Text className="text-white text-sm">{topic.notes}</Text>
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
