import { api } from './api';

export interface Domain {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  jobCount?: number;
  createdAt: string;
  updatedAt: string;
}

export const domainApi = {
  // Get all active domains for user selection
  getActiveDomains: async (): Promise<Domain[]> => {
    try {
      const response = await api.get('/api/domains/status/true');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching active domains:', error);
      throw new Error(error.response?.data?.message || 'Không thể tải danh sách lĩnh vực');
    }
  },

  // Get all domains (for admin or other purposes)
  getAllDomains: async (): Promise<Domain[]> => {
    try {
      const response = await api.get('/api/domains');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching all domains:', error);
      throw new Error(error.response?.data?.message || 'Không thể tải danh sách lĩnh vực');
    }
  },

  // Get domain by ID
  getDomainById: async (id: number): Promise<Domain | null> => {
    try {
      const response = await api.get(`/api/domains/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Domain not found — return null so DomainDisplay shows "Không xác định"
        return null;
      }
      console.error('Error fetching domain:', error);
      throw new Error(error.response?.data?.message || 'Không thể tải thông tin lĩnh vực');
    }
  },
};