import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tag, Button, Input, Select, message, Space, Divider } from 'antd';
import { EnvironmentOutlined, DollarOutlined, ClockCircleOutlined, MessageOutlined, HeartOutlined, HeartFilled, SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { jobApi } from '@/lib/jobApi';
import { chatApi } from '@/lib/chatApi';
import { useAuthStore } from '@/store/useAuthStore';

const { Option } = Select;

export default function JobsListPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  const [savedJobsLoaded, setSavedJobsLoaded] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    loadJobs();
    if (isAuthenticated && user?.id) {
      loadSavedJobs();
    }
  }, [isAuthenticated, user?.id]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await jobApi.getActiveJobs();
      setJobs(data);
    } catch (error) {
      message.error('Không thể tải danh sách công việc');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedJobs = async () => {
    if (!user?.id) return;
    
    try {
      const { savedJobApi } = await import('@/lib/savedJobApi');
      const saved = await savedJobApi.getUserSavedJobs(user.id);
      setSavedJobs(saved.map((s: any) => s.jobPostingId));
      setSavedJobsLoaded(true);
    } catch (error) {
      console.error('Load saved jobs error:', error);
    }
  };

  const handleStartChat = async (job: any) => {
    if (!isAuthenticated) {
      message.warning('Vui lòng đăng nhập để chat với HR');
      router.push('/login');
      return;
    }

    try {
      const conversation = await chatApi.createConversation({
        jobPostingId: job.id,
        jobSeekerId: user?.id,
        hrId: job.userId,
      });
      router.push(`/chat/${conversation.id}`);
    } catch (error) {
      message.error('Không thể bắt đầu chat');
    }
  };

  const toggleSaveJob = async (jobId: number) => {
    if (!isAuthenticated || !user?.id) {
      message.warning('Vui lòng đăng nhập để lưu công việc');
      return;
    }

    try {
      const { savedJobApi } = await import('@/lib/savedJobApi');
      
      if (savedJobs.includes(jobId)) {
        await savedJobApi.unsaveJob(user.id, jobId);
        setSavedJobs(savedJobs.filter(id => id !== jobId));
        message.success('Đã bỏ lưu công việc');
      } else {
        await savedJobApi.saveJob(user.id, jobId);
        setSavedJobs([...savedJobs, jobId]);
        message.success('Đã lưu công việc');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const filteredJobs = jobs.filter((job: any) => {
    const matchSearch = job.title.toLowerCase().includes(searchText.toLowerCase()) ||
                       job.location.toLowerCase().includes(searchText.toLowerCase());
    const matchType = filterType === 'all' || job.jobType === filterType;
    const matchLocation = filterLocation === 'all' || job.location.includes(filterLocation);
    return matchSearch && matchType && matchLocation;
  });

  const jobTypeMap: any = {
    'full-time': 'Full-time',
    'part-time': 'Part-time',
    'contract': 'Contract',
    'internship': 'Internship',
  };

  const levelMap: any = {
    'intern': 'Intern',
    'junior': 'Junior',
    'middle': 'Middle',
    'senior': 'Senior',
    'lead': 'Lead',
    'manager': 'Manager',
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const days = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Hôm nay';
    if (days === 1) return '1 ngày trước';
    return `${days} ngày trước`;
  };

  return (
    <div style={{ background: '#f5f7fa', minHeight: 'calc(100vh - 64px)', paddingTop: 40, paddingBottom: 60 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 42, fontWeight: 700, marginBottom: 12, color: '#1e293b' }}>
            Tìm Công Việc Mơ Ước
          </h1>
          <p style={{ fontSize: 16, color: '#666' }}>
            Khám phá hàng nghìn cơ hội việc làm hấp dẫn
          </p>
        </div>

        {/* Search Bar */}
        <Card style={{ marginBottom: 40, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <Input
              size="large"
              placeholder="Tìm theo vị trí, công ty, kỹ năng..."
              prefix={<SearchOutlined style={{ color: '#999' }} />}
              style={{ flex: 1, minWidth: 250, borderRadius: 8 }}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Select
              size="large"
              style={{ width: 180, borderRadius: 8 }}
              value={filterLocation}
              onChange={setFilterLocation}
            >
              <Option value="all">Tất cả địa điểm</Option>
              <Option value="Hà Nội">Hà Nội</Option>
              <Option value="Hồ Chí Minh">Hồ Chí Minh</Option>
              <Option value="Đà Nẵng">Đà Nẵng</Option>
            </Select>
            <Select
              size="large"
              style={{ width: 180, borderRadius: 8 }}
              value={filterType}
              onChange={setFilterType}
            >
              <Option value="all">Tất cả loại hình</Option>
              <Option value="full-time">Full-time</Option>
              <Option value="part-time">Part-time</Option>
              <Option value="contract">Contract</Option>
              <Option value="internship">Internship</Option>
            </Select>
          </div>
          
          <Divider style={{ margin: '16px 0' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#666' }}>
              Tìm thấy <strong style={{ color: '#0ea5e9' }}>{filteredJobs.length}</strong> công việc
            </span>
            <Space>
              <Tag color="blue">{jobs.length} việc đang tuyển</Tag>
            </Space>
          </div>
        </Card>

        {/* Jobs Grid */}
        <Row gutter={[24, 24]}>
          {filteredJobs.map((job: any) => (
            <Col xs={24} md={12} lg={8} key={job.id}>
              <Card
                hoverable
                style={{ 
                  height: '100%',
                  borderRadius: 12,
                  border: '1px solid #e8e8e8',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
                bodyStyle={{ padding: 20 }}
              >
                {/* Save Button */}
                <Button
                  type="text"
                  icon={savedJobs.includes(job.id) ? 
                    <HeartFilled style={{ color: '#ff4d4f', fontSize: 20 }} /> : 
                    <HeartOutlined style={{ fontSize: 20 }} />
                  }
                  onClick={() => toggleSaveJob(job.id)}
                  style={{ 
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    zIndex: 1
                  }}
                />

                {/* Company Logo */}
                <div style={{ 
                  width: 60,
                  height: 60,
                  borderRadius: 8,
                  background: job.companyLogoUrl ? 'transparent' : 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #14b8a6 100%)',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  fontWeight: 600,
                  color: '#fff',
                  overflow: 'hidden',
                  border: '1px solid #e8e8e8'
                }}>
                  {job.companyLogoUrl ? (
                    <img 
                      src={job.companyLogoUrl} 
                      alt={job.companyName || 'Company'} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.style.background = 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #14b8a6 100%)';
                        e.currentTarget.parentElement!.innerHTML = (job.companyName?.charAt(0) || job.title.charAt(0));
                      }}
                    />
                  ) : (
                    job.companyName?.charAt(0) || job.title.charAt(0)
                  )}
                </div>

                {/* Job Title */}
                <h3 style={{ 
                  fontSize: 18, 
                  fontWeight: 600,
                  marginBottom: 8,
                  color: '#1e293b',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                onClick={() => router.push(`/jobs/${job.id}`)}
                >
                  {job.title}
                </h3>

                {/* Company Name */}
                <p style={{ color: '#666', marginBottom: 12, fontSize: 14 }}>
                  {job.companyName || 'Công ty tuyển dụng'}
                </p>

                {/* Tags */}
                <Space size={8} wrap style={{ marginBottom: 16 }}>
                  <Tag color="blue" style={{ borderRadius: 4 }}>
                    {jobTypeMap[job.jobType]}
                  </Tag>
                  <Tag color="green" style={{ borderRadius: 4 }}>
                    {levelMap[job.level]}
                  </Tag>
                </Space>

                {/* Details */}
                <Space direction="vertical" size={8} style={{ width: '100%', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', color: '#666', fontSize: 14 }}>
                    <EnvironmentOutlined style={{ marginRight: 8 }} />
                    {job.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', color: '#666', fontSize: 14 }}>
                    <DollarOutlined style={{ marginRight: 8 }} />
                    {job.salaryMin} - {job.salaryMax}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', color: '#999', fontSize: 13 }}>
                    <ClockCircleOutlined style={{ marginRight: 8 }} />
                    {getTimeAgo(job.createdAt)}
                  </div>
                </Space>

                {/* Action Buttons */}
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <Button
                    block
                    type="primary"
                    size="large"
                    onClick={() => router.push(`/jobs/${job.id}`)}
                    style={{ 
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #14b8a6 100%)',
                      border: 'none',
                      fontWeight: 500
                    }}
                  >
                    Ứng tuyển ngay
                  </Button>
                  <Button
                    block
                    size="large"
                    icon={<MessageOutlined />}
                    onClick={() => handleStartChat(job)}
                    style={{ 
                      borderRadius: 8,
                      fontWeight: 500
                    }}
                  >
                    Chat với HR
                  </Button>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Empty State */}
        {filteredJobs.length === 0 && !loading && (
          <Card style={{ 
            textAlign: 'center', 
            padding: 60,
            borderRadius: 12,
            border: '1px solid #e8e8e8'
          }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontSize: 20, marginBottom: 8, fontWeight: 600 }}>
              Không tìm thấy công việc phù hợp
            </h3>
            <p style={{ color: '#999' }}>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
          </Card>
        )}
      </div>
    </div>
  );
}
