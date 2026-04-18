import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function MiniAppShellScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { slug, name, appUrl, token } = route.params || {};

  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);

  // Inject the Aether token into the URL as a query param
  const launchUrl = token
    ? `${appUrl}${appUrl.includes('?') ? '&' : '?'}aetherToken=${token}`
    : appUrl;

  const handleBack = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View className="flex-1 bg-surface">
      {/* Top bar */}
      <View className="flex-row items-center px-4 pt-12 pb-3 bg-card border-b border-border">
        <TouchableOpacity onPress={handleBack} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white font-bold text-base" numberOfLines={1}>{name || slug}</Text>
          <Text className="text-muted text-xs" numberOfLines={1}>Secured by Aether</Text>
        </View>
        {/* Refresh button */}
        <TouchableOpacity
          onPress={() => webViewRef.current?.reload()}
          className="p-2"
        >
          <Ionicons name="refresh" size={20} color="#64748b" />
        </TouchableOpacity>
        {/* Close (always goes back to Aether) */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 ml-1"
        >
          <Ionicons name="close" size={22} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* Token expiry warning banner */}
      <View className="bg-primary/10 px-4 py-1.5 border-b border-primary/20 flex-row items-center">
        <Ionicons name="lock-closed" size={12} color="#6366f1" />
        <Text className="text-primary text-xs ml-1.5 flex-1">
          Session secured — token expires in 15 minutes
        </Text>
      </View>

      {/* WebView */}
      {error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="wifi-outline" size={56} color="#334155" />
          <Text className="text-white font-bold text-lg mt-4 mb-2">Failed to Load</Text>
          <Text className="text-muted text-center text-sm mb-6">
            The mini-app could not be reached. Check your connection or try again.
          </Text>
          <TouchableOpacity
            onPress={() => { setError(false); webViewRef.current?.reload(); }}
            className="bg-primary px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-bold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-1">
          <WebView
            ref={webViewRef}
            source={{ uri: launchUrl }}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={() => { setError(true); setLoading(false); }}
            onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            renderLoading={() => (
              <View className="absolute inset-0 items-center justify-center bg-surface">
                <ActivityIndicator color="#6366f1" size="large" />
                <Text className="text-muted mt-3 text-sm">Launching {name}...</Text>
              </View>
            )}
          />
          {/* Loading overlay when navigating within the app */}
          {loading && (
            <View className="absolute top-0 left-0 right-0 h-1 bg-primary/30">
              <View className="h-full bg-primary w-1/2" />
            </View>
          )}
        </View>
      )}
    </View>
  );
}
