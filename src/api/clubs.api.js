import { apiClient } from './client';

export const clubsApi = {
  listClubs: async () => {
    const res = await apiClient.get('/clubs');
    return res.data.data;
  },

  getMyClubs: async () => {
    const res = await apiClient.get('/clubs/my');
    return res.data.data;
  },

  getClub: async (id) => {
    const res = await apiClient.get(`/clubs/${id}`);
    return res.data.data;
  },

  // Council/Faculty: create a new club
  createClub: async ({ name, description, category, facultyAdvisorId }) => {
    const res = await apiClient.post('/clubs', { name, description, category, facultyAdvisorId });
    return res.data.data;
  },

  // Student: submit a join request (requires president approval)
  requestJoinClub: async (id, message = '') => {
    const res = await apiClient.post(`/clubs/${id}/request-join`, { message });
    return res.data.data;
  },

  // President/Advisor: approve or reject a join request
  reviewJoinRequest: async (clubId, requestId, decision) => {
    const res = await apiClient.patch(`/clubs/${clubId}/join-requests/${requestId}/review`, { decision });
    return res.data.data;
  },

  // President/Advisor: get all pending join requests across clubs they manage
  getPendingRequests: async () => {
    const res = await apiClient.get('/clubs/pending-requests');
    return res.data.data;
  },

  // Any member: leave a club
  leaveClub: async (id) => {
    const res = await apiClient.post(`/clubs/${id}/leave`);
    return res.data.data;
  },

  // President/Advisor: send a broadcast alert to all club members
  sendAlert: async (id, title, body) => {
    const res = await apiClient.post(`/clubs/${id}/alert`, { title, body });
    return res.data.data;
  },
};
