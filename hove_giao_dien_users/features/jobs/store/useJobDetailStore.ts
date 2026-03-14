import { create } from 'zustand';
import { jobDetailApi, JobDetail } from '../api/jobDetailApi';

interface JobDetailState {
  job: JobDetail | null;
  loading: boolean;
  error: string | null;
  hasApplied: boolean;
  
  fetchJobDetail: (id: number) => Promise<void>;
  incrementViews: (id: number) => Promise<void>;
  updateJobStatus: (id: number, status: 'active' | 'closed') => Promise<void>;
  saveJob: (jobId: number, userId: number) => Promise<void>;
  setHasApplied: (applied: boolean) => void;
  clearJob: () => void;
}

export const useJobDetailStore = create<JobDetailState>((set) => ({
  job: null,
  loading: false,
  error: null,
  hasApplied: false,

  fetchJobDetail: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const job = await jobDetailApi.getJobDetail(id);
      set({ job, loading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch job detail', 
        loading: false 
      });
    }
  },

  incrementViews: async (id: number) => {
    try {
      await jobDetailApi.incrementViews(id);
    } catch (error) {
      console.error('Failed to increment views:', error);
    }
  },

  updateJobStatus: async (id: number, status: 'active' | 'closed') => {
    set({ loading: true, error: null });
    try {
      const updatedJob = await jobDetailApi.updateJobStatus(id, status);
      set({ job: updatedJob, loading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update job status', 
        loading: false 
      });
      throw error;
    }
  },

  saveJob: async (jobId: number, userId: number) => {
    try {
      await jobDetailApi.saveJob(jobId, userId);
    } catch (error: any) {
      throw error;
    }
  },

  setHasApplied: (applied: boolean) => {
    set({ hasApplied: applied });
  },

  clearJob: () => {
    set({ job: null, error: null, hasApplied: false });
  },
}));
