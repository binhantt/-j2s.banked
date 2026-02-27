import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  userType: 'job_seeker' | 'freelancer' | 'hr';
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  updateUserAvatar: (avatarUrl: string | null) => void;
  googleLogin: (idToken: string, userType?: 'job_seeker' | 'freelancer' | 'hr') => Promise<void>;
  githubLogin: (code: string, userType?: 'job_seeker' | 'freelancer' | 'hr') => Promise<void>;
  facebookLogin: (accessToken: string, userType?: 'job_seeker' | 'freelancer' | 'hr') => Promise<void>;
  initAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      initAuth: () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            set({ user, isAuthenticated: true });
          } catch (e) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      },
      
      login: (user: User, token: string, refreshToken?: string) => {
        localStorage.setItem('token', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, isAuthenticated: true, error: null });
      },
      
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        set({ user: null, isAuthenticated: false });
      },

      updateUser: (user: User) => {
        localStorage.setItem('user', JSON.stringify(user));
        set({ user });
      },

      updateUserAvatar: (avatarUrl: string | null) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, avatarUrl: avatarUrl || undefined };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          set({ user: updatedUser });
        }
      },

      googleLogin: async (idToken: string, userType?: 'job_seeker' | 'freelancer' | 'hr') => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.googleLogin(idToken, userType);
          const user: User = {
            id: response.userId,
            name: response.name,
            email: response.email,
            avatarUrl: response.avatarUrl,
            userType: response.userType,
          };
          get().login(user, response.token, response.refreshToken);
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Đăng nhập thất bại',
            isLoading: false 
          });
          throw error;
        }
      },

      githubLogin: async (code: string, userType?: 'job_seeker' | 'freelancer' | 'hr') => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.githubLogin(code, userType);
          const user: User = {
            id: response.userId,
            name: response.name,
            email: response.email,
            avatarUrl: response.avatarUrl,
            userType: response.userType,
          };
          get().login(user, response.token, response.refreshToken);
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Đăng nhập GitHub thất bại',
            isLoading: false 
          });
          throw error;
        }
      },

      facebookLogin: async (accessToken: string, userType?: 'job_seeker' | 'freelancer' | 'hr') => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.facebookLogin(accessToken, userType);
          const user: User = {
            id: response.userId,
            name: response.name,
            email: response.email,
            avatarUrl: response.avatarUrl,
            userType: response.userType,
          };
          get().login(user, response.token, response.refreshToken);
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Đăng nhập Facebook thất bại',
            isLoading: false 
          });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
