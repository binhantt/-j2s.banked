import { MainLayout } from '@/components/layout/MainLayout';
import BlogListPage from '@/features/blog/BlogListPage';

export default function BlogPage() {
  return (
    <MainLayout>
      <BlogListPage />
    </MainLayout>
  );
}
