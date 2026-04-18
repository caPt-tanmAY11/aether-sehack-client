import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { authApi } from '../../api/auth.api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const login = useAuthStore(state => state.login);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await authApi.login(email.toLowerCase().trim(), password);
      login(data.user, data.accessToken, data.refreshToken);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials or server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface justify-center px-8"
    >
      <View className="mb-10 items-center">
        <Text className="text-4xl font-bold text-primary mb-2 tracking-widest">AETHER</Text>
        <Text className="text-muted text-base">Campus Operating System</Text>
      </View>

      <View className="bg-card p-6 rounded-2xl border border-border">
        <Text className="text-white text-2xl font-bold mb-6">Sign In</Text>
        
        {error && (
          <View className="bg-error/20 p-3 rounded-lg mb-4 border border-error/50">
            <Text className="text-error text-center">{error}</Text>
          </View>
        )}

        <View className="mb-4">
          <Text className="text-muted text-sm font-semibold mb-2 ml-1">College Email</Text>
          <TextInput
            className="w-full bg-surface text-white p-4 rounded-xl border border-border focus:border-primary"
            placeholder="student@spit.ac.in"
            placeholderTextColor="#64748b"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View className="mb-8">
          <Text className="text-muted text-sm font-semibold mb-2 ml-1">Password</Text>
          <TextInput
            className="w-full bg-surface text-white p-4 rounded-xl border border-border focus:border-primary"
            placeholder="••••••••"
            placeholderTextColor="#64748b"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          className={`w-full p-4 rounded-xl flex-row justify-center items-center ${loading ? 'bg-primary/70' : 'bg-primary'}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-lg font-bold">Authenticate</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
