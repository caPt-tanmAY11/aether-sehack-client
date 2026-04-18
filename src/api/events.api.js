import { apiClient } from './client';

export const eventsApi = {
  // Student: get all approved events (for browsing)
  getApprovedEvents: async () => {
    const res = await apiClient.get('/events');
    return res.data.data;
  },

  // Student (committee): submit a new event request
  createEvent: async (eventData) => {
    const res = await apiClient.post('/events', eventData);
    return res.data.data;
  },

  // Admin roles: get pending events awaiting review
  getPending: async () => {
    const res = await apiClient.get('/events/pending');
    return res.data.data;
  },

  // Admin roles: approve or reject an event
  review: async (id, status, comment) => {
    const res = await apiClient.patch(`/events/${id}/review`, { status, comment });
    return res.data.data;
  },

  // Student (committee): get my submitted event requests
  getMyRequests: async () => {
    const res = await apiClient.get('/events/me');
    return res.data.data;
  },
};
