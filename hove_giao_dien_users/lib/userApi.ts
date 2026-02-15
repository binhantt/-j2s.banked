import { api } from './api';

export const userApi = {
  // Get user by ID
  getUser: async (id: number) => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  // Update user profile
  updateUser: async (id: number, data: any) => {
    const response = await api.put(`/api/users/${id}`, data);
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/api/users/${id}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete avatar
  deleteAvatar: async (id: number) => {
    const response = await api.delete(`/api/users/${id}/avatar`);
    return response.data;
  },
};
