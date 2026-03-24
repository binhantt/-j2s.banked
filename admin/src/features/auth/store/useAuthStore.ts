import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/authApi';
import { BannedException } from '../../../shared/api/httpClient';
import type { AuthUser, LoginPayload } from '../types/authTypes';

interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  bannedError: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  clearBannedError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      token: null,
      refreshToken: null,
      user: null,
      loading: false,
      error: null,
      bannedError: null,

      login: async (payload) => {
        set({ loading: true, error: null, bannedError: null });
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
            bannedError: null,
          });
        } catch (error) {
          if (error instanceof BannedException) {
            set({
              loading: false,
              error: null,
              bannedError: error.message,
            });
          } else {
            set({
              loading: false,
              error: error instanceof Error ? error.message : 'Đăng nhập thất bại',
              bannedError: null,
            });
          }
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
          bannedError: null,
        });
      },

      clearError: () => set({ error: null }),
      clearBannedError: () => set({ bannedError: null }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);

