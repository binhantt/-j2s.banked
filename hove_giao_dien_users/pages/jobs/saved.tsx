import SavedJobsPage from '@/features/jobs/SavedJobsPage';
import { MainLayout } from '@/components/layout/MainLayout';

export default function SavedJobsPageWithLayout() {
  return (
    <MainLayout>
      <SavedJobsPage />
    </MainLayout>
  );
}
