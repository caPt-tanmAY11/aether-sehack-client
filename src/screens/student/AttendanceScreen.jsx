import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { attendanceApi } from '../../api/attendance.api';
import { timetableApi } from '../../api/timetable.api';

export default function AttendanceScreen() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [timetable, setTimetable] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [reportData, ttData] = await Promise.all([
        attendanceApi.getReport(),
        timetableApi.getMyTimetable()
      ]);

      setReport(reportData);
      setTimetable(ttData);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!timetable || !timetable.slots) {
      Alert.alert('Error', 'Timetable not loaded');
      return;
    }

    Alert.alert(
      'Mark Attendance',
      'Checking geo-location...',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Simulate Check-In',
          onPress: async () => {
            setCheckingIn(true);

            try {
              // KEEPING YOUR ORIGINAL LOGIC (Monday first slot)
              const firstSlot = timetable.slots.find(s => s.day === 'Monday');

              if (!firstSlot) {
                throw new Error('No classes available to mark');
              }

              await attendanceApi.markAttendance(
                timetable._id,
                firstSlot.day,
                firstSlot.startTime,
                {
                  latitude: 19.1249,
                  longitude: 72.8464
                }
              );

              Alert.alert('Success', 'Attendance marked successfully!');
              fetchData();
            } catch (err) {
              Alert.alert(
                'Failed',
                err?.response?.data?.message || err.message || 'Could not mark attendance'
              );
            } finally {
              setCheckingIn(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-surface justify-center items-center">
        <ActivityIndicator color="#6366f1" size="large" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-surface px-4 pt-6">
      
      {/* Overall Attendance Circle */}
      <View className="items-center mb-8">
        <View className="w-40 h-40 rounded-full border-8 border-primary/20 items-center justify-center relative">
          <View
            className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent border-l-transparent"
            style={{ transform: [{ rotate: '45deg' }] }}
          />
          <Text className="text-white text-4xl font-bold">
            {report?.overallPercent ?? 0}%
          </Text>
          <Text className="text-muted text-sm mt-1">Overall</Text>
        </View>
      </View>

      {/* Check-in Button */}
      <TouchableOpacity
        onPress={handleCheckIn}
        disabled={checkingIn}
        className="bg-primary p-4 rounded-xl flex-row justify-center items-center mb-8"
      >
        {checkingIn ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Ionicons name="location" size={24} color="white" />
            <Text className="text-white font-bold text-lg ml-2">
              Check-in to Class
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Subject Breakdown */}
      <Text className="text-white text-xl font-bold mb-4">
        Subject Breakdown
      </Text>

      {report?.subjects?.length ? (
        report.subjects.map((sub, i) => (
          <View
            key={i}
            className="bg-card p-4 rounded-2xl border border-border mb-4"
          >
            <View className="flex-row justify-between mb-2">
              <Text className="text-white font-bold flex-1">
                {sub.subject}
              </Text>
              <Text
                className={`font-bold ${
                  sub.percent < 75 ? 'text-error' : 'text-success'
                }`}
              >
                {sub.percent}%
              </Text>
            </View>

            <View className="h-2 bg-surface rounded-full overflow-hidden mb-2">
              <View
                className={`h-full ${
                  sub.percent < 75 ? 'bg-error' : 'bg-success'
                }`}
                style={{ width: `${sub.percent}%` }}
              />
            </View>

            <Text className="text-muted text-xs">
              Attended {sub.attended} out of {sub.total} sessions
            </Text>
          </View>
        ))
      ) : (
        <Text className="text-muted text-center mt-4">
          No attendance data available
        </Text>
      )}

      <View className="h-10" />
    </ScrollView>
  );
}