import { apiClient } from './client';

export const issuesApi = {
  getMyIssues: async () => {
    // There isn't an explicit "my issues" endpoint in phase 7, 
    // it was just filtering. We'll use a mocked empty array or 
    // if backend supports GET /issues/me we use that.
    const res = await apiClient.get('/issues/me');
    return res.data.data;
  },
  
  reportIssue: async (data) => {
    // { title, description, category, location }
    const res = await apiClient.post('/issues', data);
    return res.data.data;
  },

  getAllIssues: async () => {
    const res = await apiClient.get('/issues/all');
    return res.data.data;
  },

  resolveIssue: async (id, status, resolutionNotes) => {
    const res = await apiClient.patch(`/issues/${id}`, { status, resolutionNotes });
    return res.data.data;
  }
};
