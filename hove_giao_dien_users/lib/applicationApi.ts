import { api } from './api';

export const applicationApi = {
  // Apply for job
  applyJob: async (data: any) => {
    const response = await api.post('/api/applications', data);
    return response.data;
  },

  // Get applications for a job (HR)
  getJobApplications: async (jobId: number) => {
    const response = await api.get(`/api/applications/job/${jobId}`);
    return response.data;
  },

  // Get user's applications
  getUserApplications: async (userId: number) => {
    const response = await api.get(`/api/applications/user/${userId}`);
    return response.data;
  },

  // Check if applied
  checkApplied: async (jobId: number, userId: number) => {
    const response = await api.get(`/api/applications/check/${jobId}/${userId}`);
    return response.data;
  },

  // Update status (HR)
  updateStatus: async (id: number, status: string) => {
    const response = await api.put(`/api/applications/${id}/status`, { status });
    return response.data;
  },

  // Update interview round (HR)
  updateRound: async (id: number, action: 'pass' | 'fail') => {
    const response = await api.put(`/api/applications/${id}/round`, { action });
    return response.data;
  },

  // Delete application
  deleteApplication: async (id: number) => {
    await api.delete(`/api/applications/${id}`);
  },

  // User confirm going to work
  confirmApplication: async (id: number) => {
    const response = await api.put(`/api/applications/${id}/confirm`);
    return response.data;
  },
};
