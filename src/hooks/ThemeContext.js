import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@aether_theme';

export const LIGHT = {
  mode: 'light',
  bg: '#f7f9fb',
  card: '#ffffff',
  cardAlt: '#f0f2f5',
  text: '#091426',
  textSub: '#45474c',
  muted: '#8590a6',
  border: '#eceef0',
  borderLight: '#f2f4f6',
  accent: '#6b38d4',
  accentSoft: '#e9ddff',
  accentText: '#6b38d4',
  headerBg: '#ffffff',
  headerBorder: '#eceef0',
  iconBg: '#f2f4f6',
  dockBg: '#ffffff',
  dockShadow: '#091426',
  dockActive: '#091426',
  dockActiveText: '#ffffff',
  dockInactive: '#94a3b8',
  panelBg: '#ffffff',
  panelText: '#091426',
  panelSubText: '#45474c',
  panelBorder: '#f0f2f5',
  panelIconBg: '#f0ecff',
  panelIconColor: '#6b38d4',
  heroCardBg: '#091426',
  heroCardText: '#ffffff',
  heroCardMuted: 'rgba(188,199,222,0.75)',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ba1a1a',
  errorSoft: '#ffdad6',
};

export const DARK = {
  mode: 'dark',
  bg: '#0b1120',
  card: '#131f35',
  cardAlt: '#0f1828',
  text: '#e8edf5',
  textSub: '#8599b8',
  muted: '#5a6e8a',
  border: '#1e2d45',
  borderLight: '#182438',
  accent: '#7c58e8',
  accentSoft: 'rgba(124,88,232,0.18)',
  accentText: '#a78bfa',
  headerBg: '#0d1829',
  headerBorder: '#1e2d45',
  iconBg: '#1a2840',
  dockBg: '#131f35',
  dockShadow: '#000000',
  dockActive: '#7c58e8',
  dockActiveText: '#ffffff',
  dockInactive: '#4a607a',
  panelBg: '#131f35',
  panelText: '#e8edf5',
  panelSubText: '#8599b8',
  panelBorder: 'rgba(255,255,255,0.06)',
  panelIconBg: 'rgba(124,88,232,0.2)',
  panelIconColor: '#a78bfa',
  heroCardBg: '#6b38d4',
  heroCardText: '#ffffff',
  heroCardMuted: 'rgba(255,255,255,0.6)',
  success: '#4ade80',
  warning: '#fbbf24',
  error: '#f87171',
  errorSoft: 'rgba(248,113,113,0.15)',
};

const ThemeCtx = createContext({ theme: LIGHT, isDark: false, toggle: () => {} });

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(val => {
      if (val === 'dark') setIsDark(true);
      setReady(true);
    }).catch(() => setReady(true));
  }, []);

  const toggle = () => {
    setIsDark(prev => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light').catch(() => {});
      return next;
    });
  };

  if (!ready) return null;

  return (
    <ThemeCtx.Provider value={{ theme: isDark ? DARK : LIGHT, isDark, toggle }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);
