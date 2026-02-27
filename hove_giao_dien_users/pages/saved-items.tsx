import { useState, useEffect } from 'react';
import { Card, Tabs, Row, Col, Button, message, Empty, Spin, Avatar, Tag, Modal } from 'antd';
import { 
  HeartFilled, 
  EyeOutlined, 
  EnvironmentOutlined, 
  TeamOutlined,
  GlobalOutlined,
  DeleteOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { MainLayout } from '@/components/layout/MainLayout';
import { savedCompanyApi } from '@/lib/savedCompanyApi';
import { savedJobApi } from '@/lib/savedJobApi';
import { companyApi } from '@/lib/companyApi';
import { useAuthStore } from '@/store/useAuthStore';
import dayjs from 'dayjs';

interface SavedCompanyWithDetails {
  id: number;
  userId: number;
  companyId: number;
  createdAt: string;
  company?: any;
}

interface SavedJob {
  id: number;
  userId: number;
  jobId: number;
  createdAt: string;
  job?: any;
}

export default function SavedItemsPage() {
  const [savedCompanies, setSavedCompanies] = useState<SavedCompanyWithDetails[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      loadSavedCompanies();
      loadSavedJobs();
    }
  }, [user, isAuthenticated, router]);

  const loadSavedCompanies = async () => {
    if (!user) return;

    setLoadingCompanies(true);
    try {
      const saved = await savedCompanyApi.getUserSavedCompanies(user.id);
      
      const companiesWithDetails = await Promise.all(
        saved.map(async (item: any) => {
          try {
            const company = await companyApi.getCompany(item.companyId);
            return { ...item, company };
          } catch (error) {
            console.error(`Error loading company ${item.companyId}:`, error);
            return item;
          }
        })
      );

      setSavedCompanies(companiesWithDetails);
    } catch (error) {
      console.error('Error loading saved companies:', error);
      message.error('Không thể tải danh sách công ty đã lưu');
    } finally {
      setLoadingCompanies(false);
    }
  };

  const loadSavedJobs = async () => {
    if (!user) return;

    setLoadingJobs(true);
    try {
      const saved = await savedJobApi.getUserSavedJobs(user.id);
      
      const jobsWithDetails = await Promise.all(
        saved.map(async (item: any) => {
          try {
            const jobResponse = await fetch(`http://localhost:8080/api/jobs/${item.jobId}`);
            if (jobResponse.ok) {
              const job = await jobResponse.json();
              return { ...item, job };
            }
            return item;
          } catch (error) {
            console.error(`Error loading job ${item.jobId}:`, error);
            return item;
          }
        })
      );

      setSavedJobs(jobsWithDetails);
    } catch (error) {
      console.error('Error loading saved jobs:', error);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleUnsaveCompany = async (companyId: number, companyName: string) => {
    if (!user) return;

    Modal.confirm({
      title: 'Xác nhận bỏ lưu',
      content: `Bạn có chắc chắn muốn bỏ lưu công ty "${companyName}"?`,
      okText: 'Bỏ lưu',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await savedCompanyApi.unsaveCompany(user.id, companyId);
          message.success('Đã bỏ lưu công ty');
          loadSavedCompanies();
        } catch (error) {
          console.error('Error unsaving company:', error);
          message.error('Có lỗi xảy ra');
        }
      },
    });
  };

  const handleUnsaveJob = async (jobId: number, jobTitle: string) => {
    if (!user) return;

    Modal.confirm({
      title: 'Xác nhận bỏ lưu',
      content: `Bạn có chắc chắn muốn bỏ lưu việc làm "${jobTitle}"?`,
      okText: 'Bỏ lưu',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await savedJobApi.unsaveJob(user.id, jobId);
          message.success('Đã bỏ lưu việc làm');
          loadSavedJobs();
        } catch (error) {
          console.error('Error unsaving job:', error);
          message.error('Có lỗi xảy ra');
        }
      },
    });
  };

  if (!user) {
    return null;
  }

  const tabItems = [
    {
      key: 'jobs',
      label: `Việc làm (${savedJobs.length})`,
      children: loadingJobs ? (
        <div className="text-center py-12">
          <Spin size="large" />
          <p className="text-gray-500 mt-4">Đang tải...</p>
        </div>
      ) : savedJobs.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <p className="text-lg font-semibold mb-2">Bạn chưa lưu việc làm nào</p>
              <p className="text-gray-500">Khám phá và lưu các việc làm phù hợp với bạn</p>
            </div>
          }
        >
          <Button type="primary" size="large" onClick={() => router.push('/jobs')}>
            Tìm việc làm
          </Button>
        </Empty>
      ) : (
        <Row gutter={[24, 24]}>
          {savedJobs.map((item) => {
            const job = item.job;
            if (!job) return null;

            return (
              <Col key={item.id} xs={24} sm={12} lg={8}>
                <Card
                  hoverable
                  className="h-full"
                  actions={[
                    <Button
                      key="view"
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => router.push(`/jobs/${job.id}`)}
                    >
                      Xem chi tiết
                    </Button>,
                    <Button
                      key="unsave"
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleUnsaveJob(job.id, job.title)}
                    >
                      Bỏ lưu
                    </Button>,
                  ]}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 
                      className="text-lg font-bold cursor-pointer hover:text-blue-600 flex-1"
                      onClick={() => router.push(`/jobs/${job.id}`)}
                    >
                      {job.title}
                    </h3>
                    <Button
                      type="text"
                      danger
                      shape="circle"
                      icon={<HeartFilled />}
                      onClick={() => handleUnsaveJob(job.id, job.title)}
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <ShopOutlined className="text-blue-600" />
                      <span>{job.companyName || 'Công ty'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <EnvironmentOutlined className="text-green-600" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <DollarOutlined className="text-red-600" />
                      <span className="font-semibold text-red-600">{job.salary}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <ClockCircleOutlined className="text-orange-600" />
                      <span>Hạn nộp: {dayjs(job.applicationDeadline).format('DD/MM/YYYY')}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    <Tag color="blue">{job.jobType}</Tag>
                    <Tag color="green">{job.experienceLevel}</Tag>
                  </div>

                  <div className="text-gray-400 text-xs pt-3 border-t">
                    Đã lưu: {dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      ),
    },
    {
      key: 'companies',
      label: `Công ty (${savedCompanies.length})`,
      children: loadingCompanies ? (
        <div className="text-center py-12">
          <Spin size="large" />
          <p className="text-gray-500 mt-4">Đang tải...</p>
        </div>
      ) : savedCompanies.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <p className="text-lg font-semibold mb-2">Bạn chưa lưu công ty nào</p>
              <p className="text-gray-500">Khám phá và lưu các công ty yêu thích của bạn</p>
            </div>
          }
        >
          <Button type="primary" size="large" onClick={() => router.push('/companies')}>
            Khám phá công ty
          </Button>
        </Empty>
      ) : (
        <Row gutter={[24, 24]}>
          {savedCompanies.map((item) => {
            const company = item.company;
            if (!company) return null;

            return (
              <Col key={item.id} xs={24} sm={12} lg={8}>
                <Card
                  hoverable
                  className="h-full"
                  cover={
                    <div 
                      className="h-48 bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center relative"
                      style={{
                        backgroundImage: company.logoUrl ? `url(${company.logoUrl})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      {!company.logoUrl && (
                        <Avatar size={80} className="bg-white text-blue-600 text-3xl font-bold">
                          {company.name?.charAt(0)}
                        </Avatar>
                      )}
                      <div className="absolute top-2 right-2">
                        <Button
                          type="primary"
                          danger
                          shape="circle"
                          icon={<HeartFilled />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnsaveCompany(company.id, company.name);
                          }}
                        />
                      </div>
                    </div>
                  }
                  actions={[
                    <Button
                      key="view"
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => router.push(`/companies/${company.id}`)}
                    >
                      Xem chi tiết
                    </Button>,
                    <Button
                      key="unsave"
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleUnsaveCompany(company.id, company.name)}
                    >
                      Bỏ lưu
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    title={
                      <div 
                        className="text-lg font-bold cursor-pointer hover:text-blue-600"
                        onClick={() => router.push(`/companies/${company.id}`)}
                      >
                        {company.name}
                      </div>
                    }
                    description={
                      <div className="space-y-2">
                        {company.industry && (
                          <Tag color="blue">{company.industry}</Tag>
                        )}
                        {company.address && (
                          <div className="flex items-start gap-2 text-gray-600 text-sm">
                            <EnvironmentOutlined className="mt-1" />
                            <span className="line-clamp-1">{company.address}</span>
                          </div>
                        )}
                        {company.companySize && (
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <TeamOutlined />
                            <span>{company.companySize}</span>
                          </div>
                        )}
                        <div className="text-gray-400 text-xs mt-3 pt-3 border-t">
                          Đã lưu: {dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            );
          })}
        </Row>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card 
          title={
            <div className="flex items-center gap-3">
              <HeartFilled className="text-red-500 text-2xl" />
              <div>
                <h1 className="text-2xl font-bold m-0">Thư mục lưu</h1>
                <p className="text-gray-500 text-sm m-0 font-normal">
                  Quản lý công ty và việc làm đã lưu
                </p>
              </div>
            </div>
          }
          className="shadow-sm"
        >
          <Tabs defaultActiveKey="jobs" items={tabItems} size="large" />
        </Card>
      </div>
    </MainLayout>
  );
}
