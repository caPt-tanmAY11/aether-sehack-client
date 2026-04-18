import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/auth.store';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://10.10.120.29:4000/api',
  timeout: 10000,
});

apiClient.interceptors.request.use(
  async (config) => {
    const tokensStr = await AsyncStorage.getItem('auth-storage');
    if (tokensStr) {
      const auth = JSON.parse(tokensStr);
      if (auth.state && auth.state.accessToken) {
        config.headers.Authorization = `Bearer ${auth.state.accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokensStr = await AsyncStorage.getItem('auth-storage');
        const auth = JSON.parse(tokensStr);
        const refreshToken = auth?.state?.refreshToken;

        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, {
          token: refreshToken
        });

        const newAccessToken = data.data.accessToken;
        const newRefreshToken = data.data.refreshToken;

        useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);
        
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
