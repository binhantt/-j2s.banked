import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface Job {
  id: number;
  title: string;
  companyName: string;
  companyLogoUrl?: string;
  location: string;
  salaryMin: string;
  salaryMax: string;
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
   * Search jobs with filters
   */
  async searchJobs(filters: JobFilters): Promise<Job[]> {
    try {
      // Get all jobs first
      const response = await axios.get(`${API_URL}/api/jobs`);
      let jobs = response.data;
      
      // Filter locally
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        jobs = jobs.filter((job: Job) => 
          job.title?.toLowerCase().includes(searchLower) ||
          job.description?.toLowerCase().includes(searchLower) ||
          job.companyName?.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters.location && filters.location !== 'all') {
        jobs = jobs.filter((job: Job) => 
          job.location?.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }
      
      if (filters.jobType && filters.jobType.length > 0) {
        jobs = jobs.filter((job: Job) => 
          filters.jobType!.includes(job.jobType)
        );
      }
      
      if (filters.salaryRange && filters.salaryRange !== 'all') {
        // Parse salary range like "10-20" or "20+"
        const [min, max] = filters.salaryRange.split('-').map(s => parseInt(s.replace('+', '')));
        jobs = jobs.filter((job: Job) => {
          const jobMin = parseInt(job.salaryMin?.toString() || '0');
          if (max) {
            return jobMin >= min && jobMin <= max;
          } else {
            return jobMin >= min;
          }
        });
      }
      
      if (filters.experience && filters.experience !== 'all') {
        jobs = jobs.filter((job: Job) => 
          job.experience?.toLowerCase().includes(filters.experience!.toLowerCase())
        );
      }
      
      return jobs;
    } catch (error) {
      console.error('Search jobs error:', error);
      return [];
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
}

export const jobApiService = new JobApiService();
