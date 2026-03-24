import { httpRequest } from '../../../shared/api/httpClient';

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: string;
  userType: string;
  phone?: string;
  currentPosition?: string;
  hometown?: string;
  currentLocation?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const userApi = {
  async getAllUsers(): Promise<UserResponse[]> {
    return httpRequest<UserResponse[]>('/admin/users');
  },

  async getUserById(id: number): Promise<UserResponse> {
    return httpRequest<UserResponse>(`/admin/users/${id}`);
  },

  async toggleUserStatus(id: number): Promise<{ id: number; isActive: boolean; message: string }> {
    return httpRequest<{ id: number; isActive: boolean; message: string }>(`/admin/users/${id}/toggle-status`, {
      method: 'PUT',
    });
  },

  async activateUser(id: number): Promise<UserResponse> {
    return httpRequest<UserResponse>(`/admin/users/${id}/activate`, {
      method: 'PUT',
    });
  },

  async deactivateUser(id: number): Promise<UserResponse> {
    return httpRequest<UserResponse>(`/admin/users/${id}/deactivate`, {
      method: 'PUT',
    });
  },

  async createBackendUser(data: {
    email: string;
    name: string;
    password: string;
    userType: string;
  }): Promise<UserResponse> {
    return httpRequest<UserResponse>('/admin/users/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateUserRole(id: number, userType: string): Promise<UserResponse> {
    return httpRequest<UserResponse>(`/admin/users/${id}/update-role`, {
      method: 'PUT',
      body: JSON.stringify({ userType }),
    });
  },

  async updateUserCredentials(
    id: number,
    data: { email?: string; password?: string }
  ): Promise<UserResponse> {
    return httpRequest<UserResponse>(`/admin/users/${id}/update-credentials`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
