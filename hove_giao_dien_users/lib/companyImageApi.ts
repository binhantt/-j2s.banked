import { api } from './api';

export interface CompanyImage {
  id?: number;
  companyId: number;
  imageUrl: string;
  description?: string;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const companyImageApi = {
  // Get images by company
  getImagesByCompany: async (companyId: number): Promise<CompanyImage[]> => {
    const response = await api.get(`/api/company-images/company/${companyId}`);
    return response.data;
  },

  // Get single image
  getImage: async (id: number): Promise<CompanyImage> => {
    const response = await api.get(`/api/company-images/${id}`);
    return response.data;
  },

  // Create image
  createImage: async (data: CompanyImage): Promise<CompanyImage> => {
    const response = await api.post('/api/company-images', data);
    return response.data;
  },

  // Delete image
  deleteImage: async (id: number): Promise<void> => {
    await api.delete(`/api/company-images/${id}`);
  },

  // Delete all images by company
  deleteImagesByCompany: async (companyId: number): Promise<void> => {
    await api.delete(`/api/company-images/company/${companyId}`);
  },
};
