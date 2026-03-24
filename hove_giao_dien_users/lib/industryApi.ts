import { api } from './api';

export interface Industry {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const industryApi = {
  // Get all active industries
  getAllIndustries: async (): Promise<Industry[]> => {
    const response = await api.get('/api/industries');
    return response.data;
  },

  // Get all industries (including inactive) - for admin
  getAllIndustriesAdmin: async (): Promise<Industry[]> => {
    const response = await api.get('/api/admin/industries');
    return response.data;
  },

  // Create new industry - admin only
  createIndustry: async (data: Omit<Industry, 'id' | 'createdAt' | 'updatedAt'>): Promise<Industry> => {
    const response = await api.post('/api/admin/industries', data);
    return response.data;
  },

  // Update industry - admin only
  updateIndustry: async (id: number, data: Partial<Industry>): Promise<Industry> => {
    const response = await api.put(`/api/admin/industries/${id}`, data);
    return response.data;
  },

  // Delete industry - admin only
  deleteIndustry: async (id: number): Promise<void> => {
    await api.delete(`/api/admin/industries/${id}`);
  },

  // Toggle industry status - admin only
  toggleIndustryStatus: async (id: number): Promise<Industry> => {
    const response = await api.patch(`/api/admin/industries/${id}/toggle-status`);
    return response.data;
  },
};