import JobsListPage from '@/features/jobs/JobsListPage';
import { MainLayout } from '@/components/layout/MainLayout';

export default function JobsPage() {
  return (
    <MainLayout>
      <JobsListPage />
    </MainLayout>
  );
}
