import { create } from 'zustand';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorAvatar: string;
  category: string;
  image: string;
  date: string;
  readTime: string;
  views: number;
  tags: string[];
}

interface BlogStore {
  posts: BlogPost[];
  searchQuery: string;
  selectedCategory: string;
  filteredPosts: BlogPost[];
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setPosts: (posts: BlogPost[]) => void;
}

export const useBlogStore = create<BlogStore>((set, get) => ({
  posts: [],
  searchQuery: '',
  selectedCategory: 'all',
  filteredPosts: [],

  setSearchQuery: (query: string) => {
    const { posts, selectedCategory } = get();
    let filtered = posts;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((post) => post.category === selectedCategory);
    }

    if (query) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(query.toLowerCase())
      );
    }

    set({ searchQuery: query, filteredPosts: filtered });
  },

  setSelectedCategory: (category: string) => {
    const { posts, searchQuery } = get();
    let filtered = posts;

    if (category !== 'all') {
      filtered = filtered.filter((post) => post.category === category);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    set({ selectedCategory: category, filteredPosts: filtered });
  },

  setPosts: (posts: BlogPost[]) => set({ posts, filteredPosts: posts }),
}));
