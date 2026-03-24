import { api } from './api';

export interface CompanyImage {
  id: number;
  companyId: number;
  imageUrl: string;
  title?: string;
  description?: string;
  type: 'OFFICE' | 'TEAM' | 'ACTIVITY' | 'GENERAL';
  displayOrder: number;
  createdAt: string;
}

export interface AddCompanyImageRequest {
  companyId: number;
  imageUrl: string;
  title?: string;
  description?: string;
  type?: 'OFFICE' | 'TEAM' | 'ACTIVITY' | 'GENERAL';
  displayOrder?: number;
}

export const companyImageApi = {
  // Get all images for a company
  getCompanyImages: async (companyId: number): Promise<CompanyImage[]> => {
    const response = await api.get(`/api/company-images/company/${companyId}`);
    return response.data;
  },

  // Get images by type
  getCompanyImagesByType: async (companyId: number, type: string): Promise<CompanyImage[]> => {
    const response = await api.get(`/api/company-images/company/${companyId}/type/${type}`);
    return response.data;
  },

  // Add new image
  addCompanyImage: async (request: AddCompanyImageRequest): Promise<CompanyImage> => {
    const response = await api.post('/api/company-images', request);
    return response.data;
  },

  // Delete image by ID
  deleteCompanyImage: async (imageId: number): Promise<void> => {
    await api.delete(`/api/company-images/${imageId}`);
  },

  // Delete image by URL
  deleteCompanyImageByUrl: async (companyId: number, imageUrl: string): Promise<void> => {
    await api.delete(`/api/company-images/company/${companyId}/url?imageUrl=${encodeURIComponent(imageUrl)}`);
  },
};