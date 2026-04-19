import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { issuesApi } from '../../api/issues.api';
import { useTheme } from '../../hooks/ThemeContext';

export default function IssuesScreen() {
  const { theme: T } = useTheme();
  const [activeTab, setActiveTab] = useState('report');
  const [myIssues, setMyIssues] = useState([]);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('it');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'mine') fetchMyIssues();
  }, [activeTab]);

  const fetchMyIssues = async () => {
    try {
      setLoading(true);
      const data = await issuesApi.getMyIssues();
      setMyIssues(data || []);
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

  const statusColor = (status) => {
    if (status === 'open') return T.error;
    if (status === 'in_progress') return T.warning;
    return T.success;
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      {/* Header */}
      <View style={{ backgroundColor: T.card, borderBottomColor: T.border, borderBottomWidth: 1, paddingTop: 52, paddingBottom: 14, paddingHorizontal: 20 }}>
        <Text style={{ color: T.text, fontSize: 22, fontWeight: '900' }}>Helpdesk</Text>
        <Text style={{ color: T.muted, fontSize: 12, marginTop: 2 }}>Report or track campus issues</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        {/* Tab Toggle */}
        <View style={{ flexDirection: 'row', backgroundColor: T.card, borderColor: T.border, borderWidth: 1, borderRadius: 14, padding: 4, marginBottom: 20 }}>
          {[{ id: 'report', label: 'Report Issue' }, { id: 'mine', label: 'My Tickets' }].map(tab => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                paddingVertical: 9,
                alignItems: 'center',
                borderRadius: 10,
                backgroundColor: activeTab === tab.id ? T.accent : 'transparent',
              }}
            >
              <Text style={{ color: activeTab === tab.id ? '#ffffff' : T.muted, fontWeight: '700', fontSize: 13 }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'report' ? (
          <View style={{ backgroundColor: T.card, borderColor: T.border, borderWidth: 1, borderRadius: 20, padding: 16 }}>
            {/* Title */}
            <Text style={{ color: T.muted, fontWeight: '700', marginBottom: 6, marginLeft: 2 }}>Title</Text>
            <TextInput
              style={{
                backgroundColor: T.bg,
                color: T.text,
                borderColor: T.border,
                borderWidth: 1,
                borderRadius: 12,
                padding: 14,
                marginBottom: 14,
                fontSize: 14,
              }}
              placeholder="e.g. Projector not working"
              placeholderTextColor={T.muted}
              value={title}
              onChangeText={setTitle}
            />

            {/* Location */}
            <Text style={{ color: T.muted, fontWeight: '700', marginBottom: 6, marginLeft: 2 }}>Location</Text>
            <TextInput
              style={{
                backgroundColor: T.bg,
                color: T.text,
                borderColor: T.border,
                borderWidth: 1,
                borderRadius: 12,
                padding: 14,
                marginBottom: 14,
                fontSize: 14,
              }}
              placeholder="e.g. Lab 101, Room 204"
              placeholderTextColor={T.muted}
              value={location}
              onChangeText={setLocation}
            />

            {/* Category */}
            <Text style={{ color: T.muted, fontWeight: '700', marginBottom: 8, marginLeft: 2 }}>Category</Text>
            <View style={{ flexDirection: 'row', marginBottom: 14 }}>
              {['it', 'maintenance', 'disciplinary'].map(cat => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 8,
                    backgroundColor: category === cat ? T.accent : T.bg,
                    borderColor: category === cat ? T.accent : T.border,
                    borderWidth: 1,
                  }}
                >
                  <Text style={{ color: category === cat ? '#ffffff' : T.muted, fontWeight: '600', textTransform: 'capitalize', fontSize: 12 }}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Description */}
            <Text style={{ color: T.muted, fontWeight: '700', marginBottom: 6, marginLeft: 2 }}>Description</Text>
            <TextInput
              style={{
                backgroundColor: T.bg,
                color: T.text,
                borderColor: T.border,
                borderWidth: 1,
                borderRadius: 12,
                padding: 14,
                marginBottom: 20,
                fontSize: 14,
                height: 100,
                textAlignVertical: 'top',
              }}
              placeholder="Describe the issue in detail..."
              placeholderTextColor={T.muted}
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={{ backgroundColor: T.accent, padding: 16, borderRadius: 14, alignItems: 'center' }}
            >
              {loading
                ? <ActivityIndicator color="#ffffff" />
                : <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 16 }}>Submit Report</Text>
              }
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {loading ? (
              <ActivityIndicator color={T.accent} size="large" style={{ marginTop: 40 }} />
            ) : myIssues.length === 0 ? (
              <View style={{ alignItems: 'center', marginTop: 60 }}>
                <Ionicons name="shield-checkmark-outline" size={56} color={T.muted} />
                <Text style={{ color: T.muted, marginTop: 16, fontSize: 16 }}>No issues reported yet.</Text>
              </View>
            ) : (
              myIssues.map((iss, i) => (
                <View key={i} style={{ backgroundColor: T.card, borderColor: T.border, borderWidth: 1, borderRadius: 20, padding: 16, marginBottom: 14 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={{ color: T.text, fontWeight: '800', fontSize: 15 }}>{iss.title}</Text>
                      <Text style={{ color: T.muted, fontSize: 12, marginTop: 3 }}>{iss.category} · {iss.locationDesc}</Text>
                    </View>
                    <View style={{ backgroundColor: `${statusColor(iss.status)}20`, borderColor: `${statusColor(iss.status)}50`, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                      <Text style={{ color: statusColor(iss.status), fontSize: 10, fontWeight: '800', textTransform: 'capitalize' }}>
                        {iss.status.replace('_', ' ')}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: T.textSub, fontSize: 13, lineHeight: 18, marginBottom: 6 }}>{iss.description}</Text>
                  {iss.resolutionNotes && (
                    <View style={{ backgroundColor: `${T.success}10`, borderColor: `${T.success}30`, borderWidth: 1, padding: 10, borderRadius: 10, marginTop: 4 }}>
                      <Text style={{ color: T.success, fontSize: 11, fontWeight: '700', marginBottom: 3 }}>Resolution Note:</Text>
                      <Text style={{ color: T.textSub, fontSize: 12 }}>{iss.resolutionNotes}</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
