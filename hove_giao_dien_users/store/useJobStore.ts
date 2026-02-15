import { create } from 'zustand';

export interface Job {
  id: number;
  userId: number;
  title: string;
  location: string;
  salaryMin: string;
  salaryMax: string;
  jobType: string;
  level: string;
  experience: string;
  description: string;
  requirements: string;
  benefits: string;
  deadline: string;
  status: string;
  applications: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  companyName?: string;
  companyId?: number;
  companyLogoUrl?: string;
}

interface JobStore {
  jobs: Job[];
  searchQuery: string;
  filteredJobs: Job[];
  setSearchQuery: (query: string) => void;
  setJobs: (jobs: Job[]) => void;
}

export const useJobStore = create<JobStore>((set, get) => ({
  jobs: [],
  searchQuery: '',
  filteredJobs: [],
  
  setSearchQuery: (query: string) => {
    const { jobs } = get();
    const filtered = jobs.filter(job =>
      job.title.toLowerCase().includes(query.toLowerCase()) ||
      job.location.toLowerCase().includes(query.toLowerCase())
    );
    set({ searchQuery: query, filteredJobs: filtered });
  },
  
  setJobs: (jobs: Job[]) => set({ jobs, filteredJobs: jobs }),
}));
