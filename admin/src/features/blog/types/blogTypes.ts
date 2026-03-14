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

