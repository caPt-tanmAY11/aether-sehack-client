import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { issuesApi } from '../../api/issues.api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function IssuesResolutionScreen() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const data = await issuesApi.getAllIssues();
      setIssues(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id, status) => {
    try {
      setLoading(true);
      await issuesApi.resolveIssue(id, status, `Marked as ${status} by admin`);
      Alert.alert('Success', `Issue marked as ${status}`);
      fetchAll();
    } catch (err) {
      Alert.alert('Error', 'Failed to update issue');
      setLoading(false);
    }
  };

  if (loading && issues.length === 0) {
    return <View className="flex-1 bg-surface justify-center items-center"><ActivityIndicator color="#6366f1" size="large" /></View>;
  }

  return (
    <ScrollView className="flex-1 bg-surface px-4 py-6">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Campus Issues</Text>
      </View>

      {issues.length === 0 ? (
        <Text className="text-muted text-center mt-10">No issues reported.</Text>
      ) : (
        issues.map((iss, i) => (
          <View key={i} className="bg-card p-4 rounded-2xl border border-border mb-4">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1 mr-2">
                <Text className="text-white font-bold text-lg">{iss.title}</Text>
                <Text className="text-muted text-sm">{iss.category} • Loc: {iss.location}</Text>
              </View>
              <View className={`px-2 py-1 rounded-md border ${iss.status === 'open' ? 'bg-error/20 border-error/50' : iss.status === 'in_progress' ? 'bg-warning/20 border-warning/50' : 'bg-success/20 border-success/50'}`}>
                <Text className={`${iss.status === 'open' ? 'text-error' : iss.status === 'in_progress' ? 'text-warning' : 'text-success'} text-xs font-bold capitalize`}>{iss.status.replace('_', ' ')}</Text>
              </View>
            </View>
            <Text className="text-slate-300 text-sm mb-4">{iss.description}</Text>

            {iss.status !== 'resolved' && (
              <View className="flex-row justify-between mt-2">
                {iss.status === 'open' && (
                  <TouchableOpacity 
                    onPress={() => handleResolve(iss._id, 'in_progress')}
                    className="flex-1 bg-surface border border-warning/50 p-3 rounded-xl mr-2 items-center"
                  >
                    <Text className="text-warning font-bold">Mark In Progress</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  onPress={() => handleResolve(iss._id, 'resolved')}
                  className="flex-1 bg-success/20 border border-success/50 p-3 rounded-xl ml-2 items-center"
                >
                  <Text className="text-success font-bold">Resolve Ticket</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}
