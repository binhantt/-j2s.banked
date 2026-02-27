import { useState, useEffect } from 'react';
import { Card, Tag, Avatar, Row, Col, Spin, Empty, message, Tabs, Divider, Rate } from 'antd';
import {
  EnvironmentOutlined,
  TeamOutlined,
  GlobalOutlined,
  MailOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { companyApi, Company } from '@/lib/companyApi';
import { jobApi } from '@/lib/jobApi';
import { companyBlogApi, CompanyBlog } from '@/lib/companyBlogApi';
import { companyReviewApi, CompanyStats } from '@/lib/companyReviewApi';
import { JobCard } from '../jobs/components/JobCard';
import { CompanyReviewSection } from './CompanyReviewSection';
import SaveCompanyButton from '@/components/SaveCompanyButton';
import { useRouter } from 'next/router';
import type { Job } from '@/store/useJobStore';

interface CompanyDetailFeatureProps {
  companyId: string;
}

export const CompanyDetailFeature = ({ companyId }: CompanyDetailFeatureProps) => {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [blogs, setBlogs] = useState<CompanyBlog[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [companyImages, setCompanyImages] = useState<any[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [reviewStats, setReviewStats] = useState<CompanyStats>({ averageRating: 0, reviewCount: 0 });

  useEffect(() => {
    if (companyId) {
      loadCompany();
      loadCompanyBlogs();
      loadCompanyImages();
      loadReviewStats();
    }
  }, [companyId]);

  const loadCompanyImages = async () => {
    setLoadingImages(true);
    try {
      const { companyImageApi } = await import('@/lib/companyImageApi');
      const data = await companyImageApi.getImagesByCompany(Number(companyId));
      setCompanyImages(data);
    } catch (error) {
      console.error('Error loading images:', error);
      setCompanyImages([]);
    } finally {
      setLoadingImages(false);
    }
  };

  const loadReviewStats = async () => {
    try {
      const data = await companyReviewApi.getCompanyStats(Number(companyId));
      setReviewStats(data);
    } catch (error) {
      console.error('Error loading review stats:', error);
      setReviewStats({ averageRating: 0, reviewCount: 0 });
    }
  };

  const loadCompanyBlogs = async () => {
    setLoadingBlogs(true);
    try {
      const data = await companyBlogApi.getBlogsByCompany(Number(companyId));
      setBlogs(data.filter((blog: CompanyBlog) => blog.status === 'published'));
    } catch (error) {
      console.error('Error loading blogs:', error);
    } finally {
      setLoadingBlogs(false);
    }
  };

  const loadCompany = async () => {
    setLoading(true);
    try {
      const data = await companyApi.getCompany(Number(companyId));
      setCompany(data);
      if (data.hrId) {
        loadCompanyJobs(data.hrId);
      }
    } catch (error) {
      console.error('Error loading company:', error);
      message.error('Không thể tải thông tin công ty');
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyJobs = async (hrId: number) => {
    setLoadingJobs(true);
    try {
      const data = await jobApi.getJobsByUser(hrId);
      setJobs(data.filter((job: Job) => job.status === 'active'));
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoadingJobs(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!company) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2>Không tìm thấy công ty</h2>
      </div>
    );
  }

  const benefitsList = company.benefits ? company.benefits.split('\n').filter(b => b.trim()) : [];
  const cultureList = company.values ? company.values.split('\n').filter(v => v.trim()) : [];

  const tabItems = [
    {
      key: '1',
      label: 'Giới thiệu',
      children: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Về chúng tôi</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{company.description}</p>
          </div>
          <Divider />
          <Row gutter={[32, 32]}>
            <Col xs={24} md={12}>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sứ mệnh</h3>
              <p className="text-gray-700 leading-relaxed">{company.mission}</p>
            </Col>
            <Col xs={24} md={12}>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Tầm nhìn</h3>
              <p className="text-gray-700 leading-relaxed">{company.vision}</p>
            </Col>
          </Row>
          <Divider />
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Văn hóa công ty</h3>
            <ul className="space-y-3">
              {cultureList.map((item, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircleOutlined className="text-blue-600 mr-3 mt-1 text-lg" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ),
    },
    {
      key: '2',
      label: `Việc làm (${jobs.length})`,
      children: loadingJobs ? (
        <div style={{ textAlign: 'center', padding: '40px' }}><Spin size="large" /></div>
      ) : jobs.length === 0 ? (
        <Empty description="Chưa có tin tuyển dụng" />
      ) : (
        <Row gutter={[24, 24]}>
          {jobs.map((job) => (
            <Col key={job.id} xs={24} md={12} lg={8}>
              <JobCard job={job} />
            </Col>
          ))}
        </Row>
      ),
    },
    {
      key: '3',
      label: 'Phúc lợi',
      children: (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quyền lợi và phúc lợi</h3>
          <Row gutter={[16, 16]}>
            {benefitsList.map((benefit, index) => (
              <Col key={index} xs={24} sm={12}>
                <div className="flex items-start p-4 bg-blue-50 rounded-lg">
                  <CheckCircleOutlined className="text-blue-600 mr-3 mt-1 text-lg flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      ),
    },
    {
      key: '4',
      label: 'Hình ảnh',
      children: loadingImages ? (
        <div style={{ textAlign: 'center', padding: '40px' }}><Spin size="large" /></div>
      ) : companyImages.length > 0 ? (
        <div>
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900">Hình ảnh giới thiệu ({companyImages.length})</h3>
            <p className="text-gray-600 mt-2">Khám phá môi trường làm việc và văn hóa công ty qua hình ảnh</p>
          </div>
          <Row gutter={[16, 16]}>
            {companyImages.map((image, index) => (
              <Col key={image.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  cover={
                    <img
                      src={image.imageUrl}
                      alt={image.description || `Hình ${index + 1}`}
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x200/e5e7eb/64748b?text=Error';
                      }}
                    />
                  }
                  onClick={() => window.open(image.imageUrl, '_blank')}
                >
                  <Card.Meta description={image.description || `Hình ${index + 1}`} />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <Empty description="Chưa có hình ảnh giới thiệu" />
      ),
    },
    {
      key: '5',
      label: `Blog (${blogs.length})`,
      children: loadingBlogs ? (
        <div style={{ textAlign: 'center', padding: '40px' }}><Spin size="large" /></div>
      ) : blogs.length === 0 ? (
        <Empty description="Chưa có bài viết nào" />
      ) : (
        <Row gutter={[24, 24]}>
          {blogs.map((blog) => (
            <Col key={blog.id} xs={24} sm={12} lg={8}>
              <Card
                hoverable
                cover={
                  blog.imageUrl ? (
                    <img alt={blog.title} src={blog.imageUrl} style={{ height: '200px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ height: '200px', background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #14b8a6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '48px' }}>
                      📝
                    </div>
                  )
                }
                onClick={() => router.push(`/blogs/${blog.id}`)}
              >
                <Card.Meta
                  title={<div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{blog.title}</div>}
                  description={
                    <div>
                      <p style={{ color: '#6b7280', marginBottom: '12px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                        {blog.content}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#9ca3af' }}>
                        <span><EyeOutlined /> {blog.views || 0}</span>
                        <span><CalendarOutlined /> {new Date(blog.createdAt!).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      ),
    },
    {
      key: '6',
      label: `Đánh giá (${reviewStats.reviewCount})`,
      children: <CompanyReviewSection companyId={Number(companyId)} />,
    },
  ];

  return (
    <div className="w-full">
      <div
        className="h-64 bg-cover bg-center relative"
        style={{ 
          backgroundImage: company.logoUrl 
            ? `url(${company.logoUrl})` 
            : 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #14b8a6 100%)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="relative -mt-20 mb-8">
          <Card className="border border-gray-200 rounded-xl shadow-lg">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar
                src={company.logoUrl}
                size={150}
                shape="square"
                className="border-4 border-white shadow-lg"
              >
                {!company.logoUrl && company.name?.charAt(0)}
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{company.name}</h1>
                    <div className="flex items-center gap-3 mb-3">
                      <Rate disabled value={reviewStats.averageRating} allowHalf />
                      <span className="text-gray-600">
                        {reviewStats.averageRating.toFixed(1)} ({reviewStats.reviewCount} đánh giá)
                      </span>
                    </div>
                    <Tag color="blue" className="text-base px-4 py-1">
                      {company.industry || 'Chưa cập nhật'}
                    </Tag>
                  </div>
                  <div>
                    <SaveCompanyButton companyId={company.id} size="large" />
                  </div>
                </div>

                <Row gutter={[24, 16]}>
                  <Col xs={24} sm={12} md={8}>
                    <div className="flex items-center text-gray-700">
                      <EnvironmentOutlined className="text-lg mr-2 text-blue-600" />
                      <span>{company.address || 'Chưa cập nhật'}</span>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <div className="flex items-center text-gray-700">
                      <TeamOutlined className="text-lg mr-2 text-cyan-600" />
                      <span>{company.companySize || 'Chưa cập nhật'}</span>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <div className="flex items-center text-gray-700">
                      <GlobalOutlined className="text-lg mr-2 text-teal-600" />
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                        {company.website}
                      </a>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <div className="flex items-center text-gray-700">
                      <MailOutlined className="text-lg mr-2 text-blue-600" />
                      <a href={`mailto:${company.email}`} className="text-blue-600 hover:text-blue-700">
                        {company.email}
                      </a>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <div className="flex items-center text-gray-700">
                      <PhoneOutlined className="text-lg mr-2 text-cyan-600" />
                      <span>{company.phone}</span>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </Card>
        </div>

        <Card className="border border-gray-200 rounded-xl mb-8">
          <Tabs defaultActiveKey="1" items={tabItems} size="large" />
        </Card>
      </div>
    </div>
  );
};
