import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { timetableApi } from '../../api/timetable.api';
import WeekView from '../../components/timetable/WeekView';
import { useTheme } from '../../hooks/ThemeContext';
import AppHeader from '../../components/AppHeader';

export default function TimetableScreen() {
  const { theme: T } = useTheme();
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchTimetable(); }, []);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await timetableApi.getMyTimetable();
      setTimetable(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[s.center, { backgroundColor: T.bg }]}>
        <ActivityIndicator size="large" color={T.accent} />
      </View>
    );
  }

  return (
    <View style={[s.root, { backgroundColor: T.bg }]}>
      <AppHeader title="My Timetable" showBack={false} />
      {error && (
        <View style={[s.errorBox, { backgroundColor: T.errorSoft, borderColor: T.error }]}>
          <Text style={[s.errorText, { color: T.error }]}>{error}</Text>
        </View>
      )}
      <WeekView timetable={timetable} />
    </View>
  );
}

const s = StyleSheet.create({
  root:     { flex: 1 },
  center:   { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorBox: {
    margin: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  errorText: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
});
