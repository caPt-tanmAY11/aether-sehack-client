import { apiClient } from './client';

export const clubsApi = {
  // All authenticated users: list all clubs
  listClubs: async () => {
    const res = await apiClient.get('/clubs');
    return res.data.data;
  },

  // Get clubs I'm a member of
  getMyClubs: async () => {
    const res = await apiClient.get('/clubs/my');
    return res.data.data;
  },

  // Get a single club by ID
  getClub: async (id) => {
    const res = await apiClient.get(`/clubs/${id}`);
    return res.data.data;
  },

  // Council/Faculty: create a new club
  createClub: async ({ name, description, type, advisorId }) => {
    const res = await apiClient.post('/clubs', { name, description, type, advisorId });
    return res.data.data;
  },

  // Student/Council: join a club
  joinClub: async (id) => {
    const res = await apiClient.post(`/clubs/${id}/join`);
    return res.data.data;
  },

  // Any member: leave a club
  leaveClub: async (id) => {
    const res = await apiClient.post(`/clubs/${id}/leave`);
    return res.data.data;
  },

  // President/Advisor: send a broadcast alert to all club members
  sendAlert: async (id, message) => {
    const res = await apiClient.post(`/clubs/${id}/alert`, { message });
    return res.data.data;
  },
};
