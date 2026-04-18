import { apiClient } from './client';

export const syllabusApi = {
  getOverview: async (semester, academicYear) => {
    let url = '/syllabus/overview';
    const params = new URLSearchParams();
    if (semester) params.append('semester', semester);
    if (academicYear) params.append('academicYear', academicYear);
    if (params.toString()) url += `?${params.toString()}`;
    
    const res = await apiClient.get(url);
    return res.data.data;
  },

  initTracker: async (subjectId, divisions) => {
    const res = await apiClient.post('/syllabus/init', { subjectId, divisions });
    return res.data.data;
  },

  updateTopic: async (trackerId, topicIndex, isCompleted) => {
    const res = await apiClient.patch(`/syllabus/${trackerId}/topic`, { topicIndex, isCompleted });
    return res.data.data;
  },

  getFacultyTrackers: async () => {
    const res = await apiClient.get('/syllabus/trackers');
    return res.data.data;
  }
};
