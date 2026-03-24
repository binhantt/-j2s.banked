import { savedCompanyApi } from '@/lib/savedCompanyApi';
import { savedJobApi } from '@/lib/savedJobApi';

export interface SavedCompanyWithDetails {
  id: number;
  userId: number;
  companyId: number;
  createdAt: string;
  company?: {
    id: number;
    name: string;
    logoUrl?: string;
    address?: string;
    companySize?: string;
    industry?: string;
  };
}

export interface SavedJobWithDetails {
  id: number;
  userId: number;
  jobId: number;
  createdAt: string;
  job?: {
    id: number;
    title: string;
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
    salary?: string;
    jobType?: string;
    level?: string;
    experience?: string;
    experienceLevel?: string;
    companyName?: string;
    companyLogoUrl?: string;
    status?: string;
    createdAt?: string;
  };
}

export const savedItemsApi = {
  async getSavedCompanies(userId: number): Promise<SavedCompanyWithDetails[]> {
    // Backend returns full company details in single API call
    const response = await savedCompanyApi.getUserSavedCompanies(userId);
    return response ?? [];
  },

  async getSavedJobs(userId: number): Promise<SavedJobWithDetails[]> {
    // Backend returns full job details (with company info) in single API call
    const response = await savedJobApi.getUserSavedJobs(userId);
    return response ?? [];
  },

  async unsaveCompany(userId: number, companyId: number) {
    return savedCompanyApi.unsaveCompany(userId, companyId);
  },

  async unsaveJob(userId: number, jobId: number) {
    return savedJobApi.unsaveJob(userId, jobId);
  },
};
