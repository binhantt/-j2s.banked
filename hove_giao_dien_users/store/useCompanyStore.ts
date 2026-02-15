import { create } from 'zustand';

export interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
  location: string;
  size: string;
  description: string;
  openJobs: number;
  rating: number;
  benefits: string[];
}

interface CompanyStore {
  companies: Company[];
  searchQuery: string;
  filteredCompanies: Company[];
  setSearchQuery: (query: string) => void;
  setCompanies: (companies: Company[]) => void;
}

export const useCompanyStore = create<CompanyStore>((set, get) => ({
  companies: [],
  searchQuery: '',
  filteredCompanies: [],

  setSearchQuery: (query: string) => {
    const { companies } = get();
    const filtered = companies.filter(
      (company) =>
        company.name.toLowerCase().includes(query.toLowerCase()) ||
        company.industry.toLowerCase().includes(query.toLowerCase()) ||
        company.location.toLowerCase().includes(query.toLowerCase())
    );
    set({ searchQuery: query, filteredCompanies: filtered });
  },

  setCompanies: (companies: Company[]) =>
    set({ companies, filteredCompanies: companies }),
}));
