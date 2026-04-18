import { apiClient } from './client';

export const chatbotApi = {
  // POST /chatbot/message — send a query to Aether AI
  chat: async (query) => {
    const res = await apiClient.post('/chatbot/message', { query });
    return res.data.data; // { message, classification }
  },

  // GET /chatbot/history — fetch previous conversation logs
  getHistory: async () => {
    const res = await apiClient.get('/chatbot/history');
    return res.data.data; // array of ChatbotLog entries
  },
};
