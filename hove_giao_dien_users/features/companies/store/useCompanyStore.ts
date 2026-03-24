import { create } from 'zustand';
import { Company, CompanyFilters, companyApi } from '../api/companyApi';

interface CompanyStore {
  companies: Company[];
  loading: boolean;
  error: string | null;
  filters: CompanyFilters;
  
  // Actions
  fetchCompanies: () => Promise<void>;
  searchCompanies: (keyword: string) => Promise<void>;
  setFilters: (filters: CompanyFilters) => void;
  clearFilters: () => void;
}

export const useCompanyStore = create<CompanyStore>((set, get) => ({
  companies: [],
  loading: false,
  error: null,
  filters: {},

  fetchCompanies: async () => {
    set({ loading: true, error: null });
    try {
      const filters = get().filters;
      const data = await companyApi.getCompanies(filters);
      
      // Filter locally based on filters
      let filtered = data;
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(company => 
          company.name?.toLowerCase().includes(searchLower) ||
          company.address?.toLowerCase().includes(searchLower)
        );
      }

      if (filters.domainId) {
        filtered = filtered.filter(company => company.domainId === filters.domainId);
      }

      if (filters.companySize) {
        filtered = filtered.filter(company => 
          company.companySize?.includes(filters.companySize!)
        );
      }
      
      set({ companies: filtered, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Không thể tải danh sách công ty',
        loading: false,
        companies: []
      });
    }
  },

  searchCompanies: async (keyword: string) => {
    set({ filters: { search: keyword } });
    get().fetchCompanies();
  },

  setFilters: (filters: CompanyFilters) => {
    set({ filters });
    get().fetchCompanies();
  },

  clearFilters: () => {
    set({ filters: {} });
    get().fetchCompanies();
  },
}));
