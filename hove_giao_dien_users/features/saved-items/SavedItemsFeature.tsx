import { useEffect } from 'react';
import { Card, Spin, message, Modal } from 'antd';
import { HeartFilled } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuthStore } from '@/store/useAuthStore';
import { useSavedItemsStore } from './store/useSavedItemsStore';
import { SavedItemsTabs } from './components/SavedItemsTabs';

export const SavedItemsFeature = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const {
    savedCompanies,
    savedJobs,
    loadingCompanies,
    loadingJobs,
    fetchSavedCompanies,
    fetchSavedJobs,
    unsaveCompany,
    unsaveJob,
  } = useSavedItemsStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.id) {
      fetchSavedCompanies(user.id);
      fetchSavedJobs(user.id);
    }
  }, [isAuthenticated, user?.id, router, fetchSavedCompanies, fetchSavedJobs]);

  const confirmUnsaveCompany = (companyId: number, companyName: string) => {
    if (!user?.id) return;

    Modal.confirm({
      title: 'Xác nhận bỏ lưu',
      content: `Bạn có chắc chắn muốn bỏ lưu công ty "${companyName}"?`,
      okText: 'Bỏ lưu',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await unsaveCompany(user.id, companyId);
          message.success('Đã bỏ lưu công ty');
          fetchSavedCompanies(user.id);
        } catch (error) {
          console.error('Error unsaving company:', error);
          message.error('Có lỗi xảy ra');
        }
      },
    });
  };

  const confirmUnsaveJob = (jobId: number, jobTitle: string) => {
    if (!user?.id) return;

    Modal.confirm({
      title: 'Xác nhận bỏ lưu',
      content: `Bạn có chắc chắn muốn bỏ lưu việc làm "${jobTitle}"?`,
      okText: 'Bỏ lưu',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await unsaveJob(user.id, jobId);
          message.success('Đã bỏ lưu việc làm');
          fetchSavedJobs(user.id);
        } catch (error) {
          console.error('Error unsaving job:', error);
          message.error('Có lỗi xảy ra');
        }
      },
    });
  };

  if (!user) return null;

  const totalItems = savedJobs.length + savedCompanies.length;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card
          title={
            <div className="flex items-center gap-3">
              <HeartFilled className="text-red-500 text-2xl" />
              <div>
                <h1 className="text-2xl font-bold m-0">Thư mục đã lưu</h1>
                <p className="text-gray-500 text-sm m-0 font-normal">
                  {totalItems} mục đã lưu
                </p>
              </div>
            </div>
          }
          className="shadow-sm"
        >
          <SavedItemsTabs
            loadingJobs={loadingJobs}
            loadingCompanies={loadingCompanies}
            savedJobs={savedJobs}
            savedCompanies={savedCompanies}
            onViewJob={(id) => router.push(`/jobs/${id}`)}
            onUnsaveJob={confirmUnsaveJob}
            onViewCompany={(id) => router.push(`/companies/${id}`)}
            onUnsaveCompany={confirmUnsaveCompany}
            onGoJobs={() => router.push('/jobs')}
            onGoCompanies={() => router.push('/companies')}
          />
        </Card>
      </div>
    </MainLayout>
  );
};
