import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { advisingApi } from '../../api/advising.api';
import { useAuthStore } from '../../store/auth.store';

export default function AdvisingScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' or 'followups'
  const [notes, setNotes] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'notes') {
        const data = await advisingApi.getMyNotes();
        setNotes(data);
      } else {
        const data = await advisingApi.getFollowUps();
        setFollowups(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDone = async (id) => {
    try {
      setLoading(true);
      await advisingApi.markFollowUpDone(id);
      Alert.alert('Success', 'Follow-up marked as done');
      fetchData();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update note');
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-surface">
      <View className="px-4 pt-12 pb-4 bg-card border-b border-border flex-row justify-between items-center">
        <Text className="text-white text-xl font-bold">Student Advising</Text>
        <TouchableOpacity onPress={() => Alert.alert('WIP', 'Create advising note form would go here')} className="bg-primary px-3 py-1.5 rounded-lg">
          <Text className="text-white text-xs font-bold uppercase tracking-wider">New Note</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row mx-4 mt-4 mb-2 bg-card rounded-xl p-1 border border-border">
        <TouchableOpacity 
          onPress={() => setActiveTab('notes')}
          className={`flex-1 py-2 items-center rounded-lg ${activeTab === 'notes' ? 'bg-primary' : 'bg-transparent'}`}
        >
          <Text className={activeTab === 'notes' ? 'text-white font-bold' : 'text-muted font-bold'}>My Notes</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('followups')}
          className={`flex-1 py-2 items-center rounded-lg ${activeTab === 'followups' ? 'bg-primary' : 'bg-transparent'}`}
        >
          <Text className={activeTab === 'followups' ? 'text-white font-bold' : 'text-muted font-bold'}>Pending Follow-ups</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="p-4 flex-1">
        {loading ? (
          <ActivityIndicator color="#6366f1" size="large" className="mt-10" />
        ) : activeTab === 'notes' ? (
          notes.length === 0 ? (
            <View className="items-center mt-10"><Text className="text-muted text-lg">No advising notes yet.</Text></View>
          ) : (
            notes.map(note => (
              <View key={note._id} className="bg-card p-4 rounded-2xl border border-border mb-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-white text-lg font-bold flex-1">{note.studentId?.name || 'Unknown Student'}</Text>
                  <View className="bg-primary/20 px-2 py-1 rounded-md border border-primary/30">
                    <Text className="text-primary text-xs font-bold uppercase">{note.category}</Text>
                  </View>
                </View>
                <Text className="text-muted text-xs mb-3">{new Date(note.createdAt).toLocaleDateString()}</Text>
                <Text className="text-slate-300 mb-2">{note.noteText}</Text>
                {note.followUpNeeded && !note.followUpDone && (
                  <View className="bg-warning/10 p-2 rounded-lg mt-2 flex-row items-center border border-warning/30">
                    <Ionicons name="calendar-outline" size={16} color="#f59e0b" className="mr-2" />
                    <Text className="text-warning text-xs">Follow up on {new Date(note.followUpDate).toLocaleDateString()}</Text>
                  </View>
                )}
                {note.followUpDone && (
                  <View className="bg-success/10 p-2 rounded-lg mt-2 flex-row items-center border border-success/30">
                    <Ionicons name="checkmark-circle" size={16} color="#22c55e" className="mr-2" />
                    <Text className="text-success text-xs">Follow-up completed</Text>
                  </View>
                )}
              </View>
            ))
          )
        ) : (
          followups.length === 0 ? (
            <View className="items-center mt-10"><Text className="text-muted text-lg">No pending follow-ups.</Text></View>
          ) : (
            followups.map(note => (
              <View key={note._id} className="bg-card p-4 rounded-2xl border border-border mb-4">
                <Text className="text-white text-lg font-bold mb-1">{note.studentId?.name}</Text>
                <Text className="text-warning text-sm font-bold mb-3">Due: {new Date(note.followUpDate).toLocaleDateString()}</Text>
                <Text className="text-slate-300 mb-4">{note.noteText}</Text>
                <TouchableOpacity onPress={() => handleMarkDone(note._id)} className="bg-success/20 border border-success/30 p-3 rounded-xl flex-row justify-center items-center">
                  <Ionicons name="checkmark" size={20} color="#22c55e" className="mr-2" />
                  <Text className="text-success font-bold text-sm">Mark as Done</Text>
                </TouchableOpacity>
              </View>
            ))
          )
        )}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
