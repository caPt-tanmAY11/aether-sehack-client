import { apiClient } from './client';

export const eventsApi = {
  getApprovedEvents: async () => {
    // A student only sees approved events
    const res = await apiClient.get('/events?status=approved');
    return res.data.data;
  },
  
  getApprovedEvents: async () => {
    const res = await apiClient.get('/events');
    return res.data.data;
  },

  createEvent: async (eventData) => {
    const res = await apiClient.post('/events', eventData);
    return res.data.data;
  },

  getPending: async () => {
    const res = await apiClient.get('/events/pending');
    return res.data.data;
  },

  review: async (id, status, comment) => {
    const res = await apiClient.patch(`/events/${id}/review`, { status, comment });
    return res.data.data;
  },

  getMyRequests: async () => {
    const res = await apiClient.get('/events/me');
    return res.data.data;
  }
};
