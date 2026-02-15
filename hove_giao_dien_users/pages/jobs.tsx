import { JobsFeature } from '@/features/jobs';
import { MainLayout } from '@/components/layout/MainLayout';

const JobsPage = () => {
  return (
    <MainLayout>
      <JobsFeature />
    </MainLayout>
  );
};

export default JobsPage;
