import { apiClient } from './client';

export const timetableApi = {
  getMyTimetable: async (semester, academicYear) => {
    let url = '/timetable/me';
    if (semester || academicYear) {
      const params = new URLSearchParams();
      if (semester) params.append('semester', semester);
      if (academicYear) params.append('academicYear', academicYear);
      url += `?${params.toString()}`;
    }
    const res = await apiClient.get(url);
    return res.data.data;
  },

  upload: async (payload) => {
    const res = await apiClient.post('/timetable', payload);
    return res.data.data;
  },

  getPending: async () => {
    const res = await apiClient.get('/timetable/pending');
    return res.data.data;
  },

  review: async (id, status, comment) => {
    const res = await apiClient.patch(`/timetable/${id}/review`, { status, comment });
    return res.data.data;
  },

  getDepartmentTimetables: async () => {
    const res = await apiClient.get('/timetable/department');
    return res.data.data;
  },
  // Get Vacant Classrooms
  getVacantRooms: async () => {
    const response = await apiClient.get('/timetable/vacant');
    return response.data.data;
  }
};
