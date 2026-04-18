import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { pluginsApi } from '../../api/plugins.api';

export default function MiniAppDeveloperPortalScreen() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    appUrl: '',
    requiresScopes: 'profile.read'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug || !formData.appUrl || !formData.description) {
      return Alert.alert('Error', 'Please fill all fields');
    }

    try {
      setSubmitting(true);
      // Clean up inputs
      const payload = {
        ...formData,
        slug: formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        requiresScopes: formData.requiresScopes.split(',').map(s => s.trim()),
        allowedRoles: ['student', 'faculty', 'council', 'hod'] // default
      };

      await pluginsApi.registerPlugin(payload);
      Alert.alert('Success', 'Mini-App published to the marketplace instantly!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Submission Failed', err?.response?.data?.message || 'Could not register plugin');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-surface px-4 py-8">
      <View className="mb-8 mt-4">
        <Text className="text-white text-3xl font-bold">Developer Portal</Text>
        <Text className="text-muted mt-2">Publish your web app to the Aether ecosystem.</Text>
      </View>

      <View className="bg-card p-4 rounded-2xl border border-border mb-6">
        <Text className="text-white font-bold mb-1">App Name</Text>
        <TextInput
          className="bg-surface text-white p-3 rounded-xl border border-border mb-4"
          placeholder="e.g. Lost and Found"
          placeholderTextColor="#64748b"
          value={formData.name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
        />

        <Text className="text-white font-bold mb-1">App Slug</Text>
        <Text className="text-muted text-xs mb-2">Unique identifier (lowercase, hyphens)</Text>
        <TextInput
          className="bg-surface text-white p-3 rounded-xl border border-border mb-4"
          placeholder="e.g. lost-and-found"
          placeholderTextColor="#64748b"
          autoCapitalize="none"
          value={formData.slug}
          onChangeText={(text) => setFormData(prev => ({ ...prev, slug: text }))}
        />

        <Text className="text-white font-bold mb-1">Entry URL</Text>
        <Text className="text-muted text-xs mb-2">The web address of your hosted app</Text>
        <TextInput
          className="bg-surface text-white p-3 rounded-xl border border-border mb-4"
          placeholder="https://my-app.vercel.app"
          placeholderTextColor="#64748b"
          autoCapitalize="none"
          keyboardType="url"
          value={formData.appUrl}
          onChangeText={(text) => setFormData(prev => ({ ...prev, appUrl: text }))}
        />

        <Text className="text-white font-bold mb-1">Description</Text>
        <TextInput
          className="bg-surface text-white p-3 rounded-xl border border-border mb-4"
          placeholder="What does your app do?"
          placeholderTextColor="#64748b"
          multiline
          numberOfLines={3}
          style={{ textAlignVertical: 'top' }}
          value={formData.description}
          onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
        />

        <Text className="text-white font-bold mb-1">Required Scopes</Text>
        <Text className="text-muted text-xs mb-2">Comma separated (e.g. profile.read, notifications.write)</Text>
        <TextInput
          className="bg-surface text-white p-3 rounded-xl border border-border mb-6"
          placeholder="profile.read"
          placeholderTextColor="#64748b"
          autoCapitalize="none"
          value={formData.requiresScopes}
          onChangeText={(text) => setFormData(prev => ({ ...prev, requiresScopes: text }))}
        />

        <TouchableOpacity 
          onPress={handleSubmit} 
          disabled={submitting}
          className="bg-primary p-4 rounded-xl items-center flex-row justify-center"
        >
          <Ionicons name="rocket" size={20} color="white" className="mr-2" />
          <Text className="text-white font-bold ml-2">
            {submitting ? 'Publishing...' : 'Publish to Ecosystem'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
