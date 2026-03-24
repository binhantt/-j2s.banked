import { api } from './api';

export interface PlatformBlog {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorAvatar?: string;
  category: string;
  image?: string;
  date: string;
  readTime: string;
  views: number;
  source: 'platform' | 'company';
  tags?: string[];
  companyId?: number;
}

export const blogApi = {
  // Get all blogs (platform + company)
  getAllBlogs: async (source?: 'platform' | 'company'): Promise<PlatformBlog[]> => {
    const params = source ? { source } : {};
    const response = await api.get('/api/blog/posts', { params });
    return response.data;
  },

  // Get single blog by ID
  getBlogById: async (id: string): Promise<PlatformBlog> => {
    const response = await api.get(`/api/blog/posts/${id}`);
    return response.data;
  },

  // Create platform blog (admin only)
  createBlog: async (data: Partial<PlatformBlog>): Promise<PlatformBlog> => {
    const response = await api.post('/api/blog/posts', data);
    return response.data;
  },

  // Update platform blog (admin only)
  updateBlog: async (id: string, data: Partial<PlatformBlog>): Promise<PlatformBlog> => {
    const response = await api.put(`/api/blog/posts/${id}`, data);
    return response.data;
  },

  // Delete platform blog (admin only)
  deleteBlog: async (id: string): Promise<void> => {
    await api.delete(`/api/blog/posts/${id}`);
  },
};
