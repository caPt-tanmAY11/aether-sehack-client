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

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
