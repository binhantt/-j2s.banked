import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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
    try {
      const response = await axios.get(`${API_URL}/api/jobs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get job detail error:', error);
      throw error;
    }
  }

  async incrementViews(id: number): Promise<void> {
    try {
      await axios.put(`${API_URL}/api/jobs/${id}/view`);
    } catch (error) {
      console.error('Increment views error:', error);
    }
  }

  async updateJobStatus(id: number, status: 'active' | 'closed'): Promise<JobDetail> {
    try {
      const response = await axios.put(`${API_URL}/api/jobs/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error('Update job status error:', error);
      throw error;
    }
  }

  async saveJob(jobId: number, userId: number): Promise<void> {
    try {
      // TODO: Implement save job API when backend is ready
      await axios.post(`${API_URL}/api/saved-jobs`, { jobId, userId });
    } catch (error) {
      console.error('Save job error:', error);
      throw error;
    }
  }
}

export const jobDetailApi = new JobDetailApiService();
