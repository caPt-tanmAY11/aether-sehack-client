import { apiClient } from './client';

export const syllabusApi = {
  // Faculty: initialize a syllabus tracker for a subject
  initTracker: async ({ subjectId, semester, academicYear, topics }) => {
    const res = await apiClient.post('/syllabus/init', { subjectId, semester, academicYear, topics });
    return res.data.data;
  },

  // Faculty: get all their own trackers
  getFacultyTrackers: async () => {
    const res = await apiClient.get('/syllabus/my-trackers');
    return res.data.data;
  },

  // Faculty: mark a specific topic by its ID as done/pending
  updateTopic: async (trackerId, { topicId, status, notes }) => {
    const res = await apiClient.patch(`/syllabus/${trackerId}/topic`, { topicId, status, notes });
    return res.data.data;
  },

  // Student: get syllabus progress overview for all subjects
  getMySummary: async (semester, academicYear) => {
    const res = await apiClient.get('/syllabus/overview', {
      params: { semester, academicYear },
      headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
    });
    return res.data.data;
  },
};
