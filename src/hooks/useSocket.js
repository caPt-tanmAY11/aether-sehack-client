import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/auth.store';
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
        : 'http://10.10.120.239:4000';
        
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
        // Here we could update a global notifications store
        // For now, just show an in-app alert/toast if it's high priority
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
