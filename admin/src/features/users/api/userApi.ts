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

export interface PagedUsersResponse {
  content: UserResponse[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

function buildPageParams(page: number, size: number, userType?: string): string {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (userType) params.append('userType', userType);
  return `?${params.toString()}`;
}

export const userApi = {
  async getAllUsers(page = 0, size = 20, userType?: string): Promise<PagedUsersResponse> {
    return httpRequest<PagedUsersResponse>(`/admin/users${buildPageParams(page, size, userType)}`);
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
