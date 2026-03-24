import { CompaniesFeature } from '@/features/companies';
import { MainLayout } from '@/components/layout/MainLayout';

const CompaniesPage = () => {
  return (
    <MainLayout fullWidth>
      <CompaniesFeature />
    </MainLayout>
  );
};

export default CompaniesPage;
