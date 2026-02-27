import { api } from './api';

export interface CompanyReview {
  id?: number;
  companyId: number;
  userId: number;
  rating: number;
  comment?: string;
  userName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyStats {
  averageRating: number;
  reviewCount: number;
}

export const companyReviewApi = {
  getReviewsByCompany: async (companyId: number): Promise<CompanyReview[]> => {
    const response = await api.get(`/api/company-reviews/company/${companyId}`);
    return response.data;
  },

  getCompanyStats: async (companyId: number): Promise<CompanyStats> => {
    const response = await api.get(`/api/company-reviews/company/${companyId}/stats`);
    return response.data;
  },

  getUserReview: async (companyId: number, userId: number): Promise<CompanyReview | null> => {
    try {
      const response = await api.get(`/api/company-reviews/company/${companyId}/user/${userId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  createOrUpdateReview: async (review: CompanyReview): Promise<CompanyReview> => {
    const response = await api.post('/api/company-reviews', review);
    return response.data;
  },

  deleteReview: async (id: number): Promise<void> => {
    await api.delete(`/api/company-reviews/${id}`);
  },
};
