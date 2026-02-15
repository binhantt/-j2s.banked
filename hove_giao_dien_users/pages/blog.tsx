import { BlogFeature } from '@/features/blog';
import { MainLayout } from '@/components/layout/MainLayout';

const BlogPage = () => {
  return (
    <MainLayout>
      <BlogFeature />
    </MainLayout>
  );
};

export default BlogPage;
