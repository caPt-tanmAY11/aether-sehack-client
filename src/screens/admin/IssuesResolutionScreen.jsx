import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { issuesApi } from '../../api/issues.api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/ThemeContext';
import AppHeader from '../../components/AppHeader';

export default function IssuesResolutionScreen() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { theme: T } = useTheme();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const data = await issuesApi.getAllIssues();
      setIssues(data || []);
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

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="Campus Issues" showBack />

      {loading && issues.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={T.accent} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          {issues.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Ionicons name="shield-checkmark-outline" size={56} color={T.muted} />
              <Text style={{ color: T.text, fontSize: 18, fontWeight: '900', marginTop: 16 }}>All Clear</Text>
              <Text style={{ color: T.muted, textAlign: 'center', marginTop: 8 }}>
                No campus issues reported.
              </Text>
            </View>
          ) : (
            issues.map((iss, i) => (
              <View key={iss._id || i} style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={{ color: T.text, fontWeight: '900', fontSize: 16 }}>{iss.title}</Text>
                    <Text style={{ color: T.muted, fontSize: 12, marginTop: 4 }}>
                      {iss.category} • Loc: {iss.locationDesc}
                    </Text>
                  </View>
                  <View style={[
                    s.badge, 
                    { 
                      backgroundColor: iss.status === 'open' ? `${T.error}20` : iss.status === 'in_progress' ? `${T.warning}20` : `${T.success}20`,
                      borderColor: iss.status === 'open' ? `${T.error}50` : iss.status === 'in_progress' ? `${T.warning}50` : `${T.success}50` 
                    }
                  ]}>
                    <Text style={{ 
                      color: iss.status === 'open' ? T.error : iss.status === 'in_progress' ? T.warning : T.success, 
                      fontSize: 10, fontWeight: '900', textTransform: 'capitalize' 
                    }}>
                      {iss.status.replace('_', ' ')}
                    </Text>
                  </View>
                </View>

                <Text style={{ color: T.textSub, fontSize: 13, lineHeight: 18, marginBottom: 16 }}>
                  {iss.description}
                </Text>

                {iss.status !== 'resolved' && (
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    {iss.status === 'open' && (
                      <TouchableOpacity 
                        onPress={() => handleResolve(iss._id, 'in_progress')}
                        style={[s.actionBtn, { flex: 1, backgroundColor: T.bg, borderColor: `${T.warning}50` }]}
                      >
                        <Text style={{ color: T.warning, fontWeight: '900' }}>Mark In Progress</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                      onPress={() => handleResolve(iss._id, 'resolved')}
                      style={[s.actionBtn, { flex: 1, backgroundColor: `${T.success}20`, borderColor: `${T.success}50` }]}
                    >
                      <Text style={{ color: T.success, fontWeight: '900' }}>Resolve Ticket</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1,
  },
  actionBtn: {
    paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
});
