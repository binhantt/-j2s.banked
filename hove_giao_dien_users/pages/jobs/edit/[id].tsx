import PostJobPage from '@/features/jobs/PostJobPage';
import { MainLayout } from '@/components/layout/MainLayout';

export default function EditJobPageWithLayout() {
  return (
    <MainLayout>
      <PostJobPage />
    </MainLayout>
  );
}
