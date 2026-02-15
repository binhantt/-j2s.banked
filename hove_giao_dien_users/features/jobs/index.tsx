import { JobSearch } from './components/JobSearch';
import { JobList } from './components/JobList';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { usePermissions } from '@/hooks/usePermissions';
import { useRouter } from 'next/router';

export const JobsFeature = () => {
  const { canPostJob } = usePermissions();
  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold text-indigo-600 mb-3">
          Find Your Dream Job
        </h1>
        <p className="text-lg text-gray-600">
          Discover thousands of job opportunities
        </p>
        
        {canPostJob && (
          <div className="mt-6">
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => router.push('/jobs/post')}
              className="bg-indigo-600 hover:bg-indigo-700"
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
