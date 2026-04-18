import { apiClient } from './client';

export const notificationsApi = {
  getAll: async () => {
    const res = await apiClient.get('/notifications');
    return res.data.data;
  },

  getUnread: async () => {
    const res = await apiClient.get('/notifications/unread');
    return res.data.data; // { count, items }
  },

  markRead: async (id) => {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return res.data.data;
  },

  markAllRead: async () => {
    const res = await apiClient.patch('/notifications/read-all');
    return res.data.data;
  },
};
