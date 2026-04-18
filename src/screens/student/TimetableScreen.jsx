import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { timetableApi } from '../../api/timetable.api';
import WeekView from '../../components/timetable/WeekView';

export default function TimetableScreen() {
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTimetable();
  }, []);

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
      <View className="flex-1 bg-surface justify-center items-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface pt-4">
      {error && (
        <View className="mx-4 mb-4 bg-error/20 p-3 rounded-lg border border-error/50">
          <Text className="text-error text-center">{error}</Text>
        </View>
      )}
      <WeekView timetable={timetable} />
    </View>
  );
}
