import { api } from './api';

export const savedJobApi = {
  // Save a job
  saveJob: async (userId: number, jobId: number) => {
    const response = await api.post('/api/saved-jobs', {
      userId,
      jobId,
    });
    return response.data;
  },

  // Get user's saved jobs
  getUserSavedJobs: async (userId: number) => {
    const response = await api.get(`/api/saved-jobs/user/${userId}`);
    return response.data;
  },

  // Check if job is saved
  checkSaved: async (userId: number, jobId: number) => {
    const response = await api.get(`/api/saved-jobs/check/${userId}/${jobId}`);
    return response.data;
  },

  // Unsave a job
  unsaveJob: async (userId: number, jobId: number) => {
    await api.delete(`/api/saved-jobs/${userId}/${jobId}`);
  },
};
