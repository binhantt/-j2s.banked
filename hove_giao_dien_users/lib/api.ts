import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
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

// Handle response errors and auto-refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
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
          
          // Save new tokens
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      }
    }
    
    // For other 401 errors or if no refresh token
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
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
};
