import { apiClient } from './client';

export const advisingApi = {
  // Faculty: create a new advising note for a student
  createNote: async ({ studentId, noteText, category, followUpDate, sharedWithStudent }) => {
    const res = await apiClient.post('/advising', {
      studentId,
      noteText,
      category,
      followUpDate,
      sharedWithStudent,
    });
    return res.data.data;
  },

  // Faculty: create a note for an entire batch (division)
  createBatchNote: async ({ division, noteText, category, followUpDate, sharedWithStudent }) => {
    const res = await apiClient.post('/advising/batch', {
      division,
      noteText,
      category,
      followUpDate,
      sharedWithStudent,
    });
    return res.data.data;
  },

  // Faculty: all notes I've written
  getMyNotes: async () => {
    const res = await apiClient.get('/advising/my-notes');
    return res.data.data;
  },

  // Faculty: notes with pending follow-ups
  getFollowUps: async () => {
    const res = await apiClient.get('/advising/follow-ups');
    return res.data.data;
  },

  // Faculty: mark a specific note's follow-up as done
  markFollowUpDone: async (noteId) => {
    const res = await apiClient.patch(`/advising/${noteId}/follow-up-done`);
    return res.data.data;
  },

  // Faculty: all notes for a specific student
  getNotesForStudent: async (studentId) => {
    const res = await apiClient.get(`/advising/student/${studentId}`);
    return res.data.data;
  },

  // Student: notes that faculty shared with me
  getSharedWithMe: async () => {
    const res = await apiClient.get('/advising/shared-with-me');
    return res.data.data;
  },

  // Student: submit an advising request
  createRequest: async ({ facultyId, message }) => {
    const res = await apiClient.post('/advising/request', { facultyId, message });
    return res.data.data;
  },

  // Student: my request history
  getMyRequests: async () => {
    const res = await apiClient.get('/advising/my-requests');
    return res.data.data;
  },

  // Faculty: incoming requests
  getIncomingRequests: async () => {
    const res = await apiClient.get('/advising/incoming-requests');
    return res.data.data;
  },

  // Faculty: update a request status
  updateRequest: async (requestId, { status, facultyReply }) => {
    const res = await apiClient.patch(`/advising/request/${requestId}`, { status, facultyReply });
    return res.data.data;
  },
};
