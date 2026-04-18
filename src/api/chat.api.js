import { apiClient } from './client';

export const chatApi = {
  buildRoomId: (idA, idB) => [idA, idB].sort().join('_'),

  getHistory: async (roomId) => {
    const res = await apiClient.get(`/chat/${roomId}`);
    return res.data.data;
  },

  sendMessage: async (roomId, message) => {
    const res = await apiClient.post(`/chat/${roomId}`, { message });
    return res.data.data;
  },

  getInbox: async () => {
    const res = await apiClient.get('/chat/inbox');
    return res.data.data;
  },

  canChat: async (facultyId) => {
    const res = await apiClient.get(`/chat/can-chat/${facultyId}`);
    return res.data.data?.allowed || false;
  },
};
