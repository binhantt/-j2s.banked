import { create } from 'zustand';
import { blogApi } from '../api/blogApi';
import type { BlogPostDetail, BlogPostSummary } from '../types/blogTypes';

interface BlogState {
  posts: BlogPostSummary[];
  loading: boolean;
  error: string | null;
  detail: BlogPostDetail | null;
  detailVisible: boolean;
  loadPosts: () => Promise<void>;
  loadDetail: (id: string) => Promise<void>;
  closeDetail: () => void;
  removePostById: (id: string) => void;
}

export const useBlogStore = create<BlogState>((set) => ({
  posts: [],
  loading: false,
  error: null,
  detail: null,
  detailVisible: false,

  loadPosts: async () => {
    set({ loading: true, error: null });
    try {
      const data = await blogApi.getPosts();
      set({ posts: data, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Không tải được danh sách blog',
      });
      throw error;
    }
  },

  loadDetail: async (id: string) => {
    set({ error: null });
    try {
      const data = await blogApi.getPostById(id);
      set({ detail: data, detailVisible: true });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Không tải được chi tiết bài viết',
      });
      throw error;
    }
  },

  closeDetail: () => set({ detailVisible: false }),

  removePostById: (id: string | number) =>
    set((state) => ({
      posts: state.posts.filter((post) => String(post.id) !== String(id)),
    })),
}));

