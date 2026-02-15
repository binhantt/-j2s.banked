import { useRouter } from 'next/router';
import { BlogDetailFeature } from '@/features/blog/BlogDetailFeature';
import { MainLayout } from '@/components/layout/MainLayout';

const BlogDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <MainLayout>
      <BlogDetailFeature postId={id as string} />
    </MainLayout>
  );
};

export default BlogDetailPage;
