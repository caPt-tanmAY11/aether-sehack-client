import { apiClient } from './client';

export const pluginsApi = {
  // Get all mini-apps available for the current user's role
  getPlugins: async () => {
    const res = await apiClient.get('/plugins');
    return res.data.data;
  },

  // Get a short-lived launch token for a specific plugin
  getLaunchToken: async (slug) => {
    const res = await apiClient.post(`/plugins/${slug}/token`);
    return res.data.data; // { token, plugin: { slug, name, appUrl } }
  },

  // Register a new plugin
  registerPlugin: async (data) => {
    const res = await apiClient.post('/plugins', data);
    return res.data.data;
  }
};
