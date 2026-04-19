import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { noticesApi } from '../../api/notices.api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/ThemeContext';
import AppHeader from '../../components/AppHeader';

export default function CreateNoticeScreen() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { theme: T } = useTheme();

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Incomplete', 'Please fill out both title and message.');
      return;
    }

    try {
      setLoading(true);
      await noticesApi.publish({
        title: title.trim(),
        body: body.trim()
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
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="Publish Notice" showBack />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        
        {/* Helper Banner */}
        <View style={[s.infoBanner, { backgroundColor: `${T.accent}12`, borderColor: `${T.accent}30` }]}>
          <View style={[s.infoBannerIcon, { backgroundColor: `${T.accent}20` }]}>
            <Ionicons name="megaphone-outline" size={22} color={T.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: T.text, fontWeight: '800', fontSize: 14 }}>Broadcast Campus News</Text>
            <Text style={{ color: T.muted, fontSize: 12, marginTop: 2 }}>
              Publishing a notice will make it instantly available to all relevant students and faculty on the dashboard.
            </Text>
          </View>
        </View>

        {/* Input Form */}
        <View style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
          <Text style={[s.label, { color: T.muted }]}>Notice Title</Text>
          <TextInput
            style={[s.input, { backgroundColor: T.bg, color: T.text, borderColor: T.border }]}
            placeholder="E.g., Exam Schedule Update..."
            placeholderTextColor={T.muted}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={[s.label, { color: T.muted }]}>Message Body</Text>
          <TextInput
            style={[s.textArea, { backgroundColor: T.bg, color: T.text, borderColor: T.border }]}
            placeholder="Enter the details of your notice here..."
            placeholderTextColor={T.muted}
            value={body}
            onChangeText={setBody}
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={loading}
            style={[s.publishBtn, { backgroundColor: T.accent, opacity: loading ? 0.7 : 1 }]}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="paper-plane-outline" size={18} color="#fff" />
                <Text style={s.publishBtnText}>Publish Now</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 20,
  },
  infoBannerIcon: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  card: {
    borderRadius: 20, borderWidth: 1, padding: 18, marginBottom: 24,
  },
  label: { 
    fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8,
  },
  input: {
    borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 15, marginBottom: 20,
  },
  textArea: {
    borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 15, minHeight: 120, marginBottom: 20,
  },
  publishBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 15, borderRadius: 14,
  },
  publishBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
