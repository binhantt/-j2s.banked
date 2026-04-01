import { create } from 'zustand';
import { jobApiService, Job, JobFilters } from '../api/jobApi';

interface JobState {
  // State
  jobs: Job[];
  currentJob: Job | null;
  loading: boolean;
  error: string | null;
  filters: JobFilters;
  currentPage: number;
  totalJobs: number;
  pageSize: number;

  // Actions
  fetchJobs: (page?: number) => Promise<void>;
  fetchJobById: (id: number) => Promise<void>;
  searchJobs: (filters: JobFilters, page?: number) => Promise<void>;
  setFilters: (filters: Partial<JobFilters>) => void;
  setPage: (page: number) => void;
  clearFilters: () => void;
  createJob: (jobData: Partial<Job>) => Promise<Job>;
  updateJob: (id: number, jobData: Partial<Job>) => Promise<Job>;
  deleteJob: (id: number) => Promise<void>;
  clearError: () => void;
}

const initialFilters: JobFilters = {
  searchText: '',
  location: 'all',
  jobType: [],
  salaryRange: 'all',
  experience: 'all',
};

export const useJobStore = create<JobState>((set, get) => ({
  // Initial state
  jobs: [],
  currentJob: null,
  loading: false,
  error: null,
  filters: initialFilters,
  currentPage: 0,
  totalJobs: 0,
  pageSize: 3,

  // Fetch all active jobs
  fetchJobs: async (page = 0) => {
    set({ loading: true, error: null });
    try {
      const { jobs, total } = await jobApiService.searchJobs(get().filters, page, get().pageSize);
      set({ jobs, totalJobs: total, currentPage: page, loading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch jobs',
        loading: false
      });
    }
  },

  // Fetch job by ID
  fetchJobById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const job = await jobApiService.getJobById(id);
      set({ currentJob: job, loading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch job', 
        loading: false 
      });
    }
  },

  // Search jobs with filters
  searchJobs: async (filters: JobFilters, page = 0) => {
    set({ loading: true, error: null, filters });
    try {
      const { jobs, total } = await jobApiService.searchJobs(filters, page, get().pageSize);
      set({ jobs, totalJobs: total, currentPage: page, loading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to search jobs',
        loading: false
      });
    }
  },

  // Set filters
  setFilters: (newFilters: Partial<JobFilters>) => {
    const currentFilters = get().filters;
    const updatedFilters = { ...currentFilters, ...newFilters };
    set({ filters: updatedFilters, currentPage: 0 });

    // Auto search when filters change
    get().searchJobs(updatedFilters, 0);
  },

  // Set current page
  setPage: (page: number) => {
    set({ currentPage: page });
    get().searchJobs(get().filters, page);
  },

  // Clear all filters
  clearFilters: () => {
    set({ filters: initialFilters, currentPage: 0 });
    get().fetchJobs(0);
  },

  // Create new job
  createJob: async (jobData: Partial<Job>) => {
    set({ loading: true, error: null });
    try {
      const newJob = await jobApiService.createJob(jobData);
      const currentJobs = get().jobs;
      set({ 
        jobs: [newJob, ...currentJobs], 
        loading: false 
      });
      return newJob;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to create job', 
        loading: false 
      });
      throw error;
    }
  },

  // Update job
  updateJob: async (id: number, jobData: Partial<Job>) => {
    set({ loading: true, error: null });
    try {
      const updatedJob = await jobApiService.updateJob(id, jobData);
      const currentJobs = get().jobs;
      set({ 
        jobs: currentJobs.map(job => job.id === id ? updatedJob : job),
        currentJob: get().currentJob?.id === id ? updatedJob : get().currentJob,
        loading: false 
      });
      return updatedJob;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update job', 
        loading: false 
      });
      throw error;
    }
  },

  // Delete job
  deleteJob: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await jobApiService.deleteJob(id);
      const currentJobs = get().jobs;
      set({ 
        jobs: currentJobs.filter(job => job.id !== id),
        loading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to delete job', 
        loading: false 
      });
      throw error;
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
