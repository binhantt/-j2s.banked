import { api } from './api';

export const jobApi = {
  // Get all jobs
  getAllJobs: async () => {
    const response = await api.get('/api/jobs');
    return response.data;
  },

  // Get active jobs
  getActiveJobs: async () => {
    const response = await api.get('/api/jobs/active');
    return response.data;
  },

  // Get jobs by user (HR)
  getJobsByUser: async (userId: number) => {
    const response = await api.get(`/api/jobs/user/${userId}`);
    return response.data;
  },

  // Get single job
  getJob: async (id: number) => {
    const response = await api.get(`/api/jobs/${id}`);
    return response.data;
  },

  // Create job
  createJob: async (data: any) => {
    const response = await api.post('/api/jobs', data);
    return response.data;
  },

  // Update job
  updateJob: async (id: number, data: any) => {
    const response = await api.put(`/api/jobs/${id}`, data);
    return response.data;
  },

  // Toggle status
  toggleStatus: async (id: number) => {
    const response = await api.put(`/api/jobs/${id}/toggle-status`);
    return response.data;
  },

  // Increment views
  incrementViews: async (id: number) => {
    await api.put(`/api/jobs/${id}/view`);
  },

  // Delete job
  deleteJob: async (id: number) => {
    await api.delete(`/api/jobs/${id}`);
  },
};
