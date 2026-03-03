import { useState, useEffect } from 'react';
import { Card, Tabs, Row, Col, Button, message, Empty, Spin, Avatar, Tag, Modal, Space, Typography } from 'antd';
import {
  HeartFilled,
  EyeOutlined,
  EnvironmentOutlined,
  TeamOutlined,
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

const { Title, Text } = Typography;

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
      message.error('Không thể tải danh sách việc làm đã lưu');
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

  if (!user) return null;

  const loadingBlock = (
    <div className="text-center py-16">
      <Spin size="large" />
      <p className="text-gray-500 mt-4">Đang tải dữ liệu...</p>
    </div>
  );

  const emptyJobs = (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Text strong style={{ fontSize: 18 }}>Bạn chưa lưu việc làm nào</Text>
          <Text type="secondary">Khám phá và lưu các việc làm phù hợp với bạn</Text>
        </div>
      }
    >
      <Button type="primary" size="large" onClick={() => router.push('/jobs')}>
        Tìm việc làm
      </Button>
    </Empty>
  );

  const emptyCompanies = (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <Space direction="vertical" size={2}>
          <Text strong style={{ fontSize: 18 }}>Bạn chưa lưu công ty nào</Text>
          <Text type="secondary">Khám phá và lưu các công ty yêu thích của bạn</Text>
        </Space>
      }
    >
      <Button type="primary" size="large" onClick={() => router.push('/companies')}>
        Khám phá công ty
      </Button>
    </Empty>
  );

  const tabItems = [
    {
      key: 'jobs',
      label: `Việc làm (${savedJobs.length})`,
      children: loadingJobs ? (
        loadingBlock
      ) : savedJobs.length === 0 ? (
        emptyJobs
      ) : (
        <Row gutter={[20, 20]}>
          {savedJobs.map((item) => {
            const job = item.job;
            if (!job) return null;

            return (
              <Col key={item.id} xs={24} md={12} xl={8}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 16,
                    height: '100%',
                    border: '1px solid #e8eef5',
                    boxShadow: '0 6px 16px rgba(15, 23, 42, 0.05)',
                  }}
                  styles={{ body: { padding: 18 } }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      <Avatar
                        size={54}
                        shape="square"
                        src={job.companyLogoUrl}
                        style={{
                          border: '1px solid #e6edf5',
                          background: job.companyLogoUrl ? '#fff' : 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                          color: '#fff',
                          fontWeight: 700,
                        }}
                      >
                        {!job.companyLogoUrl && (job.companyName?.charAt(0) || 'C')}
                      </Avatar>
                      <div style={{ minWidth: 0 }}>
                        <Title
                          level={5}
                          style={{ margin: 0, cursor: 'pointer', lineHeight: 1.35 }}
                          onClick={() => router.push(`/jobs/${job.id}`)}
                        >
                          {job.title}
                        </Title>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {job.companyName || 'Công ty tuyển dụng'}
                        </Text>
                      </div>
                    </div>
                    <Button
                      type="text"
                      danger
                      shape="circle"
                      icon={<HeartFilled />}
                      onClick={() => handleUnsaveJob(job.id, job.title)}
                    />
                  </div>

                  <Space size={[6, 6]} wrap style={{ marginBottom: 12 }}>
                    {job.jobType && <Tag color="blue">{job.jobType}</Tag>}
                    {job.experienceLevel && <Tag color="green">{job.experienceLevel}</Tag>}
                  </Space>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <EnvironmentOutlined className="text-green-600" />
                      <span>{job.location || 'Đang cập nhật'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                      <DollarOutlined className="text-red-500" />
                      <span style={{ fontWeight: 600 }}>{job.salary || `${job.salaryMin || ''} - ${job.salaryMax || ''}` || 'Thỏa thuận'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <ClockCircleOutlined className="text-orange-500" />
                      <span>Hạn nộp: {job.applicationDeadline ? dayjs(job.applicationDeadline).format('DD/MM/YYYY') : 'Không giới hạn'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <ShopOutlined className="text-blue-500" />
                      <span>Đã lưu: {dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <Button
                      type="default"
                      icon={<EyeOutlined />}
                      onClick={() => router.push(`/jobs/${job.id}`)}
                    >
                      Chi tiết
                    </Button>
                    <Button
                      type="primary"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleUnsaveJob(job.id, job.title)}
                    >
                      Bỏ lưu
                    </Button>
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
        loadingBlock
      ) : savedCompanies.length === 0 ? (
        emptyCompanies
      ) : (
        <Row gutter={[20, 20]}>
          {savedCompanies.map((item) => {
            const company = item.company;
            if (!company) return null;

            return (
              <Col key={item.id} xs={24} md={12} xl={8}>
                <Card
                  hoverable
                  style={{ borderRadius: 14, overflow: 'hidden', height: '100%', border: '1px solid #eef2f7' }}
                  cover={
                    <div
                      className="h-40 flex items-center justify-center relative"
                      style={{
                        backgroundImage: company.logoUrl
                          ? `linear-gradient(rgba(9, 30, 66, 0.12), rgba(9, 30, 66, 0.12)), url(${company.logoUrl})`
                          : 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      {!company.logoUrl && (
                        <Avatar size={74} style={{ background: '#fff', color: '#2563eb', fontSize: 30, fontWeight: 700 }}>
                          {company.name?.charAt(0)}
                        </Avatar>
                      )}
                      <Button
                        type="primary"
                        danger
                        shape="circle"
                        icon={<HeartFilled />}
                        style={{ position: 'absolute', top: 10, right: 10 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnsaveCompany(company.id, company.name);
                        }}
                      />
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
                  styles={{ body: { padding: 16 } }}
                >
                  <Title
                    level={5}
                    style={{ marginTop: 0, marginBottom: 10, cursor: 'pointer' }}
                    onClick={() => router.push(`/companies/${company.id}`)}
                  >
                    {company.name}
                  </Title>

                  <Space size={[6, 6]} wrap style={{ marginBottom: 10 }}>
                    {company.industry && <Tag color="blue">{company.industry}</Tag>}
                  </Space>

                  <Space direction="vertical" size={10} style={{ width: '100%' }}>
                    {company.address && (
                      <div className="flex items-start gap-2 text-gray-600 text-sm">
                        <EnvironmentOutlined style={{ marginTop: 2 }} />
                        <span className="line-clamp-2">{company.address}</span>
                      </div>
                    )}
                    {company.companySize && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <TeamOutlined />
                        <span>{company.companySize}</span>
                      </div>
                    )}
                  </Space>

                  <div className="text-gray-400 text-xs pt-3 mt-3 border-t">
                    Đã lưu: {dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}
                  </div>
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
      <Card
        style={{
          borderRadius: 16,
          border: '1px solid #eaf0f6',
          boxShadow: '0 8px 24px rgba(2, 12, 27, 0.05)',
          overflow: 'hidden',
        }}
        styles={{
          body: { padding: 24 },
        }}
        title={
          <div
            style={{
              padding: '8px 0',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                color: '#fff',
                fontSize: 20,
              }}
            >
              <HeartFilled />
            </div>
            <div>
              <Title level={3} style={{ margin: 0 }}>Thư mục đã lưu</Title>
              <Text type="secondary">Quản lý việc làm và công ty bạn quan tâm</Text>
            </div>
          </div>
        }
      >
        <Tabs defaultActiveKey="jobs" items={tabItems} size="large" />
      </Card>
    </MainLayout>
  );
}
