import { create } from 'zustand';
import { usersApi } from '../api/usersApi';
import type { UserAdminRow } from '../types/userTypes';

interface UsersState {
  users: UserAdminRow[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  setUserActive: (id: number, isActive: boolean) => void;
}

export const useUsersStore = create<UsersState>((set) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const data = await usersApi.getAdminUsers();
      set({ users: data, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Không tải được danh sách tài khoản',
      });
      throw error;
    }
  },

  setUserActive: (id, isActive) => {
    set((state) => ({
      users: state.users.map((user) => (user.id === id ? { ...user, isActive } : user)),
    }));
  },
}));

