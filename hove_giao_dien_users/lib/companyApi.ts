import { api } from './api';

export interface Company {
  id?: number;
  hrId: number;
  name: string;
  logoUrl?: string;
  industry?: string;
  companySize?: string;
  foundedYear?: number;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
  mission?: string;
  vision?: string;
  values?: string;
  benefits?: string;
  workingHours?: string;
  imageGallery?: string; // JSON string of image URLs
  createdAt?: string;
  updatedAt?: string;
}

export const companyApi = {
  // Get all companies
  getAllCompanies: async () => {
    const response = await api.get('/api/companies');
    return response.data;
  },

  // Get company by ID
  getCompany: async (id: number) => {
    const response = await api.get(`/api/companies/${id}`);
    return response.data;
  },

  // Get company by HR ID
  getCompanyByHrId: async (hrId: number) => {
    const response = await api.get(`/api/companies/hr/${hrId}`);
    return response.data;
  },

  // Create company
  createCompany: async (data: Company) => {
    const response = await api.post('/api/companies', data);
    return response.data;
  },

  // Update company
  updateCompany: async (id: number, data: Company) => {
    const response = await api.put(`/api/companies/${id}`, data);
    return response.data;
  },

  // Delete company
  deleteCompany: async (id: number) => {
    await api.delete(`/api/companies/${id}`);
  },
};
