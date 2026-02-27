import { useRouter } from 'next/router';
import { CompanyDetailFeature } from '@/features/companies';
import { MainLayout } from '@/components/layout/MainLayout';

const CompanyDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <MainLayout>
      <CompanyDetailFeature companyId={id as string} />
    </MainLayout>
  );
};

export default CompanyDetailPage;
