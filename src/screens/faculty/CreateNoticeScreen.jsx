import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { noticesApi } from '../../api/notices.api';
import { Ionicons } from '@expo/vector-icons';

export default function CreateNoticeScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await noticesApi.publish({
        title,
        body
      });
      Alert.alert('Success', 'Notice published successfully!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || err.message || 'Failed to publish notice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-surface px-4 py-6">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Publish Notice</Text>
      </View>

      <View className="bg-card p-4 rounded-2xl border border-border mb-4">
        <Text className="text-muted text-sm font-bold mb-2">Title</Text>
        <TextInput
          className="bg-surface text-white p-3 rounded-xl border border-border mb-4"
          placeholder="Notice title..."
          placeholderTextColor="#64748b"
          value={title}
          onChangeText={setTitle}
        />

        <Text className="text-muted text-sm font-bold mb-2">Message Body</Text>
        <TextInput
          className="bg-surface text-white p-3 rounded-xl border border-border mb-6 h-32"
          placeholder="Details..."
          placeholderTextColor="#64748b"
          value={body}
          onChangeText={setBody}
          multiline
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity 
        onPress={handleSubmit}
        disabled={loading}
        className="bg-primary p-4 rounded-xl flex-row justify-center items-center mb-8"
      >
        {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Publish</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}
