import { create } from 'zustand';
import { Company, companyApi } from '../api/companyApi';

interface CompanyDetailStore {
  company: Company | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchCompany: (id: number) => Promise<void>;
  clearCompany: () => void;
}

export const useCompanyDetailStore = create<CompanyDetailStore>((set) => ({
  company: null,
  loading: false,
  error: null,

  fetchCompany: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const data = await companyApi.getCompany(id);
      set({ company: data, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Không thể tải thông tin công ty',
        loading: false 
      });
    }
  },

  clearCompany: () => {
    set({ company: null, error: null });
  },
}));
