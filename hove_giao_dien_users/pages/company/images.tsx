import { MainLayout } from '@/components/layout/MainLayout';
import { ImageGalleryManagementSection } from '@/features/profile/components/ImageGalleryManagementSection';

export default function CompanyImagesPage() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ImageGalleryManagementSection />
      </div>
    </MainLayout>
  );
}
