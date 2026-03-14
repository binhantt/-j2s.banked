import { JobList } from './components/JobList';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { usePermissions } from '@/hooks/usePermissions';
import { useRouter } from 'next/router';

export const JobsFeature = () => {
  const { canPostJob } = usePermissions();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gray-100" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-gray-100" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-10 sm:p-12 mb-10">
          <div className="flex flex-col items-center text-center gap-4">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-black text-white">
              Danh sách việc làm
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-black">
              Tìm công việc phù hợp với bạn
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl">
              Lọc theo vị trí, loại hình và địa điểm để nhanh chóng tìm được cơ hội tiếp theo trong sự nghiệp.
            </p>

            {canPostJob && (
              <div className="mt-3">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => router.push('/jobs/post')}
                >
                  Đăng tin tuyển dụng
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-black">Danh sách việc làm</h2>
              <p className="text-sm text-gray-600">
                Tìm kiếm và khám phá những cơ hội mới nhất dành cho bạn.
              </p>
            </div>
          </div>
          <JobList />
        </div>
      </div>
    </div>
  );
};
