import { httpRequest } from '../../../shared/api/httpClient';
import type { BlogPostDetail, BlogPostSummary } from '../types/blogTypes';

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

  async deletePost(id: string): Promise<void> {
    await httpRequest<void>(`/blog/posts/${id}`, { method: 'DELETE' });
  },
};

