import { httpRequest } from '../../../shared/api/httpClient';
import type { BlogPostDetail, BlogPostSummary, CreateBlogPostPayload } from '../types/blogTypes';

export const blogApi = {
  async getPosts(): Promise<BlogPostSummary[]> {
    const data = await httpRequest<BlogPostDetail[]>('/blog/posts');
    return data.map((post) => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      author: post.author,
      category: post.category,
      date: post.date,
      readTime: post.readTime,
      views: post.views,
      source: post.source,
    }));
  },

  async getPostById(id: string): Promise<BlogPostDetail> {
    return httpRequest<BlogPostDetail>(`/blog/posts/${id}`);
  },

  async createPost(payload: CreateBlogPostPayload): Promise<BlogPostDetail> {
    // Convert tags array to comma-separated string for backend
    const data = {
      title: payload.title,
      excerpt: payload.excerpt,
      content: payload.content,
      author: payload.author,
      authorAvatar: null, // Optional field
      category: payload.category,
      readTime: payload.readTime,
      image: payload.image || null,
      tags: Array.isArray(payload.tags) ? payload.tags.join(',') : (payload.tags || ''),
      facebookLink: payload.facebookLink || '',
      instagramLink: payload.instagramLink || '',
      zaloLink: payload.zaloLink || '',
      source: 'platform', // Admin creates platform blogs
      companyId: null, // Not needed for platform blogs
    };
    
    console.log('Sending blog post data:', data);
    
    return httpRequest<BlogPostDetail>('/blog/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deletePost(id: string): Promise<void> {
    await httpRequest<void>(`/blog/posts/${id}`, { method: 'DELETE' });
  },

  async getCategories(): Promise<any[]> {
    return httpRequest<any[]>('/blog-categories');
  },

  async getActiveCategories(): Promise<any[]> {
    return httpRequest<any[]>('/blog-categories/active');
  },

  async createCategory(data: any): Promise<any> {
    return httpRequest<any>('/blog-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCategory(id: number, data: any): Promise<any> {
    return httpRequest<any>(`/blog-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteCategory(id: number): Promise<void> {
    await httpRequest<void>(`/blog-categories/${id}`, { method: 'DELETE' });
  },
};

