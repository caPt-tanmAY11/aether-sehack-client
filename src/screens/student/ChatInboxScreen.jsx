import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { chatApi } from '../../api/chat.api';
import { advisingApi } from '../../api/advising.api';
import { useAuthStore } from '../../store/auth.store';

export default function ChatInboxScreen() {
  const navigation = useNavigation();
  const user = useAuthStore(state => state.user);
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('inbox'); // 'inbox' | 'advising'
  const [advisingRequests, setAdvisingRequests] = useState([]);

  useEffect(() => { fetchData(); }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'inbox') {
        const data = await chatApi.getInbox().catch(() => []);
        setInbox(data || []);
      } else {
        const data = await advisingApi.getMyRequests().catch(() => []);
        setAdvisingRequests(data || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const myId = user?._id || user?.userId;

  const openChat = async (item) => {
    const facultyId = item.other?._id;
    const facultyName = item.other?.name;
    navigation.navigate('Chat', { facultyId, facultyName });
  };

  const tryOpenAdvisingChat = async (req) => {
    const facultyId = req.facultyId?._id;
    const facultyName = req.facultyId?.name;
    if (req.status === 'pending') {
      Alert.alert(
        'Request Pending',
        'Your advising request is still pending. You can chat once the faculty acknowledges it.',
        [{ text: 'OK' }]
      );
      return;
    }
    navigation.navigate('Chat', { facultyId, facultyName });
  };

  const STATUS_COLOR = { pending: '#f59e0b', acknowledged: '#6366f1', done: '#22c55e', rejected: '#ef4444' };

  return (
    <View className="flex-1 bg-surface">
      <View className="px-4 pt-12 pb-4 bg-card border-b border-border">
        <Text className="text-white text-xl font-bold">Messages</Text>
      </View>

      {/* Tab Bar */}
      <View className="flex-row bg-card border-b border-border px-4 py-2">
        <TouchableOpacity
          onPress={() => setTab('inbox')}
          className={`flex-1 py-2 rounded-xl mr-2 items-center ${tab === 'inbox' ? 'bg-primary' : 'bg-surface'}`}
        >
          <Text className={`font-bold text-sm ${tab === 'inbox' ? 'text-white' : 'text-muted'}`}>
            📨 Faculty Messages
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('advising')}
          className={`flex-1 py-2 rounded-xl items-center ${tab === 'advising' ? 'bg-primary' : 'bg-surface'}`}
        >
          <Text className={`font-bold text-sm ${tab === 'advising' ? 'text-white' : 'text-muted'}`}>
            🎓 Advising
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#6366f1" size="large" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4">
          {tab === 'inbox' && (
            <>
              <Text className="text-muted text-xs mb-4">
                Faculty can initiate chats with you. You can reply once they've messaged you.
              </Text>
              {inbox.length === 0 ? (
                <View className="items-center py-16">
                  <Ionicons name="chatbubbles-outline" size={56} color="#334155" />
                  <Text className="text-muted text-lg mt-4">No messages yet</Text>
                  <Text className="text-muted text-xs text-center mt-2 px-8">
                    When a faculty member messages you, it will appear here.
                  </Text>
                </View>
              ) : (
                inbox.map((item, i) => {
                  const isLastMine = item.lastSenderId?.toString() === myId?.toString();
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => openChat(item)}
                      className="bg-card p-4 rounded-2xl border border-border mb-3 flex-row items-center"
                    >
                      <View className="w-12 h-12 rounded-full bg-success/20 items-center justify-center mr-3">
                        <Text className="text-success text-lg font-bold">
                          {item.other?.name?.[0]?.toUpperCase()}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <View className="flex-row justify-between items-center mb-1">
                          <Text className="text-white font-bold">{item.other?.name}</Text>
                          <Text className="text-muted text-xs">
                            {new Date(item.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                        <Text className="text-muted text-xs capitalize mb-0.5">{item.other?.role}</Text>
                        <Text className="text-slate-400 text-sm" numberOfLines={1}>
                          {isLastMine ? '✓ You: ' : ''}{item.lastMessage}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color="#334155" />
                    </TouchableOpacity>
                  );
                })
              )}
            </>
          )}

          {tab === 'advising' && (
            <>
              <Text className="text-muted text-xs mb-4">
                Your advising requests. Chat is unlocked once faculty acknowledges your request.
              </Text>
              {advisingRequests.length === 0 ? (
                <View className="items-center py-16">
                  <Ionicons name="school-outline" size={56} color="#334155" />
                  <Text className="text-muted text-lg mt-4">No requests yet</Text>
                </View>
              ) : (
                advisingRequests.map((req, i) => (
                  <View key={i} className="bg-card p-4 rounded-2xl border border-border mb-3">
                    <View className="flex-row justify-between items-start mb-2">
                      <Text className="text-white font-bold">{req.facultyId?.name}</Text>
                      <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: `${STATUS_COLOR[req.status]}20` }}>
                        <Text className="text-xs font-bold uppercase" style={{ color: STATUS_COLOR[req.status] }}>
                          {req.status}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-slate-300 text-sm mb-2">{req.message}</Text>
                    {req.facultyReply ? (
                      <View className="bg-primary/10 p-3 rounded-xl border border-primary/30 mb-3">
                        <Text className="text-primary text-xs font-bold mb-1">Faculty Reply</Text>
                        <Text className="text-slate-300 text-sm">{req.facultyReply}</Text>
                      </View>
                    ) : null}
                    <TouchableOpacity
                      onPress={() => tryOpenAdvisingChat(req)}
                      className={`py-2.5 rounded-xl flex-row items-center justify-center ${
                        req.status === 'pending' ? 'bg-surface border border-border' : 'bg-primary/20 border border-primary/50'
                      }`}
                    >
                      <Ionicons
                        name={req.status === 'pending' ? 'lock-closed-outline' : 'chatbubble-outline'}
                        size={15}
                        color={req.status === 'pending' ? '#64748b' : '#6366f1'}
                      />
                      <Text className={`ml-2 font-bold text-sm ${req.status === 'pending' ? 'text-muted' : 'text-primary'}`}>
                        {req.status === 'pending' ? 'Awaiting approval' : 'Open Chat'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </>
          )}
          <View className="h-10" />
        </ScrollView>
      )}
    </View>
  );
}
