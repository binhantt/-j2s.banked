import { Button, Card, Tag, Divider, Row, Col, Avatar, Rate, Tabs, Empty, Spin, message } from 'antd';
import {
  EnvironmentOutlined,
  TeamOutlined,
  GlobalOutlined,
  MailOutlined,
  PhoneOutlined,
  HeartOutlined,
  ShareAltOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  CalendarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { JobCard } from '../jobs/components/JobCard';
import { useState, useEffect } from 'react';
import { companyBlogApi, CompanyBlog } from '@/lib/companyBlogApi';
import { companyApi, Company } from '@/lib/companyApi';
import { jobApi } from '@/lib/jobApi';
import { useRouter } from 'next/router';
import type { Job } from '@/store/useJobStore';

interface CompanyDetailFeatureProps {
  companyId: string;
}

export const CompanyDetailFeature = ({ companyId }: CompanyDetailFeatureProps) => {
  const router = useRouter();
  const [blogs, setBlogs] = useState<CompanyBlog[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [companyImages, setCompanyImages] = useState<any[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  useEffect(() => {
    if (companyId) {
      loadCompany();
      loadCompanyBlogs();
      loadCompanyImages();
    }
  }, [companyId]);

  const loadCompanyImages = async () => {
    setLoadingImages(true);
    try {
      const { companyImageApi } = await import('@/lib/companyImageApi');
      const data = await companyImageApi.getImagesByCompany(Number(companyId));
      console.log('Loaded company images:', data); // Debug log
      setCompanyImages(data);
    } catch (error) {
      console.error('Error loading images:', error);
      // Don't show error message, just set empty array
      setCompanyImages([]);
    } finally {
      setLoadingImages(false);
    }
  };

  const loadCompany = async () => {
    setLoading(true);
    try {
      const data = await companyApi.getCompany(Number(companyId));
      setCompany(data);
      // Load jobs after getting company info
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
      // Only show active jobs
      setJobs(data.filter((job: Job) => job.status === 'active'));
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoadingJobs(false);
    }
  };

  const loadCompanyBlogs = async () => {
    setLoadingBlogs(true);
    try {
      const data = await companyBlogApi.getBlogsByCompany(Number(companyId));
      // Only show published blogs
      setBlogs(data.filter((blog: CompanyBlog) => blog.status === 'published'));
    } catch (error) {
      console.error('Error loading blogs:', error);
    } finally {
      setLoadingBlogs(false);
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

  // Parse benefits and culture from string to array if needed
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
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {company.description}
            </p>
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
                  <CheckCircleOutlined className="text-indigo-600 mr-3 mt-1 text-lg" />
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
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
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
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Quyền lợi và phúc lợi
          </h3>
          <Row gutter={[16, 16]}>
            {benefitsList.map((benefit, index) => (
              <Col key={index} xs={24} sm={12}>
                <div className="flex items-start p-4 bg-indigo-50 rounded-lg">
                  <CheckCircleOutlined className="text-indigo-600 mr-3 mt-1 text-lg flex-shrink-0" />
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
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      ) : companyImages.length > 0 ? (
        <div>
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Hình ảnh giới thiệu ({companyImages.length})
            </h3>
            <p className="text-gray-600 mt-2">
              Khám phá môi trường làm việc và văn hóa công ty qua hình ảnh
            </p>
          </div>
          <Row gutter={[16, 16]}>
            {companyImages.map((image, index) => (
              <Col key={image.id} xs={24} sm={12} md={8} lg={6}>
                <div 
                  className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => window.open(image.imageUrl, '_blank')}
                >
                  <img
                    src={image.imageUrl}
                    alt={image.description || `${company.name} - Hình ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      backgroundColor: '#f0f0f0',
                    }}
                    className="group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      console.error('Image load error:', image.imageUrl);
                      e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <EyeOutlined className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <span className="text-white text-sm font-medium">
                      {image.description || `Hình ${index + 1}`}
                    </span>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <div className="text-center py-16">
          <Empty 
            description={
              <div>
                <p className="text-gray-600 mb-2">Chưa có hình ảnh giới thiệu</p>
                <p className="text-gray-400 text-sm">
                  Công ty chưa cập nhật hình ảnh về môi trường làm việc
                </p>
              </div>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ),
    },
    {
      key: '5',
      label: `Blog (${blogs.length})`,
      children: loadingBlogs ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
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
                    <img
                      alt={blog.title}
                      src={blog.imageUrl}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        height: '200px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '48px',
                      }}
                    >
                      📝
                    </div>
                  )
                }
                onClick={() => router.push(`/blogs/${blog.id}`)}
              >
                <Card.Meta
                  title={
                    <div style={{ 
                      fontSize: '16px',
                      fontWeight: 'bold',
                      marginBottom: '8px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {blog.title}
                    </div>
                  }
                  description={
                    <div>
                      <p style={{
                        color: '#6b7280',
                        marginBottom: '12px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {blog.content}
                      </p>
                      <div style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12px',
                        color: '#9ca3af'
                      }}>
                        <span>
                          <EyeOutlined /> {blog.views || 0}
                        </span>
                        <span>
                          <CalendarOutlined /> {new Date(blog.createdAt!).toLocaleDateString('vi-VN')}
                        </span>
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
  ];

  return (
    <div className="w-full">
      {/* Cover Image */}
      <div
        className="h-64 bg-cover bg-center relative"
        style={{ 
          backgroundImage: company.logoUrl 
            ? `url(${company.logoUrl})` 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Company Header */}
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
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                      {company.name}
                    </h1>
                    <div className="flex items-center gap-3 mb-3">
                      <Rate disabled defaultValue={4.5} />
                      <span className="text-gray-600">
                        4.5 (0 đánh giá)
                      </span>
                    </div>
                    <Tag color="blue" className="text-base px-4 py-1">
                      {company.industry || 'Chưa cập nhật'}
                    </Tag>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="large"
                      icon={<HeartOutlined />}
                      className="px-6"
                    >
                      Theo dõi
                    </Button>
                    <Button
                      size="large"
                      icon={<ShareAltOutlined />}
                      className="px-6"
                    >
                      Chia sẻ
                    </Button>
                  </div>
                </div>

                <Row gutter={[24, 16]}>
                  <Col xs={24} sm={12} md={8}>
                    <div className="flex items-center text-gray-700">
                      <EnvironmentOutlined className="text-lg mr-2 text-indigo-600" />
                      <span>{company.address || 'Chưa cập nhật'}</span>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <div className="flex items-center text-gray-700">
                      <TeamOutlined className="text-lg mr-2 text-indigo-600" />
                      <span>{company.companySize || 'Chưa cập nhật'}</span>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <div className="flex items-center text-gray-700">
                      <GlobalOutlined className="text-lg mr-2 text-indigo-600" />
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-700"
                      >
                        {company.website}
                      </a>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <div className="flex items-center text-gray-700">
                      <MailOutlined className="text-lg mr-2 text-indigo-600" />
                      <a
                        href={`mailto:${company.email}`}
                        className="text-indigo-600 hover:text-indigo-700"
                      >
                        {company.email}
                      </a>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <div className="flex items-center text-gray-700">
                      <PhoneOutlined className="text-lg mr-2 text-indigo-600" />
                      <span>{company.phone}</span>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <div className="flex items-center text-gray-700">
                      <UserOutlined className="text-lg mr-2 text-indigo-600" />
                      <span>0 người theo dõi</span>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs Content */}
        <Card className="border border-gray-200 rounded-xl mb-8">
          <Tabs defaultActiveKey="1" items={tabItems} size="large" />
        </Card>
      </div>
    </div>
  );
};
