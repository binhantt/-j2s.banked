import { create } from 'zustand';
import type { Domain, DomainSummary } from '../types/domainTypes';
import { domainApi } from '../api/domainApi';

interface DomainStore {
  domains: DomainSummary[];
  loading: boolean;
  error: string | null;
  detail: Domain | null;
  detailVisible: boolean;
  
  // Actions
  loadDomains: () => Promise<void>;
  loadDetail: (id: string) => Promise<void>;
  closeDetail: () => void;
  removeDomainById: (id: string) => void;
  updateDomainInList: (domain: DomainSummary) => void;
}

export const useDomainStore = create<DomainStore>((set, get) => ({
  domains: [],
  loading: false,
  error: null,
  detail: null,
  detailVisible: false,

  loadDomains: async () => {
    set({ loading: true, error: null });
    try {
      const domains = await domainApi.getDomains();
      set({ domains, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể tải danh sách lĩnh vực';
      set({ error: errorMessage, loading: false });
    }
  },

  loadDetail: async (id: string) => {
    try {
      const detail = await domainApi.getDomainById(id);
      set({ detail, detailVisible: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể tải chi tiết lĩnh vực';
      set({ error: errorMessage });
      throw error;
    }
  },

  closeDetail: () => {
    set({ detail: null, detailVisible: false });
  },

  removeDomainById: (id: string) => {
    const { domains } = get();
    const updatedDomains = domains.filter(domain => domain.id !== id);
    set({ domains: updatedDomains });
  },

  updateDomainInList: (updatedDomain: DomainSummary) => {
    const { domains } = get();
    const updatedDomains = domains.map(domain => 
      domain.id === updatedDomain.id ? updatedDomain : domain
    );
    set({ domains: updatedDomains });
  },
}));