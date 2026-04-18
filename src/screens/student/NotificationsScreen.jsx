import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { notificationsApi } from '../../api/notifications.api';
import { useNotificationsStore } from '../../store/notifications.store';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const notifications = useNotificationsStore(state => state.notifications);
  const setNotifications = useNotificationsStore(state => state.setNotifications);
  const markReadInStore = useNotificationsStore(state => state.markRead);
  const markAllReadInStore = useNotificationsStore(state => state.markAllRead);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsApi.getAll();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await notificationsApi.markRead(id);
      markReadInStore(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      markAllReadInStore();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ScrollView className="flex-1 bg-surface px-4 py-6">
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Notifications</Text>
        </View>
        <TouchableOpacity onPress={handleMarkAllRead} className="bg-card px-3 py-1.5 rounded-lg border border-border">
          <Text className="text-muted text-xs font-bold uppercase tracking-wider">Mark All Read</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="items-center mt-10"><ActivityIndicator color="#6366f1" /></View>
      ) : notifications.length === 0 ? (
        <View className="items-center mt-10">
          <Ionicons name="notifications-off-outline" size={48} color="#334155" />
          <Text className="text-muted mt-4">You're all caught up!</Text>
        </View>
      ) : (
        notifications.map(n => (
          <TouchableOpacity 
            key={n._id}
            onPress={() => handleMarkRead(n._id, n.read)}
            className={`p-4 rounded-2xl border mb-3 flex-row items-start ${n.read ? 'bg-surface border-border' : 'bg-primary/10 border-primary/30'}`}
          >
            <View className={`w-2 h-2 rounded-full mt-2 mr-3 ${n.read ? 'bg-transparent' : 'bg-primary'}`} />
            <View className="flex-1">
              <Text className={`${n.read ? 'text-slate-300' : 'text-white'} font-bold mb-1`}>{n.title}</Text>
              {n.body ? <Text className="text-slate-400 text-sm mb-1">{n.body}</Text> : null}
              <Text className="text-muted text-xs">{new Date(n.createdAt).toLocaleString()}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}
