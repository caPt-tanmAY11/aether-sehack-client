import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatbotApi } from '../../api/chatbot.api';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/ThemeContext';

export default function ChatbotScreen() {
  const navigation = useNavigation();
  const { theme: T } = useTheme();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am Aether AI. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef();

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await chatbotApi.getHistory();
        if (history && history.length > 0) {
          const formatted = [];
          history.forEach(log => {
            formatted.push({ role: 'user', content: log.query });
            formatted.push({ role: 'assistant', content: log.response, classification: log.classification });
          });
          setMessages(formatted);
        }
      } catch (err) {
        console.error('Failed to load chat history', err);
      }
    };
    loadHistory();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const response = await chatbotApi.chat(userMessage.content);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.response,
        classification: response.classification,
        uiAction: response.uiAction,
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting to the server right now.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: T.bg }}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[s.header, { backgroundColor: T.card, borderBottomColor: T.border }]}>
        <View style={{ paddingTop: 52, paddingBottom: 14, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[s.backBtn, { backgroundColor: T.iconBg }]} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={20} color={T.text} />
          </TouchableOpacity>
          <View style={[s.aiAvatar, { backgroundColor: `${T.accent}22`, borderColor: `${T.accent}50` }]}>
            <Ionicons name="planet" size={20} color={T.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: T.text, fontWeight: '900', fontSize: 17, letterSpacing: -0.3 }}>Aether AI</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: T.success }} />
              <Text style={{ color: T.success, fontSize: 11, fontWeight: '700' }}>Online · Campus AI</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          return (
            <View key={i} style={[s.msgWrap, isUser ? s.msgRight : s.msgLeft]}>
              {msg.classification && !isUser && (
                <Text style={{ fontSize: 10, color: T.muted, marginBottom: 4, marginLeft: 4, fontWeight: '700', textTransform: 'capitalize' }}>
                  {msg.classification} Agent
                </Text>
              )}
              <View style={[
                s.bubble,
                isUser
                  ? { backgroundColor: T.accent, borderBottomRightRadius: 4 }
                  : { backgroundColor: T.card, borderColor: T.border, borderWidth: 1, borderBottomLeftRadius: 4 },
              ]}>
                <Text style={{ color: isUser ? '#ffffff' : T.text, fontSize: 15, lineHeight: 22 }}>
                  {msg.content}
                </Text>
                {msg.uiAction && (
                  <TouchableOpacity
                    onPress={() => {
                      if (msg.uiAction.type === 'navigate') {
                        navigation.navigate(msg.uiAction.screen, msg.uiAction.params);
                      }
                    }}
                    style={[s.actionBtn, { backgroundColor: `${T.accent}20`, borderColor: `${T.accent}60` }]}
                  >
                    <Text style={{ color: T.accent, fontWeight: '800', fontSize: 13 }}>{msg.uiAction.label}</Text>
                    <Ionicons name="chevron-forward" size={14} color={T.accent} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
        {loading && (
          <View style={[s.bubble, { backgroundColor: T.card, borderColor: T.border, borderWidth: 1, alignSelf: 'flex-start', paddingVertical: 14 }]}>
            <ActivityIndicator color={T.accent} size="small" />
          </View>
        )}
        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Input bar */}
      <View style={[s.inputBar, { backgroundColor: T.card, borderTopColor: T.border }]}>
        <TextInput
          style={[s.textInput, { backgroundColor: T.bg, color: T.text, borderColor: T.border }]}
          placeholder="Ask me anything about campus..."
          placeholderTextColor={T.muted}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          multiline
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={loading || !input.trim()}
          style={[s.sendBtn, { backgroundColor: input.trim() ? T.accent : T.iconBg }]}
          activeOpacity={0.8}
        >
          <Ionicons name="send" size={18} color={input.trim() ? '#ffffff' : T.muted} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  header: { borderBottomWidth: StyleSheet.hairlineWidth, elevation: 4 },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  aiAvatar: {
    width: 42, height: 42, borderRadius: 21, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  msgWrap: { marginBottom: 12, maxWidth: '85%' },
  msgLeft:  { alignSelf: 'flex-start' },
  msgRight: { alignSelf: 'flex-end' },
  bubble: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18,
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 12, borderRadius: 12, borderWidth: 1, padding: 12,
  },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    padding: 12, borderTopWidth: StyleSheet.hairlineWidth, gap: 10,
  },
  textInput: {
    flex: 1, borderRadius: 24, borderWidth: 1,
    paddingHorizontal: 18, paddingVertical: 10,
    fontSize: 15, maxHeight: 120,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
});
