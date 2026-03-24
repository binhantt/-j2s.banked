import { MainLayout } from '@/components/layout/MainLayout';
import { BlogDetailFeature } from '@/features/blog/BlogDetailFeature';
import { useRouter } from 'next/router';

export default function BlogDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id || typeof id !== 'string') {
    return (
      <MainLayout fullWidth>
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy bài viết
            </h2>
            <p className="text-gray-600">
              ID bài viết không hợp lệ
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout fullWidth>
      <BlogDetailFeature postId={id} />
    </MainLayout>
  );
}