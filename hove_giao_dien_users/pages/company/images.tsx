import { MainLayout } from '@/components/layout/MainLayout';
import { CompanyImagesManagement } from '@/features/companies/CompanyImagesManagement';

export default function CompanyImagesPage() {
  return (
    <MainLayout>
      <CompanyImagesManagement />
    </MainLayout>
  );
}
