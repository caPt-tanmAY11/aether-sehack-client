import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/auth.store';
import { useNotificationsStore } from '../store/notifications.store';
import { Alert } from 'react-native';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);
  const accessToken = useAuthStore(state => state.accessToken);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL 
        ? process.env.EXPO_PUBLIC_API_URL.replace('/api', '') 
        : 'http://10.10.120.29:4000'; // Final Fallback
        
      const newSocket = io(baseUrl, {
        auth: { token: accessToken },
        transports: ['websocket'], // Force websocket for better performance
      });

      newSocket.on('connect', () => {
        console.log('[Socket] Connected:', newSocket.id);
        if (user?._id) {
          newSocket.emit('joinRoom', user._id);
        }
      });

      newSocket.on('notification:new', (data) => {
        useNotificationsStore.getState().prependNotification({
          _id: data.id || `tmp_${Date.now()}`,
          title: data.title,
          body: data.body,
          type: data.type,
          read: false,
          createdAt: data.createdAt || new Date().toISOString(),
        });
        Alert.alert('New Notification', data.title || data.body);
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [isAuthenticated, accessToken, user]);

  // Register device push token for FCM (offline push notifications)
  useEffect(() => {
    if (!isAuthenticated) return;
    registerPushToken();
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

async function registerPushToken() {
  try {
    const Device = await import('expo-device');
    const Notifications = await import('expo-notifications');
    const { authApi } = await import('../api/auth.api');

    // Push notifications only work on physical devices
    if (!Device.default.isDevice) {
      console.log('[FCM] Push notifications require a physical device');
      return;
    }

    // Request permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('[FCM] Push notification permission denied');
      return;
    }

    // Get the Expo push token (works for FCM on Android)
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const pushToken = tokenData.data;
    console.log('[FCM] Push token obtained:', pushToken);

    // Register it with the backend
    await authApi.registerPushToken(pushToken);
    console.log('[FCM] Push token registered with server');
  } catch (err) {
    console.error('[FCM] Error registering push token:', err.message);
  }
}
