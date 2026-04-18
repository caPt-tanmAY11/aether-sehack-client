import { apiClient } from './client';

export const leaveApi = {
  // Faculty: apply for leave
  apply: async ({ leaveType, fromDate, toDate, reason }) => {
    const res = await apiClient.post('/leave', { leaveType, fromDate, toDate, reason });
    return res.data.data;
  },

  // Faculty: my own leave history
  getMyLeaves: async () => {
    const res = await apiClient.get('/leave/my');
    return res.data.data;
  },

  // HOD: pending leave requests in their dept
  getPending: async () => {
    const res = await apiClient.get('/leave/pending');
    return res.data.data;
  },

  // HOD/Dean: all leaves for dept (optional ?status= filter)
  getDeptLeaves: async (status) => {
    const url = status ? `/leave/department?status=${status}` : '/leave/department';
    const res = await apiClient.get(url);
    return res.data.data;
  },

  // HOD: approve or reject a leave request
  review: async (id, status, remarks) => {
    const res = await apiClient.patch(`/leave/${id}/review`, { status, remarks });
    return res.data.data;
  },

  // Student: apply for leave (directed to faculty)
  studentApply: async ({ facultyId, fromDate, toDate, reason, leaveType }) => {
    const res = await apiClient.post('/leave/student', { facultyId, fromDate, toDate, reason, leaveType });
    return res.data.data;
  },

  // Student: my leave history
  studentMyLeaves: async () => {
    const res = await apiClient.get('/leave/student/my');
    return res.data.data;
  },

  // Faculty: student leaves directed to me
  studentIncoming: async () => {
    const res = await apiClient.get('/leave/student/incoming');
    return res.data.data;
  },

  // Faculty: approve/reject a student leave
  studentReview: async (id, status, remarks) => {
    const res = await apiClient.patch(`/leave/student/${id}/review`, { status, remarks });
    return res.data.data;
  },
};
