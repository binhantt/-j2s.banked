import { api } from './api';

export const savedJobApi = {
  // Save a job
  saveJob: async (userId: number, jobId: number) => {
    try {
      const response = await api.post('/api/saved-jobs', {
        userId,
        jobId,
      });
      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Lưu công việc thất bại';
      console.error('❌ Lỗi lưu công việc:', msg, { userId, jobId });
      throw new Error(msg);
    }
  },

  // Get user's saved jobs WITH full job details (backend returns everything in 1 call)
  getUserSavedJobs: async (userId: number) => {
    try {
      const response = await api.get(`/api/saved-jobs/user/${userId}`);
      // Backend returns: { id, userId, jobId, createdAt, job: { title, companyName, ... } }
      return response.data ?? [];
    } catch (error: any) {
      console.error('❌ Lỗi khi tải danh sách việc đã lưu:', error?.response?.data || error?.message);
      return [];
    }
  },

  // Check if job is saved
  checkSaved: async (userId: number, jobId: number): Promise<boolean> => {
    try {
      const response = await api.get(`/api/saved-jobs/check/${userId}/${jobId}`);
      return response.data ?? false;
    } catch (error: any) {
      console.error('❌ Lỗi kiểm tra trạng thái lưu việc:', error?.response?.data || error?.message);
      return false;
    }
  },

  // Unsave a job
  unsaveJob: async (userId: number, jobId: number) => {
    await api.delete(`/api/saved-jobs/${userId}/${jobId}`);
  },
};
