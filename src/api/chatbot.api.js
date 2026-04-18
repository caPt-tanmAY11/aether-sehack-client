import { apiClient } from './client';

export const chatbotApi = {
  chat: async (query) => {
    const res = await apiClient.post('/chat', { query });
    return res.data.data;
  }
};
