import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface Job {
  id: number;
  title: string;
  companyName: string;
  companyLogoUrl?: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  experience: string;
  level: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
  description: string;
  requirements: string;
  benefits: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface JobFilters {
  searchText?: string;
  location?: string;
  jobType?: string[];
  salaryRange?: string;
  experience?: string;
}

class JobApiService {
  /**
   * Get all active jobs
   */
  async getActiveJobs(): Promise<Job[]> {
    try {
      const response = await axios.get(`${API_URL}/api/jobs/active`);
      return response.data;
    } catch (error) {
      console.error('Get active jobs error:', error);
      throw error;
    }
  }

  /**
   * Get job by ID
   */
  async getJobById(id: number): Promise<Job> {
    try {
      const response = await axios.get(`${API_URL}/api/jobs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get job by ID error:', error);
      throw error;
    }
  }

  /**
   * Search jobs with filters (server-side)
   */
  async searchJobs(filters: JobFilters): Promise<Job[]> {
    try {
      const params: Record<string, string> = {};

      if (filters.searchText) params.searchText = filters.searchText;
      if (filters.location && filters.location !== 'all') params.location = filters.location;
      if (filters.jobType && filters.jobType.length > 0) params.jobType = filters.jobType.join(',');
      if (filters.experience && filters.experience !== 'all') params.experience = filters.experience;

      // Parse salary range to min/max
      if (filters.salaryRange && filters.salaryRange !== 'all') {
        if (filters.salaryRange.startsWith('under-')) {
          // "under-10" → salaryMax = 10 (jobs with max salary <= 10)
          const val = filters.salaryRange.replace('under-', '').replace(/,/g, '');
          params.salaryMax = val;
        } else if (filters.salaryRange.startsWith('over-')) {
          // "over-50" → salaryMin = 50 (jobs with min salary >= 50)
          const val = filters.salaryRange.replace('over-', '').replace(/,/g, '');
          params.salaryMin = val;
        } else {
          // "10-20" → salaryMin = 10, salaryMax = 20
          const parts = filters.salaryRange.split('-');
          if (parts.length === 2) {
            const [minStr, maxStr] = parts;
            if (!maxStr.includes('+')) {
              params.salaryMin = minStr.replace(/,/g, '');
              params.salaryMax = maxStr.replace(/,/g, '');
            } else {
              params.salaryMin = minStr.replace(/,/g, '');
            }
          } else if (filters.salaryRange.includes('+')) {
            params.salaryMin = filters.salaryRange.replace(/,/g, '').replace('+', '');
          }
        }
      }

      const response = await axios.get(`${API_URL}/api/jobs/search`, { params });
      return response.data;
    } catch (error: any) {
      console.error('Search jobs error:', error);
      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        'Search failed';
      throw new Error(message);
    }
  }

  /**
   * Get jobs by company
   */
  async getJobsByCompany(companyId: number): Promise<Job[]> {
    try {
      const response = await axios.get(`${API_URL}/api/jobs/company/${companyId}`);
      return response.data;
    } catch (error) {
      console.error('Get jobs by company error:', error);
      throw error;
    }
  }

  /**
   * Get jobs by user (HR)
   */
  async getJobsByUser(userId: number): Promise<Job[]> {
    try {
      const response = await axios.get(`${API_URL}/api/jobs/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get jobs by user error:', error);
      throw error;
    }
  }

  /**
   * Create new job posting
   */
  async createJob(jobData: Partial<Job>): Promise<Job> {
    try {
      const response = await axios.post(`${API_URL}/api/jobs`, jobData);
      return response.data;
    } catch (error) {
      console.error('Create job error:', error);
      throw error;
    }
  }

  /**
   * Update job posting
   */
  async updateJob(id: number, jobData: Partial<Job>): Promise<Job> {
    try {
      const response = await axios.put(`${API_URL}/api/jobs/${id}`, jobData);
      return response.data;
    } catch (error) {
      console.error('Update job error:', error);
      throw error;
    }
  }

  /**
   * Delete job posting
   */
  async deleteJob(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/api/jobs/${id}`);
    } catch (error) {
      console.error('Delete job error:', error);
      throw error;
    }
  }

  /**
   * Get recommended jobs for user
   */
  async getRecommendedJobs(userId: number): Promise<Job[]> {
    try {
      const response = await axios.get(`${API_URL}/api/jobs/recommended/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get recommended jobs error:', error);
      throw error;
    }
  }

  /**
   * Get unique locations from active jobs (server-side)
   */
  async getLocations(): Promise<string[]> {
    try {
      const response = await axios.get(`${API_URL}/api/jobs/locations`);
      return response.data;
    } catch (error) {
      console.error('Get locations error:', error);
      return [];
    }
  }

  /**
   * Get unique experience levels from active jobs (server-side)
   */
  async getExperiences(): Promise<string[]> {
    try {
      const response = await axios.get(`${API_URL}/api/jobs/experiences`);
      return response.data;
    } catch (error) {
      console.error('Get experiences error:', error);
      return [];
    }
  }
}

export const jobApiService = new JobApiService();
