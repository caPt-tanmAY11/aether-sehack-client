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
    <View style={{ flex: 1, backgroundColor: '#f7f9fb' }}>
      {/* Top Header */}
      <View style={{ paddingTop: 50, paddingBottom: 16, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#eceef0' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, backgroundColor: '#eceef0', borderRadius: 999 }}>
            <Ionicons name="arrow-back" size={24} color="#091426" />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#091426', fontFamily: 'Plus Jakarta Sans' }}>Alerts</Text>
        </View>
        <TouchableOpacity onPress={handleMarkAllRead} style={{ backgroundColor: '#ffffff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: '#e0e3e5' }}>
          <Text style={{ color: '#091426', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>Mark All Read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}><ActivityIndicator color="#6b38d4" size="large" /></View>
        ) : notifications.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 80 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#eceef0', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Ionicons name="notifications-off-outline" size={40} color="#8590a6" />
            </View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#091426' }}>All Caught Up</Text>
            <Text style={{ color: '#45474c', marginTop: 8 }}>You have no new notifications.</Text>
          </View>
        ) : (
          notifications.map(n => (
            <TouchableOpacity 
              key={n._id}
              onPress={() => handleMarkRead(n._id, n.read)}
              style={{
                backgroundColor: n.read ? '#ffffff' : '#e9ddff',
                borderRadius: 20,
                padding: 16,
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'flex-start',
                shadowColor: '#091426',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: n.read ? 0.02 : 0.08,
                shadowRadius: 12,
                elevation: 1,
              }}
            >
              <View style={{ width: 8, height: 8, borderRadius: 4, marginTop: 6, marginRight: 12, backgroundColor: n.read ? 'transparent' : '#6b38d4' }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#091426', fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>{n.title}</Text>
                {n.body ? <Text style={{ color: '#45474c', fontSize: 14, marginBottom: 8, lineHeight: 20 }}>{n.body}</Text> : null}
                <Text style={{ color: '#8590a6', fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>{new Date(n.createdAt).toLocaleString()}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
