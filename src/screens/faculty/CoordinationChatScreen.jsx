import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/auth.store';
import { useSocket } from '../../hooks/useSocket';
import { useTheme } from '../../hooks/ThemeContext';

export default function CoordinationChatScreen() {
  const { theme: T } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { room } = route.params;
  const user = useAuthStore(state => state.user);
  const socket = useSocket();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef();

  useEffect(() => {
    fetchHistory();
  }, [room._id]);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_group_message', handleIncomingMessage);
    return () => {
      socket.off('new_group_message', handleIncomingMessage);
    };
  }, [socket, room._id]);

  const fetchHistory = async () => {
    try {
      const res = await apiClient.get(`/chat/coordination/${room._id}/messages`);
      setMessages(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 100);
    }
  };

  const handleIncomingMessage = (payload) => {
    if (payload.roomId === room._id) {
      setMessages(prev => [...prev, payload.message]);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    const msgText = inputText.trim();
    setInputText('');

    // Optimistic UI update
    const tempId = Date.now().toString();
    const newMsg = {
      _id: tempId,
      senderId: { _id: user.userId, name: user.name, role: user.role },
      message: msgText,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMsg]);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const res = await apiClient.post(`/chat/coordination/${room._id}/messages`, { message: msgText });
      setMessages(prev => prev.map(m => m._id === tempId ? res.data.data : m));
    } catch (err) {
      console.error('Failed to send:', err);
      // Remove failed message
      setMessages(prev => prev.filter(m => m._id !== tempId));
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: T.bg }}>
      {/* Header */}
      <View style={{ backgroundColor: T.card, borderBottomColor: T.border, borderBottomWidth: 1 }} className="px-4 pt-12 pb-4 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color={T.text} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text style={{ color: T.text }} className="text-lg font-bold" numberOfLines={1}>{room.name}</Text>
          <Text style={{ color: T.muted }} className="text-xs">{room.members?.length} Members</Text>
        </View>
      </View>

      {/* Messages */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color={T.accent} size="large" />
        </View>
      ) : (
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 p-4"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 10 }}
        >
          {messages.map((msg, index) => {
            const isMe = msg.senderId?._id === user.userId;
            const showName = !isMe && (index === 0 || messages[index - 1].senderId?._id !== msg.senderId?._id);

            return (
              <View key={msg._id || index} className={`mb-3 max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
                {showName && (
                  <Text style={{ color: T.muted }} className="text-xs ml-1 mb-1 font-bold">{msg.senderId?.name}</Text>
                )}
                <View style={{ backgroundColor: isMe ? T.accent : T.card, borderColor: isMe ? T.accent : T.border }} className={`px-4 py-3 rounded-2xl ${isMe ? 'rounded-tr-sm' : 'border rounded-tl-sm'}`}>
                  <Text style={{ color: isMe ? '#ffffff' : T.text }} className="text-base">{msg.message}</Text>
                </View>
                <Text style={{ color: T.muted }} className={`text-[10px] mt-1 mx-1 ${isMe ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Input */}
      <View style={{ backgroundColor: T.card, borderTopColor: T.border, borderTopWidth: 1 }} className="p-4 flex-row items-center">
        <TextInput
          style={{ backgroundColor: T.bg, color: T.text, borderColor: T.border }}
          className="flex-1 p-3 px-4 rounded-full border mr-3"
          placeholder="Type a message..."
          placeholderTextColor={T.muted}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity 
          onPress={sendMessage}
          disabled={!inputText.trim()}
          style={{ backgroundColor: inputText.trim() ? T.accent : T.bg, borderColor: inputText.trim() ? T.accent : T.border }}
          className="w-12 h-12 rounded-full border items-center justify-center"
        >
          <Ionicons name="send" size={20} color={inputText.trim() ? "#ffffff" : T.muted} style={inputText.trim() ? { marginLeft: 4 } : {}} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
