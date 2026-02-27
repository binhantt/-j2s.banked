import { useState, useEffect } from 'react';
import { Card, Row, Col, Tag, Button, Space, Empty, Spin, Input, Select } from 'antd';
import { 
  DollarOutlined, 
  ClockCircleOutlined, 
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { MainLayout } from '@/components/layout/MainLayout';
import { freelanceApi } from '@/lib/freelanceApi';

const { Search } = Input;
const { Option } = Select;

export default function FreelanceProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [applicationCounts, setApplicationCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchText, statusFilter]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await freelanceApi.getAllProjects();
      setProjects(data);
      
      // Load application counts for all projects
      const counts: Record<number, number> = {};
      await Promise.all(
        data.map(async (project: any) => {
          try {
            const countData = await freelanceApi.getApplicationCount(project.id);
            counts[project.id] = countData.count;
          } catch (error) {
            counts[project.id] = 0;
          }
        })
      );
      setApplicationCounts(counts);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchText.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    setFilteredProjects(filtered);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusTag = (status: string) => {
    const statusMap = {
      draft: { color: 'default', text: 'Nháp' },
      open: { color: 'blue', text: 'Đang tuyển' },
      in_progress: { color: 'processing', text: 'Đang thực hiện' },
      completed: { color: 'success', text: 'Hoàn thành' },
      cancelled: { color: 'error', text: 'Đã hủy' },
    };
    const info = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
    return <Tag color={info.color}>{info.text}</Tag>;
  };

  const handleViewProject = (projectId: number) => {
    router.push(`/freelance/${projectId}`);
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <div style={{ 
        background: 'linear-gradient(to right, #2563eb, #0891b2, #14b8a6)',
        padding: '100px 24px 140px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          filter: 'blur(40px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-100px',
          left: '-100px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          filter: 'blur(60px)'
        }} />
        
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-block',
            padding: '8px 20px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50px',
            marginBottom: 24,
            backdropFilter: 'blur(10px)'
          }}>
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>
              🚀 Freelance Marketplace
            </span>
          </div>
          <h1 style={{ 
            fontSize: '56px', 
            fontWeight: 800,
            color: '#fff',
            marginBottom: 20,
            letterSpacing: '-0.02em'
          }}>
            Dự án Freelance
          </h1>
          <p style={{ 
            fontSize: '20px', 
            color: 'rgba(255,255,255,0.95)',
            maxWidth: 700,
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Khám phá các dự án freelance chất lượng cao, làm việc với các client uy tín và phát triển sự nghiệp của bạn
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '-80px auto 80px', padding: '0 24px' }}>
        {/* Filters */}
        <Card 
          style={{ 
            marginBottom: 40,
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
            border: 'none'
          }}
          bodyStyle={{ padding: '32px' }}
        >
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={14}>
              <Search
                placeholder="Tìm kiếm theo tên dự án, mô tả..."
                allowClear
                size="large"
                prefix={<SearchOutlined style={{ color: '#0891b2' }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ 
                  width: '100%',
                }}
                className="custom-search"
              />
            </Col>
            <Col xs={24} md={10}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }} size="middle">
                <FilterOutlined style={{ color: '#64748b', fontSize: '18px' }} />
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  size="large"
                  style={{ width: 220 }}
                  suffixIcon={null}
                >
                  <Option value="all">🔍 Tất cả trạng thái</Option>
                  <Option value="draft">📝 Nháp</Option>
                  <Option value="open">🎯 Đang tuyển</Option>
                  <Option value="in_progress">⚡ Đang thực hiện</Option>
                  <Option value="completed">✅ Hoàn thành</Option>
                </Select>
              </Space>
            </Col>
          </Row>
          
          {/* Stats */}
          <div style={{ 
            marginTop: 24, 
            paddingTop: 24, 
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            gap: 32,
            flexWrap: 'wrap'
          }}>
            <div>
              <span style={{ color: '#64748b', fontSize: '14px' }}>Tổng dự án: </span>
              <strong style={{ fontSize: '16px', color: '#0891b2' }}>{projects.length}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '14px' }}>Kết quả: </span>
              <strong style={{ fontSize: '16px', color: '#0891b2' }}>{filteredProjects.length}</strong>
            </div>
          </div>
        </Card>

        {/* Projects Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '120px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, color: '#64748b' }}>Đang tải dự án...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <Empty
            description={
              <div>
                <p style={{ fontSize: '16px', color: '#64748b', marginBottom: 8 }}>
                  Không tìm thấy dự án nào
                </p>
                <p style={{ fontSize: '14px', color: '#94a3b8' }}>
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
              </div>
            }
            style={{ padding: '120px 0' }}
          />
        ) : (
          <Row gutter={[32, 32]}>
            {filteredProjects.map((project) => (
              <Col xs={24} md={12} lg={8} key={project.id}>
                <Card
                  hoverable
                  style={{
                    height: '100%',
                    borderRadius: '20px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: 'none',
                    overflow: 'hidden'
                  }}
                  bodyStyle={{ padding: 0 }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(37, 99, 235, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
                  }}
                >
                  {/* Card Header with Gradient */}
                  <div style={{
                    background: 'linear-gradient(to right, #2563eb, #0891b2, #14b8a6)',
                    padding: '24px',
                    position: 'relative'
                  }}>
                    <div style={{ position: 'absolute', top: 16, right: 16 }}>
                      {getStatusTag(project.status)}
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: 'rgba(255,255,255,0.9)',
                      marginBottom: 8,
                      fontWeight: 500
                    }}>
                      Ngân sách dự án
                    </div>
                    <div style={{ 
                      fontSize: '32px', 
                      fontWeight: 800,
                      color: '#fff',
                      letterSpacing: '-0.02em'
                    }}>
                      {formatCurrency(project.budget)}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '24px' }}>
                    <h3 style={{ 
                      fontSize: '20px', 
                      fontWeight: 700,
                      marginBottom: 12,
                      minHeight: 56,
                      lineHeight: 1.4,
                      color: '#1e293b',
                      letterSpacing: '-0.01em'
                    }}>
                      {project.title}
                    </h3>

                    <p style={{ 
                      color: '#64748b',
                      fontSize: '15px',
                      marginBottom: 24,
                      minHeight: 66,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.6
                    }}>
                      {project.description}
                    </p>

                    {/* Client Info */}
                    {(project.clientName || project.clientEmail) && (
                      <div style={{
                        padding: '12px 16px',
                        background: '#f8fafc',
                        borderRadius: '10px',
                        marginBottom: 20,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                      }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: project.clientAvatar 
                            ? `url(${project.clientAvatar}) center/cover`
                            : 'linear-gradient(to right, #2563eb, #0891b2, #14b8a6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {!project.clientAvatar && (
                            <UserOutlined style={{ fontSize: 18, color: '#fff' }} />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ 
                            fontSize: '14px', 
                            fontWeight: 600, 
                            color: '#1e293b',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {project.clientName || `Client #${project.clientId}`}
                          </div>
                          {project.clientEmail && (
                            <div style={{ 
                              fontSize: '12px', 
                              color: '#64748b',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {project.clientEmail}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <Space direction="vertical" size={12} style={{ width: '100%', marginBottom: 24 }}>
                      {/* Applicants Count */}
                      {applicationCounts[project.id] !== undefined && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 10,
                          padding: '10px 14px',
                          background: '#f0f9ff',
                          borderRadius: '10px',
                          border: '1px solid #bae6fd'
                        }}>
                          <UserOutlined style={{ color: '#0891b2', fontSize: '16px' }} />
                          <span style={{ fontSize: '14px', color: '#0c4a6e', fontWeight: 600 }}>
                            {applicationCounts[project.id]} người ứng tuyển
                          </span>
                        </div>
                      )}
                      {project.deadline && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 10,
                          padding: '10px 14px',
                          background: '#f8fafc',
                          borderRadius: '10px'
                        }}>
                          <ClockCircleOutlined style={{ color: '#0891b2', fontSize: '16px' }} />
                          <span style={{ fontSize: '14px', color: '#475569', fontWeight: 500 }}>
                            Hạn: {new Date(project.deadline).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      )}
                      {project.progress !== undefined && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 10,
                          padding: '10px 14px',
                          background: '#f8fafc',
                          borderRadius: '10px'
                        }}>
                          <span style={{ fontSize: '16px' }}>📊</span>
                          <span style={{ fontSize: '14px', color: '#475569', fontWeight: 500 }}>
                            Tiến độ: {project.progress}%
                          </span>
                        </div>
                      )}
                    </Space>

                    <Button
                      type="primary"
                      block
                      size="large"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewProject(project.id)}
                      style={{
                        height: '48px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        fontSize: '15px',
                        background: 'linear-gradient(to right, #2563eb, #0891b2, #14b8a6)',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                      }}
                    >
                      Xem chi tiết
                    </Button>

                    {/* Deposit Status Indicator */}
                    {project.depositStatus !== 'paid' && (
                      <div style={{
                        marginTop: 12,
                        padding: '8px 12px',
                        background: '#fef3c7',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontSize: '12px',
                        color: '#92400e',
                        fontWeight: 500
                      }}>
                        🔒 Chưa mở ứng tuyển
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </MainLayout>
  );
}
