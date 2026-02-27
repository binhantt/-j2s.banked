import { api } from './api';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  email: string;
  fullName: string;
  avatarUrl?: string;
  userType: string;
}

export const authApi = {
  googleLogin: async (idToken: string, userType: string = 'job_seeker'): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/google', {
      idToken,
      userType,
    });
    return response.data;
  },

  githubLogin: async (code: string, userType: string = 'job_seeker'): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/github', {
      code,
      userType,
    });
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },
};
