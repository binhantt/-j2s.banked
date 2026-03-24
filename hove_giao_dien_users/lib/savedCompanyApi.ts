import { api } from './api';

export const savedCompanyApi = {
  // Save a company
  saveCompany: async (userId: number, companyId: number) => {
    try {
      const response = await api.post('/api/saved-companies', {
        userId,
        companyId,
      });
      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Lưu công ty thất bại';
      console.error('❌ Lỗi lưu công ty:', msg);
      throw new Error(msg);
    }
  },

  // Get user's saved companies WITH full company details (backend returns everything in 1 call)
  getUserSavedCompanies: async (userId: number) => {
    try {
      const response = await api.get(`/api/saved-companies/user/${userId}`);
      // Backend returns: { id, userId, companyId, createdAt, company: { name, logoUrl, address, ... } }
      return response.data ?? [];
    } catch (error: any) {
      console.error('❌ Lỗi khi tải danh sách công ty đã lưu:', error?.response?.data || error?.message);
      return [];
    }
  },

  // Check if company is saved
  checkSaved: async (userId: number, companyId: number): Promise<boolean> => {
    try {
      const response = await api.get(`/api/saved-companies/check/${userId}/${companyId}`);
      return response.data ?? false;
    } catch (error: any) {
      console.error('❌ Lỗi kiểm tra trạng thái lưu công ty:', error?.response?.data || error?.message);
      return false;
    }
  },

  // Unsave a company
  unsaveCompany: async (userId: number, companyId: number) => {
    await api.delete(`/api/saved-companies/${userId}/${companyId}`);
  },
};
