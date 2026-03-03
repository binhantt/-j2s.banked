import { api } from './api';

const withUsersPathFallback = async <T>(requestWithApiPrefix: () => Promise<T>, requestWithoutApiPrefix: () => Promise<T>) => {
  try {
    return await requestWithApiPrefix();
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return requestWithoutApiPrefix();
    }
    throw error;
  }
};

export const userApi = {
  // Get user by ID
  getUser: async (id: number) => {
    const response = await withUsersPathFallback(
      () => api.get(`/api/users/${id}`),
      () => api.get(`/users/${id}`)
    );
    return response.data;
  },

  // Update user profile
  updateUser: async (id: number, data: any) => {
    const response = await withUsersPathFallback(
      () => api.put(`/api/users/${id}`, data),
      () => api.put(`/users/${id}`, data)
    );
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
