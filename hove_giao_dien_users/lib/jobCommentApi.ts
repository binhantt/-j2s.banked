import { api } from './api';

export interface JobComment {
  id?: number;
  jobPostingId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  content: string;
  parentId?: number;
  createdAt?: string;
  updatedAt?: string;
  replies?: JobComment[];
}

export const jobCommentApi = {
  // Get comments by job
  getCommentsByJob: async (jobPostingId: number): Promise<JobComment[]> => {
    const response = await api.get(`/api/job-comments/job/${jobPostingId}`);
    return response.data;
  },

  // Create comment
  createComment: async (data: JobComment): Promise<JobComment> => {
    const response = await api.post('/api/job-comments', data);
    return response.data;
  },

  // Delete comment
  deleteComment: async (id: number): Promise<void> => {
    await api.delete(`/api/job-comments/${id}`);
  },
};
