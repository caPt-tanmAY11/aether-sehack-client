import { apiClient } from './client';

export const attendanceApi = {
  markAttendance: async (timetableId, day, startTime, studentCoord, status, slotDate) => {
    // slotDate is pre-computed by the screen for the slot's actual week date
    const date = slotDate || new Date().toISOString().split('T')[0];
    const res = await apiClient.post('/attendance/mark', {
      timetableId,
      day,
      startTime,
      date,
      status: status || 'present',
      studentCoord: studentCoord || undefined,
    });
    return res.data;
  },
  
  getReport: async () => {
    const res = await apiClient.get('/attendance/me/report');
    return res.data.data;
  },

  getDetailedReport: async () => {
    const res = await apiClient.get('/attendance/me/detailed');
    return res.data.data;
  },

  // subjectId, division, date (YYYY-MM-DD), updates: [{ studentId, status }]
  override: async ({ subjectId, division, date, updates }) => {
    const res = await apiClient.patch('/attendance/override', { subjectId, division, date, updates });
    return res.data.data;
  }
};
