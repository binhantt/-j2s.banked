import { create } from 'zustand';
import { authApi } from '../api/authApi';
import type { AuthUser, LoginPayload } from '../types/authTypes';

interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  token: null,
  refreshToken: null,
  user: null,
  loading: false,
  error: null,

  login: async (payload) => {
    set({ loading: true, error: null });
    try {
      const response = await authApi.login(payload);
      set({
        isLoggedIn: true,
        token: response.token,
        refreshToken: response.refreshToken,
        user: {
          id: response.userId,
          email: response.email,
          name: response.name,
          avatarUrl: response.avatarUrl,
          userType: response.userType,
        },
        loading: false,
        error: null,
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Đăng nhập thất bại',
      });
      throw error;
    }
  },

  logout: () => {
    set({
      isLoggedIn: false,
      token: null,
      refreshToken: null,
      user: null,
      loading: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));

