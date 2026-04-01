import { api } from './api';

export interface CompanyBlog {
  id?: number;
  companyId: number;
  title: string;
  content: string;
  imageUrl?: string;
  authorName: string;
  status: 'draft' | 'published';
  category?: string;
  facebookLink?: string;
  instagramLink?: string;
  zaloLink?: string;
  tags?: string;
  views?: number;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const companyBlogApi = {
  // Get all blogs
  getAllBlogs: async () => {
    try {
      const response = await api.get('/api/company-blogs');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching all blogs:', error);
      throw new Error(error.response?.data?.message || 'Không thể tải danh sách blog');
    }
  },

  // Get blogs by company
  getBlogsByCompany: async (companyId: number) => {
    try {
      const response = await api.get(`/api/company-blogs/company/${companyId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching blogs by company:', error);
      throw new Error(error.response?.data?.message || 'Không thể tải blog của công ty');
    }
  },

  // Get blogs by HR
  getBlogsByHR: async (hrId: number) => {
    try {
      const response = await api.get(`/api/company-blogs/hr/${hrId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching blogs by HR:', error);
      throw new Error(error.response?.data?.message || 'Không thể tải blog của HR');
    }
  },

  // Get blogs by status
  getBlogsByStatus: async (status: string) => {
    try {
      const response = await api.get(`/api/company-blogs/status/${status}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching blogs by status:', error);
      throw new Error(error.response?.data?.message || 'Không thể tải blog theo trạng thái');
    }
  },

  // Get single blog by numeric ID
  getBlog: async (id: number) => {
    try {
      const response = await api.get(`/api/company-blogs/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching blog:', error);
      throw new Error(error.response?.data?.message || 'Không thể tải blog');
    }
  },

  // Get single blog by reference (e.g., "company_2")
  getBlogByRef: async (ref: string) => {
    try {
      const response = await api.get(`/api/company-blogs/by-ref/${ref}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching blog by ref:', error);
      throw new Error(error.response?.data?.message || 'Không thể tải blog');
    }
  },

  // Create blog
  createBlog: async (data: CompanyBlog) => {
    try {
      const response = await api.post('/api/company-blogs', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating blog:', error);
      throw new Error(error.response?.data?.message || 'Không thể tạo blog');
    }
  },

  // Update blog
  updateBlog: async (id: number, data: CompanyBlog) => {
    try {
      const response = await api.put(`/api/company-blogs/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating blog:', error);
      throw new Error(error.response?.data?.message || 'Không thể cập nhật blog');
    }
  },

  // Delete blog
  deleteBlog: async (id: number) => {
    try {
      await api.delete(`/api/company-blogs/${id}`);
    } catch (error: any) {
      console.error('Error deleting blog:', error);
      throw new Error(error.response?.data?.message || 'Không thể xóa blog');
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get('/api/blog-categories/active');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },
};
