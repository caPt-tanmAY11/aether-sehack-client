import { apiClient } from './client';

export const batchesApi = {
  // Faculty: get all their assigned batches
  getMyBatches: async () => {
    const res = await apiClient.get('/batches/my');
    return res.data.data;
  },

  // Faculty or HOD: get a single batch with student list
  getBatch: async (id) => {
    const res = await apiClient.get(`/batches/${id}`);
    return res.data.data;
  },

  // HOD: list all batches in department
  getDepartmentBatches: async (academicYear) => {
    const params = academicYear ? { academicYear } : {};
    const res = await apiClient.get('/batches/department', { params });
    return res.data.data;
  },

  // Faculty: send a notice to all students in a batch
  sendBatchNotice: async (batchId, { title, body, priority }) => {
    const res = await apiClient.post(`/batches/${batchId}/notice`, { title, body, priority });
    return res.data.data;
  },
};
