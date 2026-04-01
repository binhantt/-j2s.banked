import { create } from 'zustand';
import { profileApi, CompanyProfile, JobSeekerProfile } from '../api/profileApi';

interface ProfileState {
  companyProfile: CompanyProfile | null;
  jobSeekerProfile: JobSeekerProfile | null;
  loading: boolean;
  error: string | null;

  // Actions
  loadCompanyProfile: (hrId: number) => Promise<void>;
  saveCompanyProfile: (data: Partial<CompanyProfile>) => Promise<void>;
  loadJobSeekerProfile: (userId: number) => Promise<void>;
  saveJobSeekerProfile: (userId: number, data: Partial<JobSeekerProfile>) => Promise<void>;
  clearError: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  companyProfile: null,
  jobSeekerProfile: null,
  loading: false,
  error: null,

  loadCompanyProfile: async (hrId: number) => {
    set({ loading: true, error: null });
    try {
      const profile = await profileApi.getCompanyByHrId(hrId);
      set({ companyProfile: profile, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load company profile', loading: false });
    }
  },

  saveCompanyProfile: async (data: Partial<CompanyProfile>) => {
    set({ loading: true, error: null });
    try {
      const { companyProfile } = get();
      let savedProfile: CompanyProfile;

      if (companyProfile?.id) {
        savedProfile = await profileApi.updateCompany(companyProfile.id, data);
      } else {
        savedProfile = await profileApi.createCompany(data);
      }

      set({ companyProfile: savedProfile, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to save company profile', loading: false });
      throw error;
    }
  },

  loadJobSeekerProfile: async (userId: number) => {
    set({ loading: true, error: null });
    try {
      const profile = await profileApi.getJobSeekerProfile(userId);
      set({ jobSeekerProfile: profile, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load profile', loading: false, jobSeekerProfile: null });
    }
  },

  saveJobSeekerProfile: async (userId: number, data: Partial<JobSeekerProfile>) => {
    set({ loading: true, error: null });
    try {
      const savedProfile = await profileApi.updateJobSeekerProfile(userId, data);
      set({ jobSeekerProfile: savedProfile, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to save profile', loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
