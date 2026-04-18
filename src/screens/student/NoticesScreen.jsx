import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { noticesApi } from '../../api/notices.api';
import { useAuthStore } from '../../store/auth.store';

export default function NoticesScreen({ navigation }) {
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
    <View className="flex-1 bg-surface">
      <View className="px-4 pt-12 pb-4 bg-card border-b border-border flex-row justify-between items-center">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 bg-surface rounded-full">
            <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Campus Notices</Text>
        </View>
        {isFacultyOrAdmin && (
          <TouchableOpacity onPress={() => navigation.navigate('CreateNotice')} className="bg-primary px-3 py-1.5 rounded-lg">
            <Text className="text-white text-xs font-bold uppercase tracking-wider">Publish</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="p-4 flex-1">
        {loading ? (
          <ActivityIndicator color="#6366f1" size="large" className="mt-10" />
        ) : notices.length === 0 ? (
          <View className="items-center mt-10">
            <Ionicons name="document-text-outline" size={48} color="#334155" className="mb-4" />
            <Text className="text-muted text-lg">No notices available.</Text>
          </View>
        ) : (
          notices.map(notice => (
            <View key={notice._id} className="bg-card p-4 rounded-2xl border border-border mb-4">
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-white text-lg font-bold flex-1 mr-2">{notice.title}</Text>
                {notice.priority === 'high' && (
                  <View className="bg-error/20 px-2 py-1 rounded-md border border-error/50">
                    <Text className="text-error text-xs font-bold uppercase">High</Text>
                  </View>
                )}
              </View>
              <Text className="text-muted text-xs mb-3">Published by Prof. {notice.publishedBy?.name} • {new Date(notice.createdAt).toLocaleDateString()}</Text>
              <Text className="text-slate-300 leading-5">{notice.body}</Text>
            </View>
          ))
        )}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
