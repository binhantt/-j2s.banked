import { CompaniesFeature } from '@/features/companies';
import { MainLayout } from '@/components/layout/MainLayout';

const CompaniesPage = () => {
  return (
    <MainLayout>
      <CompaniesFeature />
    </MainLayout>
  );
};

export default CompaniesPage;
