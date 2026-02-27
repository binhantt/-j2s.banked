import { api } from './api';

export const savedCompanyApi = {
  // Save a company
  saveCompany: async (userId: number, companyId: number) => {
    const response = await api.post('/api/saved-companies', {
      userId,
      companyId,
    });
    return response.data;
  },

  // Get user's saved companies
  getUserSavedCompanies: async (userId: number) => {
    const response = await api.get(`/api/saved-companies/user/${userId}`);
    return response.data;
  },

  // Check if company is saved
  checkSaved: async (userId: number, companyId: number) => {
    const response = await api.get(`/api/saved-companies/check/${userId}/${companyId}`);
    return response.data;
  },

  // Unsave a company
  unsaveCompany: async (userId: number, companyId: number) => {
    await api.delete(`/api/saved-companies/${userId}/${companyId}`);
  },
};
