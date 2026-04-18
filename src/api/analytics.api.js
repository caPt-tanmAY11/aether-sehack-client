import { apiClient } from './client';

export const analyticsApi = {
  getHodDashboard: async () => {
    const res = await apiClient.get('/analytics/hod/dashboard');
    return res.data.data;
  },
  
  getDeanDashboard: async () => {
    const res = await apiClient.get('/analytics/dean/dashboard');
    return res.data.data;
  }
};
