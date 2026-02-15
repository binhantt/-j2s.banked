import { useRouter } from 'next/router';
import { JobDetailFeature } from '@/features/jobs/JobDetailFeature';
import { MainLayout } from '@/components/layout/MainLayout';

const JobDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;

  // Wait for router to be ready
  if (!router.isReady || !id) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <div>Đang tải...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <JobDetailFeature jobId={id as string} />
    </MainLayout>
  );
};

export default JobDetailPage;
