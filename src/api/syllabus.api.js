import { apiClient } from './client';

export const syllabusApi = {
  // Faculty: initialize a syllabus tracker for a subject
  initTracker: async ({ subjectId, topics }) => {
    const res = await apiClient.post('/syllabus/init', { subjectId, topics });
    return res.data.data;
  },

  // Faculty: mark a topic as complete/incomplete
  updateTopic: async (trackerId, { topicIndex, completed }) => {
    const res = await apiClient.patch(`/syllabus/${trackerId}/topic`, { topicIndex, completed });
    return res.data.data;
  },

  // Student: get syllabus progress overview for all subjects
  getMySummary: async () => {
    const res = await apiClient.get('/syllabus/overview');
    return res.data.data;
  },
};
