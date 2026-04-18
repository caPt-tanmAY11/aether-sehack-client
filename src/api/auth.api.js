import { apiClient } from './client';

export const authApi = {
  login: async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data.data; // returns { user, accessToken, refreshToken }
  },
  
  getProfile: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data.data;
  },

  registerPushToken: async (token) => {
    const res = await apiClient.post('/auth/push-token', { token });
    return res.data;
  }
};
