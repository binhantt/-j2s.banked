import { create } from 'zustand';
import { userApi } from '../api/userApi';
import type { UserResponse } from '../api/userApi';
import type { UserAdminRow } from '../types/userTypes';

interface UsersState {
  users: UserAdminRow[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  fetchUsers: (page?: number, size?: number, userType?: string) => Promise<void>;
  setUserActive: (id: number, isActive: boolean) => void;
  createBackendUser: (data: {
    email: string;
    name: string;
    password: string;
    userType: string;
  }) => Promise<void>;
  updateUserRole: (id: number, userType: string) => Promise<void>;
  updateUserCredentials: (id: number, data: { email?: string; password?: string }) => Promise<void>;
}

function convertToUserAdminRow(user: UserResponse): UserAdminRow {
  // Determine group and role based on userType
  let group: 'user' | 'backend' = 'user';
  let role: UserAdminRow['role'] = 'job_seeker';

  if (user.userType === 'job_seeker') {
    role = 'job_seeker';
  } else if (user.userType === 'freelancer') {
    role = 'freelancer';
  } else if (user.userType === 'hr') {
    role = 'hr';
  } else if (user.userType === 'admin') {
    group = 'backend';
    role = 'admin';
  } else if (user.userType === 'super_admin') {
    group = 'backend';
    role = 'super_admin';
  } else if (user.userType === 'moderator') {
    group = 'backend';
    role = 'moderator';
  } else if (user.userType === 'support') {
    group = 'backend';
    role = 'support';
  }

  return {
    id: user.id,
    fullName: user.name,
    email: user.email,
    group,
    role,
    isActive: user.isActive,
    lastLogin: user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('vi-VN') : 'Chưa có',
    createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '',
  };
}

export const useUsersStore = create<UsersState>((set) => ({
  users: [],
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  pageSize: 100,
  loading: false,
  error: null,

  fetchUsers: async (page = 0, size = 100) => {
    set({ loading: true, error: null });
    try {
      const data = await userApi.getAllUsers(page, size);
      const users = (data.content || []).map(convertToUserAdminRow);
      set({
        users,
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
        currentPage: data.page || 0,
        pageSize: data.size || size,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Không tải được danh sách người dùng',
      });
      throw error;
    }
  },

  setUserActive: async (id: number, isActive: boolean) => {
    try {
      if (isActive) {
        await userApi.activateUser(id);
      } else {
        await userApi.deactivateUser(id);
      }

      // Update local state
      set((state) => ({
        users: state.users.map((user) => (user.id === id ? { ...user, isActive } : user)),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Không thể cập nhật trạng thái người dùng',
      });
      throw error;
    }
  },

  createBackendUser: async (data) => {
    try {
      const newUser = await userApi.createBackendUser(data);
      const userRow = convertToUserAdminRow(newUser);
      
      set((state) => ({
        users: [...state.users, userRow],
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Không thể tạo tài khoản',
      });
      throw error;
    }
  },

  updateUserRole: async (id, userType) => {
    try {
      const updatedUser = await userApi.updateUserRole(id, userType);
      const userRow = convertToUserAdminRow(updatedUser);
      
      set((state) => ({
        users: state.users.map((user) => (user.id === id ? userRow : user)),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Không thể cập nhật vai trò',
      });
      throw error;
    }
  },

  updateUserCredentials: async (id, data) => {
    try {
      const updatedUser = await userApi.updateUserCredentials(id, data);
      const userRow = convertToUserAdminRow(updatedUser);
      
      set((state) => ({
        users: state.users.map((user) => (user.id === id ? userRow : user)),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Không thể cập nhật thông tin đăng nhập',
      });
      throw error;
    }
  },
}));
