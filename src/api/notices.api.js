import { apiClient } from './client';

export const noticesApi = {
  // Faculty/HOD/Dean: publish a new notice
  publish: async ({ title, body, targetDivision, targetSemester, targetDepartmentId }) => {
    const res = await apiClient.post('/notices', {
      title,
      body,
      targetDivision,
      targetSemester,
      targetDepartmentId,
    });
    return res.data.data;
  },

  // All roles: get notices scoped to me (dept, division, semester)
  getNotices: async () => {
    const res = await apiClient.get('/notices');
    return res.data.data;
  },

  // Faculty/HOD/Dean: get notices I published
  getMyNotices: async () => {
    const res = await apiClient.get('/notices/mine');
    return res.data.data;
  },

  // Faculty/HOD/Dean: soft-delete a notice
  deleteNotice: async (id) => {
    const res = await apiClient.delete(`/notices/${id}`);
    return res.data;
  },
};
