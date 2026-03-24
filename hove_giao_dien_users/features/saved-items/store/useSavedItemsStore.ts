import { create } from 'zustand';
import { savedItemsApi, SavedCompanyWithDetails, SavedJobWithDetails } from '../api/savedItemsApi';

interface SavedItemsState {
  savedCompanies: SavedCompanyWithDetails[];
  savedJobs: SavedJobWithDetails[];
  loadingCompanies: boolean;
  loadingJobs: boolean;
  error: string | null;
  fetchSavedCompanies: (userId: number) => Promise<void>;
  fetchSavedJobs: (userId: number) => Promise<void>;
  unsaveCompany: (userId: number, companyId: number) => Promise<void>;
  unsaveJob: (userId: number, jobId: number) => Promise<void>;
  clearError: () => void;
}

export const useSavedItemsStore = create<SavedItemsState>((set) => ({
  savedCompanies: [],
  savedJobs: [],
  loadingCompanies: false,
  loadingJobs: false,
  error: null,

  fetchSavedCompanies: async (userId) => {
    set({ loadingCompanies: true, error: null });
    try {
      const savedCompanies = await savedItemsApi.getSavedCompanies(userId);
      set({ savedCompanies, loadingCompanies: false });
    } catch (error: any) {
      console.error('Error loading saved companies:', error);
      set({ error: error.message || 'Không thể tải danh sách công ty đã lưu', loadingCompanies: false });
    }
  },

  fetchSavedJobs: async (userId) => {
    set({ loadingJobs: true, error: null });
    try {
      const savedJobs = await savedItemsApi.getSavedJobs(userId);
      set({ savedJobs, loadingJobs: false });
    } catch (error: any) {
      console.error('Error loading saved jobs:', error);
      set({ error: error.message || 'Không thể tải danh sách việc làm đã lưu', loadingJobs: false });
    }
  },

  unsaveCompany: async (userId, companyId) => {
    set({ error: null });
    await savedItemsApi.unsaveCompany(userId, companyId);
  },

  unsaveJob: async (userId, jobId) => {
    set({ error: null });
    await savedItemsApi.unsaveJob(userId, jobId);
  },

  clearError: () => set({ error: null }),
}));
