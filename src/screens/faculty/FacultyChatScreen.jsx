import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { chatApi } from '../../api/chat.api';
import { useAuthStore } from '../../store/auth.store';
import { useTheme } from '../../hooks/ThemeContext';

export default function FacultyChatScreen() {
  const { theme: T } = useTheme();
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
      style={{ flex: 1, backgroundColor: T.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      {/* Header */}
      <View style={{ backgroundColor: T.card, borderBottomColor: T.border, borderBottomWidth: 1 }} className="px-4 pt-12 pb-4 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ backgroundColor: T.bg }} className="mr-3 p-2 rounded-full">
          <Ionicons name="arrow-back" size={22} color={T.text} />
        </TouchableOpacity>
        <View style={{ backgroundColor: `${T.success}20` }} className="w-10 h-10 rounded-full items-center justify-center mr-3">
          <Ionicons name="person" size={20} color={T.success} />
        </View>
        <View>
          <Text style={{ color: T.text }} className="font-bold">{studentName}</Text>
          <Text style={{ color: T.muted }} className="text-xs">Student</Text>
        </View>
      </View>

      {/* Messages */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color={T.accent} size="large" />
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4 py-3"
          contentContainerStyle={{ paddingBottom: 8 }}
        >
          {messages.length === 0 && (
            <Text style={{ color: T.muted }} className="text-center mt-10 text-sm">No messages yet.</Text>
          )}
          {messages.map((msg, i) => {
            const isMe = msg.senderId?._id === myId || msg.senderId === myId;
            return (
              <View key={i} className={`mb-3 max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
                <View style={{ backgroundColor: isMe ? T.accent : T.card, borderColor: isMe ? T.accent : T.border }} className={`px-4 py-3 rounded-2xl border ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                  <Text style={{ color: isMe ? '#ffffff' : T.text }} className="text-sm leading-5">{msg.message}</Text>
                </View>
                <Text style={{ color: T.muted }} className={`text-xs mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Input */}
      <View style={{ backgroundColor: T.card, borderTopColor: T.border, borderTopWidth: 1 }} className="flex-row items-center px-4 py-3">
        <TextInput
          style={{ backgroundColor: T.bg, color: T.text, borderColor: T.border }}
          className="flex-1 px-4 py-3 rounded-xl border text-sm"
          placeholder="Type a message..."
          placeholderTextColor={T.muted}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={sending || !text.trim()}
          style={{ backgroundColor: text.trim() ? T.accent : T.bg, borderColor: text.trim() ? T.accent : T.border }}
          className="ml-3 w-11 h-11 rounded-full border items-center justify-center"
        >
          {sending ? <ActivityIndicator color="#ffffff" size="small" /> : <Ionicons name="send" size={18} color={text.trim() ? '#ffffff' : T.muted} />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
