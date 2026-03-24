export interface BlogPostSummary {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  category: string;
  date: string;
  readTime: string;
  views: number;
  source: 'platform' | 'company';
}

export interface BlogPostDetail extends BlogPostSummary {
  content: string;
  tags: string[];
  image?: string | null;
}

export interface CreateBlogPostPayload {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  readTime: string;
  image?: string | null;
  tags?: string[];
}

