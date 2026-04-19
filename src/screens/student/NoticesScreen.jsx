import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { noticesApi } from '../../api/notices.api';
import { useAuthStore } from '../../store/auth.store';
import { useTheme } from '../../hooks/ThemeContext';

export default function NoticesScreen({ navigation }) {
  const { theme: T } = useTheme();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = useAuthStore(state => state.role);
  const isFacultyOrAdmin = role === 'faculty' || role === 'hod' || role === 'dean';

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const data = await noticesApi.getNotices();
      setNotices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <View style={{ backgroundColor: T.card, borderBottomColor: T.border, borderBottomWidth: 1 }} className="px-4 pt-12 pb-4 flex-row justify-between items-center">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ backgroundColor: T.bg }} className="mr-4 p-2 rounded-full">
            <Ionicons name="arrow-back" size={24} color={T.text} />
          </TouchableOpacity>
          <Text style={{ color: T.text }} className="text-xl font-bold">Campus Notices</Text>
        </View>
        {isFacultyOrAdmin && (
          <TouchableOpacity onPress={() => navigation.navigate('CreateNotice')} style={{ backgroundColor: T.accent }} className="px-3 py-1.5 rounded-lg">
            <Text className="text-white text-xs font-bold uppercase tracking-wider">Publish</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="p-4 flex-1">
        {loading ? (
          <ActivityIndicator color={T.accent} size="large" className="mt-10" />
        ) : notices.length === 0 ? (
          <View className="items-center mt-10">
            <Ionicons name="document-text-outline" size={48} color={T.muted} className="mb-4" />
            <Text style={{ color: T.muted }} className="text-lg">No notices available.</Text>
          </View>
        ) : (
          notices.map(notice => (
            <View key={notice._id} style={{ backgroundColor: T.card, borderColor: T.border }} className="p-4 rounded-2xl border mb-4">
              <View className="flex-row justify-between items-start mb-2">
                <Text style={{ color: T.text }} className="text-lg font-bold flex-1 mr-2">{notice.title}</Text>
                {notice.priority === 'high' && (
                  <View style={{ backgroundColor: `${T.error}20`, borderColor: `${T.error}50` }} className="px-2 py-1 rounded-md border">
                    <Text style={{ color: T.error }} className="text-xs font-bold uppercase">High</Text>
                  </View>
                )}
              </View>
              <Text style={{ color: T.muted }} className="text-xs mb-3">Published by Prof. {notice.publishedBy?.name} • {new Date(notice.createdAt).toLocaleDateString()}</Text>
              <Text style={{ color: T.textSub }} className="leading-5">{notice.body}</Text>
            </View>
          ))
        )}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
