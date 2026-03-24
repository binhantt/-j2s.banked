import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { message } from 'antd';
import { authApi } from '@/lib/api';

interface User {
  id: number;
  userId?: number; // Added for cross-compatibility
  name: string;
  email: string;
  avatarUrl?: string;
  userType: 'job_seeker' | 'freelancer' | 'hr' | 'admin' | 'super_admin';
  companyId?: number;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  login: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  updateUserAvatar: (avatarUrl: string | null) => void;
  googleLogin: (idToken: string, userType?: 'job_seeker' | 'freelancer' | 'hr') => Promise<void>;
  githubLogin: (code: string, userType?: 'job_seeker' | 'freelancer' | 'hr') => Promise<void>;
  facebookLogin: (accessToken: string, userType?: 'job_seeker' | 'freelancer' | 'hr') => Promise<void>;
  checkBannedStatus: () => Promise<boolean>;
  initAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      checkBannedStatus: async (): Promise<boolean> => {
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');
        if (!token && !refreshToken) return false;

        try {
          const res = await authApi.checkStatus(token || refreshToken);
          if (res.banned === true) {
            get().logout();
            message.error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
            if (typeof window !== 'undefined') window.location.href = '/login';
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      initAuth: () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            // Robust mapping: ensure both id and userId are present and are numbers
            if (!user.id && user.userId) user.id = Number(user.userId);
            if (!user.userId && user.id) user.userId = Number(user.id);
            if (user.id) user.id = Number(user.id);
            if (user.userId) user.userId = Number(user.userId);

            set({ user, isAuthenticated: true, _hasHydrated: true });
          } catch (e) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } else {
          // No stored user, but we still need to signal hydration is done
          set({ _hasHydrated: true });
        }
      },
      
      login: (user: User, token: string, refreshToken?: string) => {
        // Robust mapping: ensure both id and userId are present and are numbers
        const normalizedUser = { ...user };
        const rawId = normalizedUser.id || (normalizedUser as any).userId;
        if (rawId) {
          normalizedUser.id = Number(rawId);
          (normalizedUser as any).userId = Number(rawId);
        }
        
        localStorage.setItem('token', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        set({ user: normalizedUser, isAuthenticated: true, error: null });
      },
      
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        set({ user: null, isAuthenticated: false });
      },

      updateUser: (user: User) => {
        // Ensure robust ID mapping during update
        const updatedUser = { ...user };
        const rawId = updatedUser.id || (updatedUser as any).userId;
        if (rawId) {
          updatedUser.id = Number(rawId);
          (updatedUser as any).userId = Number(rawId);
        }

        localStorage.setItem('user', JSON.stringify(updatedUser));
        set({ user: updatedUser });
      },

      updateUserAvatar: (avatarUrl: string | null) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, avatarUrl: avatarUrl || undefined };
          // Ensure robust ID mapping during update
          if (!updatedUser.id && (updatedUser as any).userId) updatedUser.id = (updatedUser as any).userId;
          if (!(updatedUser as any).userId && updatedUser.id) (updatedUser as any).userId = updatedUser.id;
          
          localStorage.setItem('user', JSON.stringify(updatedUser));
          set({ user: updatedUser });
        }
      },

      googleLogin: async (idToken: string, userType?: 'job_seeker' | 'freelancer' | 'hr') => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.googleLogin(idToken, userType);
          const user: User = {
            id: response.userId || response.id,
            userId: response.userId || response.id,
            name: response.name || response.fullName || response.email?.split('@')[0],
            email: response.email,
            avatarUrl: response.avatarUrl,
            userType: response.userType,
          };
          get().login(user, response.token, response.refreshToken);
          set({ isLoading: false });
        } catch (error: any) {
          // Nếu interceptor đã xử lý banned (redirect rồi) thì không hiển thị lỗi
          const isBanned = error.response?.data?.banned === true;
          set({
            error: isBanned ? null : (error.response?.data?.message || 'Đăng nhập thất bại'),
            isLoading: false,
          });
          throw error;
        }
      },

      githubLogin: async (code: string, userType?: 'job_seeker' | 'freelancer' | 'hr') => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.githubLogin(code, userType);
          const user: User = {
            id: response.userId || response.id,
            userId: response.userId || response.id,
            name: response.name || response.fullName || response.email?.split('@')[0],
            email: response.email,
            avatarUrl: response.avatarUrl,
            userType: response.userType,
          };
          get().login(user, response.token, response.refreshToken);
          set({ isLoading: false });
        } catch (error: any) {
          const isBanned = error.response?.data?.banned === true;
          set({
            error: isBanned ? null : (error.response?.data?.message || 'Đăng nhập GitHub thất bại'),
            isLoading: false,
          });
          throw error;
        }
      },

      facebookLogin: async (accessToken: string, userType?: 'job_seeker' | 'freelancer' | 'hr') => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.facebookLogin(accessToken, userType);
          const user: User = {
            id: response.userId || response.id,
            userId: response.userId || response.id,
            name: response.name || response.fullName || response.email?.split('@')[0],
            email: response.email,
            avatarUrl: response.avatarUrl,
            userType: response.userType,
          };
          get().login(user, response.token, response.refreshToken);
          set({ isLoading: false });
        } catch (error: any) {
          const isBanned = error.response?.data?.banned === true;
          set({
            error: isBanned ? null : (error.response?.data?.message || 'Đăng nhập Facebook thất bại'),
            isLoading: false,
          });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Ensure userId/id normalization after rehydration
        if (state?.user) {
          const rawId = state.user.id || (state.user as any).userId;
          if (rawId) {
            state.user.id = Number(rawId);
            (state.user as any).userId = Number(rawId);
          }
        }
        // Signal that hydration is complete (use raw set, not action, to avoid TS issues)
        if (state) {
          (state as any)._hasHydrated = true;
        }
      },
    }
  )
);
