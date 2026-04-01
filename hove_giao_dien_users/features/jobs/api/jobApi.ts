import { api } from '@/lib/api';

export interface Job {
  id: number;
  title: string;
  companyName: string;
  companyLogoUrl?: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  experience: string;       // Text: "0-1 năm", "1-3 năm", "3-5 năm", "5+ năm"
  experienceYearsMin: number; // Số năm kinh nghiệm tối thiểu (INT)
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
  experienceMin?: number;   // Số năm kinh nghiệm tối thiểu
  experienceMax?: number;   // Số năm kinh nghiệm tối đa
}

export interface ExperienceOption {
  value: number;
  label: string;
}

class JobApiService {
  /**
   * Get all active jobs
   */
  async getActiveJobs(): Promise<Job[]> {
    try {
      const response = await api.get('/api/jobs/active');
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
      const response = await api.get(`/api/jobs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get job by ID error:', error);
      throw error;
    }
  }

  /**
   * Search jobs with filters (server-side)
   */
  async searchJobs(filters: JobFilters, page = 0, size = 3): Promise<{ jobs: Job[]; total: number }> {
    try {
      const params: Record<string, string | number> = {
        page,
        size,
      };

      if (filters.searchText) params.searchText = filters.searchText;
      if (filters.location && filters.location !== 'all') params.location = filters.location;
      if (filters.jobType && filters.jobType.length > 0) params.jobType = filters.jobType.join(',');

      // Experience range filter (INT) - replaces old String experience
      if (filters.experienceMin !== undefined && filters.experienceMin !== null) {
        params.experienceMin = filters.experienceMin;
      }
      if (filters.experienceMax !== undefined && filters.experienceMax !== null) {
        params.experienceMax = filters.experienceMax;
      }

      // Parse salary range to min/max
      if (filters.salaryRange && filters.salaryRange !== 'all') {
        if (filters.salaryRange.startsWith('under-')) {
          const val = filters.salaryRange.replace('under-', '').replace(/,/g, '');
          params.salaryMax = val;
        } else if (filters.salaryRange.startsWith('over-')) {
          const val = filters.salaryRange.replace('over-', '').replace(/,/g, '');
          params.salaryMin = val;
        } else {
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

      const response = await api.get('/api/jobs/search', { params });
      return {
        jobs: response.data,
        total: response.headers['x-total-count']
          ? Number(response.headers['x-total-count'])
          : response.data.length,
      };
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
      const response = await api.get(`/api/jobs/company/${companyId}`);
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
      const response = await api.get(`/api/jobs/user/${userId}`);
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
      const response = await api.post('/api/jobs', jobData);
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
      const response = await api.put(`/api/jobs/${id}`, jobData);
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
      await api.delete(`/api/jobs/${id}`);
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
      const response = await api.get(`/api/jobs/recommended/${userId}`);
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
      const response = await api.get('/api/jobs/locations');
      return response.data;
    } catch (error) {
      console.error('Get locations error:', error);
      return [];
    }
  }

  /**
   * Get unique experience levels from active jobs (legacy String field)
   */
  async getExperiences(): Promise<string[]> {
    try {
      const response = await api.get('/api/jobs/experiences');
      return response.data;
    } catch (error) {
      console.error('Get experiences error:', error);
      return [];
    }
  }

  /**
   * Get predefined experience options (INT dropdown for job creation)
   */
  async getExperienceOptions(): Promise<ExperienceOption[]> {
    try {
      const response = await api.get('/api/jobs/experience-options');
      return response.data;
    } catch (error) {
      console.error('Get experience options error:', error);
      return [];
    }
  }
}

export const jobApiService = new JobApiService();
