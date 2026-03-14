import { api } from '@/lib/api';

export interface Company {
  id: number;
  name: string;
  industry?: string;
  companySize?: string;
  address?: string;
  website?: string;
  email?: string;
  phone?: string;
  logoUrl?: string;
  description?: string;
  mission?: string;
  vision?: string;
  values?: string;
  benefits?: string;
  hrId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyFilters {
  search?: string;
  industry?: string;
  companySize?: string;
  location?: string;
}

export const companyApi = {
  // Get all companies with filters
  getCompanies: async (filters?: CompanyFilters): Promise<Company[]> => {
    try {
      const response = await api.get('/api/companies');
      return response.data;
    } catch (error) {
      console.error('Error fetching companies:', error);
      return [];
    }
  },

  // Get company by ID
  getCompany: async (id: number): Promise<Company> => {
    const response = await api.get(`/api/companies/${id}`);
    return response.data;
  },

  // Search companies
  searchCompanies: async (keyword: string): Promise<Company[]> => {
    try {
      const response = await api.get(`/api/companies/search?keyword=${keyword}`);
      return response.data;
    } catch (error) {
      console.error('Error searching companies:', error);
      return [];
    }
  },

  // Get companies by industry
  getCompaniesByIndustry: async (industry: string): Promise<Company[]> => {
    try {
      const response = await api.get(`/api/companies/industry/${industry}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching companies by industry:', error);
      return [];
    }
  },
};
