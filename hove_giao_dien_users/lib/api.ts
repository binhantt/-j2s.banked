import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Increase timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  maxRedirects: 5,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Don't override Content-Type if it's already set (for file uploads)
  if (config.headers['Content-Type'] === 'multipart/form-data') {
    delete config.headers['Content-Type']; // Let browser set it with boundary
  }
  
  return config;
});

// Helper: clear auth and redirect to login
function handleLogout(bannedMessage?: string) {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  if (typeof window !== 'undefined') {
    if (bannedMessage) {
      sessionStorage.setItem('bannedMessage', bannedMessage);
    }
    window.location.href = '/login';
  }
}

// Handle response errors and auto-refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ── Check if banned (403 with banned: true) ──
    if (error.response?.status === 403 && error.response?.data?.banned === true) {
      const bannedMessage = error.response?.data?.message || 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.';
      handleLogout(bannedMessage);
      return Promise.reject(error);
    }

    // If 401 and haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/api/auth/refresh`, {
            refreshToken
          });

          const { token, refreshToken: newRefreshToken } = response.data;

          // ── Check if refresh returned banned empty response ──
          if (!token || !response.data?.userId) {
            handleLogout('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
            return Promise.reject(new Error('banned'));
          }

          // Save new tokens
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (refreshError: any) {
          // Refresh failed, logout user
          handleLogout();
          return Promise.reject(refreshError);
        }
      }
    }

    // For other 401 errors or if no refresh token
    if (error.response?.status === 401) {
      handleLogout();
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  googleLogin: async (idToken: string, userType?: 'job_seeker' | 'freelancer' | 'hr') => {
    const response = await api.post('/api/auth/google', { idToken, userType });
    return response.data;
  },

  githubLogin: async (code: string, userType?: 'job_seeker' | 'freelancer' | 'hr') => {
    const response = await api.post('/api/auth/github', { code, userType });
    return response.data;
  },

  facebookLogin: async (accessToken: string, userType?: 'job_seeker' | 'freelancer' | 'hr') => {
    const response = await api.post('/api/auth/facebook', { accessToken, userType });
    return response.data;
  },

  /** Dùng /api/auth/refresh để kiểm tra tài khoản có bị banned không.
   *  Trả về { banned: true } nếu bị banned, hoặc {} nếu bình thường. */
  checkStatus: async (token?: string | null): Promise<{ banned?: boolean }> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return {};
    const response = await axios.post(`${API_URL}/api/auth/refresh`, {
      refreshToken,
    });
    // Nếu backend trả empty DTO với null token → tài khoản bị banned
    if (!response.data?.token) {
      return { banned: true };
    }
    return {};
  },
};
