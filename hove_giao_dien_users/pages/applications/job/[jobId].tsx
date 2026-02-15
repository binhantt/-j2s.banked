import JobApplicationsPage from '@/features/applications/JobApplicationsPage';
import { MainLayout } from '@/components/layout/MainLayout';

export default function JobApplicationsPageWithLayout() {
  return (
    <MainLayout>
      <JobApplicationsPage />
    </MainLayout>
  );
}
