import { api } from './api';

export interface CompanyBlog {
  id?: number;
  companyId: number;
  title: string;
  content: string;
  imageUrl?: string;
  authorName: string;
  status: 'draft' | 'published';
  views?: number;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const companyBlogApi = {
  // Get all blogs
  getAllBlogs: async () => {
    const response = await api.get('/api/company-blogs');
    return response.data;
  },

  // Get blogs by company
  getBlogsByCompany: async (companyId: number) => {
    const response = await api.get(`/api/company-blogs/company/${companyId}`);
    return response.data;
  },

  // Get blogs by HR
  getBlogsByHR: async (hrId: number) => {
    const response = await api.get(`/api/company-blogs/hr/${hrId}`);
    return response.data;
  },

  // Get blogs by status
  getBlogsByStatus: async (status: string) => {
    const response = await api.get(`/api/company-blogs/status/${status}`);
    return response.data;
  },

  // Get single blog
  getBlog: async (id: number) => {
    const response = await api.get(`/api/company-blogs/${id}`);
    return response.data;
  },

  // Create blog
  createBlog: async (data: CompanyBlog) => {
    const response = await api.post('/api/company-blogs', data);
    return response.data;
  },

  // Update blog
  updateBlog: async (id: number, data: CompanyBlog) => {
    const response = await api.put(`/api/company-blogs/${id}`, data);
    return response.data;
  },

  // Delete blog
  deleteBlog: async (id: number) => {
    await api.delete(`/api/company-blogs/${id}`);
  },
};
