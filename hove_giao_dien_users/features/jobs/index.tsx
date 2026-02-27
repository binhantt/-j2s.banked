import { JobSearch } from './components/JobSearch';
import { JobList } from './components/JobList';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { usePermissions } from '@/hooks/usePermissions';
import { useRouter } from 'next/router';
import { LAYOUT } from '@/lib/constants';

export const JobsFeature = () => {
  const { canPostJob } = usePermissions();
  const router = useRouter();

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-600 mb-2">
          Tìm Việc Làm Mơ Ước
        </h1>
        <p className="text-sm text-gray-600">
          Khám phá hàng nghìn cơ hội việc làm
        </p>
        
        {canPostJob && (
          <div className="mt-4">
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
      
      <JobSearch />
      <JobList />
    </div>
  );
};
