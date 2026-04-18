import { apiClient } from './client';

export const attendanceApi = {
  markAttendance: async (timetableId, day, startTime, studentCoord) => {
    // Requires { timetableId, day, startTime, date (YYYY-MM-DD), studentCoord }
    const date = new Date().toISOString().split('T')[0];
    const res = await apiClient.post('/attendance/mark', {
      timetableId,
      day,
      startTime,
      date,
      studentCoord
    });
    return res.data;
  },
  
  getReport: async () => {
    const res = await apiClient.get('/attendance/me/report');
    return res.data.data;
  },

  override: async (studentId, date, startTime, status) => {
    const res = await apiClient.patch('/attendance/override', { studentId, date, startTime, status });
    return res.data.data;
  }
};
