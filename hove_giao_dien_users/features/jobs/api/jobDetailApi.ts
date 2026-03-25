import { api } from '@/lib/api'; // Dùng api singleton có interceptor → auto-refresh token, handle 403 banned

export interface JobDetail {
  id: number;
  title: string;
  companyName: string;
  companyLogoUrl?: string;
  location: string;
  salaryMin: string;
  salaryMax: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
  level: string;
  experience: string;
  description: string;
  requirements: string;
  benefits: string;
  deadline?: string;
  views: number;
  applications: number;
  maxApplicants?: number;
  status: 'active' | 'closed';
  userId: number;
  createdAt: string;
  updatedAt: string;
}

class JobDetailApiService {
  async getJobDetail(id: number): Promise<JobDetail> {
    const response = await api.get(`/api/jobs/${id}`);
    return response.data;
  }

  async incrementViews(id: number): Promise<void> {
    await api.put(`/api/jobs/${id}/view`);
  }

  async updateJobStatus(id: number, status: 'active' | 'closed'): Promise<JobDetail> {
    const response = await api.put(`/api/jobs/${id}/toggle-status`);
    return response.data;
  }

  async saveJob(jobId: number, userId: number): Promise<void> {
    await api.post('/api/saved-jobs', { jobId, userId });
  }
}

export const jobDetailApi = new JobDetailApiService();
