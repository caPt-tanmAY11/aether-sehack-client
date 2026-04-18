import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { issuesApi } from '../../api/issues.api';

export default function IssuesScreen() {
  const [activeTab, setActiveTab] = useState('report'); // 'report' or 'mine'
  const [myIssues, setMyIssues] = useState([]);
  
  // Report Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('it');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'mine') {
      fetchMyIssues();
    }
  }, [activeTab]);

  const fetchMyIssues = async () => {
    try {
      setLoading(true);
      const data = await issuesApi.getMyIssues();
      setMyIssues(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !location) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await issuesApi.reportIssue({ title, description, category, locationDesc: location });
      Alert.alert('Success', 'Issue reported successfully');
      setTitle('');
      setDescription('');
      setLocation('');
    } catch (err) {
      Alert.alert('Failed', err.response?.data?.message || 'Could not report issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-surface px-4 py-6">
      <Text className="text-white text-2xl font-bold mb-6">Helpdesk</Text>

      <View className="flex-row mb-6 bg-card rounded-xl p-1 border border-border">
        <TouchableOpacity 
          onPress={() => setActiveTab('report')}
          className={`flex-1 py-2 items-center rounded-lg ${activeTab === 'report' ? 'bg-primary' : 'bg-transparent'}`}
        >
          <Text className={activeTab === 'report' ? 'text-white font-bold' : 'text-muted font-bold'}>Report Issue</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('mine')}
          className={`flex-1 py-2 items-center rounded-lg ${activeTab === 'mine' ? 'bg-primary' : 'bg-transparent'}`}
        >
          <Text className={activeTab === 'mine' ? 'text-white font-bold' : 'text-muted font-bold'}>My Tickets</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'report' ? (
        <View>
          <View className="bg-card p-4 rounded-2xl border border-border mb-4">
            <Text className="text-muted mb-2 font-bold ml-1">Title</Text>
            <TextInput
              className="bg-surface text-white p-4 rounded-xl mb-4 border border-border"
              placeholder="e.g. Projector not working"
              placeholderTextColor="#64748b"
              value={title}
              onChangeText={setTitle}
            />

            <Text className="text-muted mb-2 font-bold ml-1">Location</Text>
            <TextInput
              className="bg-surface text-white p-4 rounded-xl mb-4 border border-border"
              placeholder="e.g. Lab 101"
              placeholderTextColor="#64748b"
              value={location}
              onChangeText={setLocation}
            />

            <Text className="text-muted mb-2 font-bold ml-1">Category</Text>
            <View className="flex-row mb-4 space-x-2">
              {['it', 'maintenance', 'disciplinary'].map(cat => (
                <TouchableOpacity 
                  key={cat}
                  onPress={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full border ${category === cat ? 'bg-primary border-primary' : 'bg-surface border-border'} mr-2`}
                >
                  <Text className={category === cat ? 'text-white' : 'text-muted capitalize'}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-muted mb-2 font-bold ml-1">Description</Text>
            <TextInput
              className="bg-surface text-white p-4 rounded-xl mb-6 border border-border h-24"
              placeholder="Provide details..."
              placeholderTextColor="#64748b"
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />

            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={loading}
              className="bg-warning p-4 rounded-xl items-center"
            >
              {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Submit Report</Text>}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View>
          {loading ? (
            <ActivityIndicator color="#6366f1" size="large" className="mt-10" />
          ) : myIssues.length === 0 ? (
            <Text className="text-muted text-center mt-10">You have not reported any issues.</Text>
          ) : (
            myIssues.map((iss, i) => (
              <View key={i} className="bg-card p-4 rounded-2xl border border-border mb-4">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 mr-2">
                    <Text className="text-white font-bold text-lg">{iss.title}</Text>
                    <Text className="text-muted text-sm">{iss.category} • Loc: {iss.locationDesc}</Text>
                  </View>
                  <View className={`px-2 py-1 rounded-md border ${iss.status === 'open' ? 'bg-error/20 border-error/50' : iss.status === 'in_progress' ? 'bg-warning/20 border-warning/50' : 'bg-success/20 border-success/50'}`}>
                    <Text className={`${iss.status === 'open' ? 'text-error' : iss.status === 'in_progress' ? 'text-warning' : 'text-success'} text-xs font-bold capitalize`}>{iss.status.replace('_', ' ')}</Text>
                  </View>
                </View>
                <Text className="text-slate-300 text-sm mb-2">{iss.description}</Text>
                {iss.resolutionNotes && (
                  <View className="bg-surface p-3 rounded-xl border border-border mt-2">
                    <Text className="text-success text-xs font-bold mb-1">Resolution Note:</Text>
                    <Text className="text-slate-300 text-xs">{iss.resolutionNotes}</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      )}

      <View className="h-10" />
    </ScrollView>
  );
}
