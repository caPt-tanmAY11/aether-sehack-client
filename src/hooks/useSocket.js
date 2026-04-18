import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/auth.store';
import { useNotificationsStore } from '../store/notifications.store';
import { Alert } from 'react-native';

export function useSocket() {
  const socketRef = useRef(null);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);
  const accessToken = useAuthStore(state => state.accessToken);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL 
        ? process.env.EXPO_PUBLIC_API_URL.replace('/api', '') 
        : 'http://10.10.120.29:4000';
        
      socketRef.current = io(baseUrl, {
        auth: { token: accessToken }
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected:', socketRef.current.id);
        if (user?._id) {
          socketRef.current.emit('joinRoom', user._id);
        }
      });

      socketRef.current.on('notification', (data) => {
        // Update global store
        useNotificationsStore.getState().prependNotification({
          _id: Math.random().toString(), // temp id until refreshed
          message: data.message,
          type: data.type,
          read: false,
          createdAt: new Date().toISOString()
        });
        Alert.alert('New Notification', data.message || 'You have a new update.');
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [isAuthenticated, accessToken, user]);

  return socketRef.current;
}
