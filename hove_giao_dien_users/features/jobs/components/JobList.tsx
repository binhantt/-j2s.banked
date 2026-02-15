import { useEffect, useState } from 'react';
import { Row, Col, Empty, Spin, message } from 'antd';
import { useJobStore } from '@/store/useJobStore';
import { JobCard } from './JobCard';
import { jobApi } from '@/lib/jobApi';
import { applicationApi } from '@/lib/applicationApi';
import { useAuthStore } from '@/store/useAuthStore';

export const JobList = () => {
  const { filteredJobs, setJobs } = useJobStore();
  const [loading, setLoading] = useState(false);
  const [acceptedJobIds, setAcceptedJobIds] = useState<number[]>([]);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    loadJobs();
    if (isAuthenticated && user?.id) {
      loadAcceptedApplications();
    }
  }, [isAuthenticated, user?.id]);

  const loadAcceptedApplications = async () => {
    try {
      const applications = await applicationApi.getUserApplications(user.id);
      const acceptedIds = applications
        .filter((app: any) => app.status === 'accepted')
        .map((app: any) => app.jobPostingId);
      setAcceptedJobIds(acceptedIds);
    } catch (error) {
      console.error('Load accepted applications error:', error);
    }
  };

  const loadJobs = async () => {
    setLoading(true);
    try {
      // Load active jobs only
      const data = await jobApi.getActiveJobs();
      setJobs(data);
    } catch (error) {
      console.error('Load jobs error:', error);
      message.error('Không thể tải danh sách việc làm');
    } finally {
      setLoading(false);
    }
  };

  // Filter out jobs that user has been accepted for
  const displayJobs = filteredJobs.filter(job => !acceptedJobIds.includes(job.id));

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Spin size="large" />
      </div>
    );
  }

  if (displayJobs.length === 0) {
    return (
      <div className="flex justify-center items-center py-16">
        <Empty description="Không tìm thấy việc làm phù hợp" />
      </div>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {displayJobs.map((job) => (
        <Col key={job.id} xs={24} sm={24} md={12} lg={8}>
          <JobCard job={job} />
        </Col>
      ))}
    </Row>
  );
};
