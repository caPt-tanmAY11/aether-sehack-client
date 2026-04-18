import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { chatApi } from '../../api/chat.api';
import { useAuthStore } from '../../store/auth.store';

export default function FacultyChatScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { studentId, studentName } = route.params;
  const user = useAuthStore(state => state.user);
  const scrollRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const myId = user._id || user.userId;
  const roomId = chatApi.buildRoomId(studentId, myId);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await chatApi.getHistory(roomId);
      setMessages(data);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    const msgText = text.trim();
    setText('');
    setSending(true);
    try {
      const sent = await chatApi.sendMessage(roomId, msgText);
      setMessages(prev => [...prev, sent]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      {/* Header */}
      <View className="px-4 pt-12 pb-4 bg-card border-b border-border flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-2 bg-surface rounded-full">
          <Ionicons name="arrow-back" size={22} color="#f1f5f9" />
        </TouchableOpacity>
        <View className="w-10 h-10 rounded-full bg-success/20 items-center justify-center mr-3">
          <Ionicons name="person" size={20} color="#22c55e" />
        </View>
        <View>
          <Text className="text-white font-bold">{studentName}</Text>
          <Text className="text-muted text-xs">Student</Text>
        </View>
      </View>

      {/* Messages */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#6366f1" size="large" />
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4 py-3"
          contentContainerStyle={{ paddingBottom: 8 }}
        >
          {messages.length === 0 && (
            <Text className="text-muted text-center mt-10 text-sm">No messages yet.</Text>
          )}
          {messages.map((msg, i) => {
            const isMe = msg.senderId?._id === myId || msg.senderId === myId;
            return (
              <View key={i} className={`mb-3 max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
                <View className={`px-4 py-3 rounded-2xl ${isMe ? 'bg-primary rounded-tr-sm' : 'bg-card border border-border rounded-tl-sm'}`}>
                  <Text className={`${isMe ? 'text-white' : 'text-slate-200'} text-sm leading-5`}>{msg.message}</Text>
                </View>
                <Text className={`text-muted text-xs mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Input */}
      <View className="flex-row items-center px-4 py-3 bg-card border-t border-border">
        <TextInput
          className="flex-1 bg-surface text-white px-4 py-3 rounded-xl border border-border text-sm"
          placeholder="Type a message..."
          placeholderTextColor="#64748b"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={sending || !text.trim()}
          className={`ml-3 w-11 h-11 rounded-full items-center justify-center ${text.trim() ? 'bg-primary' : 'bg-surface border border-border'}`}
        >
          {sending ? <ActivityIndicator color="white" size="small" /> : <Ionicons name="send" size={18} color={text.trim() ? 'white' : '#64748b'} />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
