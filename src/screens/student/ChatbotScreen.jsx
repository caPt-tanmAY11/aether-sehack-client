import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatbotApi } from '../../api/chatbot.api';

export default function ChatbotScreen({ navigation }) {
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
      const botMessage = { 
        role: 'assistant', 
        content: response.response, 
        classification: response.classification,
        uiAction: response.uiAction 
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting to the server right now.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface"
      keyboardVerticalOffset={90}
    >
      <View className="flex-row items-center p-4 border-b border-border bg-card">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
        </TouchableOpacity>
        <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-3 border border-primary/50">
          <Ionicons name="planet" size={20} color="#6366f1" />
        </View>
        <View>
          <Text className="text-white font-bold text-lg">Aether AI</Text>
          <Text className="text-success text-xs font-bold">● Online</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1 p-4"
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg, i) => (
          <View key={i} className={`mb-4 max-w-[85%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}>
            {msg.classification && msg.role === 'assistant' && (
              <Text className="text-xs text-muted mb-1 ml-1 capitalize">{msg.classification} Agent</Text>
            )}
            <View className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-primary rounded-tr-sm' : 'bg-card border border-border rounded-tl-sm'}`}>
              <Text className="text-white text-base leading-6">{msg.content}</Text>
              
              {/* Interactive AI Action Button */}
              {msg.uiAction && (
                <TouchableOpacity 
                  onPress={() => {
                    if (msg.uiAction.type === 'navigate') {
                      navigation.navigate(msg.uiAction.screen, msg.uiAction.params);
                    }
                  }}
                  className="mt-4 bg-primary/20 border border-primary p-3 px-4 rounded-xl flex-row items-center justify-between"
                >
                  <Text className="text-primary font-bold">{msg.uiAction.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#6366f1" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
        {loading && (
          <View className="self-start max-w-[80%] bg-card border border-border p-4 rounded-2xl rounded-tl-sm">
            <ActivityIndicator color="#6366f1" size="small" />
          </View>
        )}
        <View className="h-4" />
      </ScrollView>

      <View className="p-4 bg-card border-t border-border flex-row items-center">
        <TextInput
          className="flex-1 bg-surface text-white p-3 px-5 rounded-full border border-border mr-2"
          placeholder="Ask me anything..."
          placeholderTextColor="#64748b"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity 
          onPress={handleSend}
          disabled={loading || !input.trim()}
          className={`w-12 h-12 rounded-full items-center justify-center ${input.trim() ? 'bg-primary' : 'bg-surface border border-border'}`}
        >
          <Ionicons name="send" size={20} color={input.trim() ? "white" : "#64748b"} className="ml-1" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
