import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, message, Tabs, Tag, Spin } from 'antd';
import {
  HeartFilled,
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  BankOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { savedJobApi } from '@/lib/savedJobApi';
import { savedCompanyApi } from '@/lib/savedCompanyApi';
import { useAuthStore } from '@/store/useAuthStore';
import { MainLayout } from '@/components/layout/MainLayout';

function SavedJobsContent() {
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [savedCompanies, setSavedCompanies] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [activeTab, setActiveTab] = useState('jobs');
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.id) {
      loadSavedJobs();
      loadSavedCompanies();
    }
  }, [user?.id]);

  const loadSavedJobs = async () => {
    if (!user?.id) return;
    setLoadingJobs(true);
    try {
      const saved = await savedJobApi.getUserSavedJobs(user.id);
      const jobsWithDetails = saved
        .filter((s: any) => s.job != null)
        .map((s: any) => ({ ...s, job: s.job }));
      setSavedJobs(jobsWithDetails);
    } catch (error) {
      message.error('Không thể tải danh sách việc đã lưu');
    } finally {
      setLoadingJobs(false);
    }
  };

  const loadSavedCompanies = async () => {
    if (!user?.id) return;
    setLoadingCompanies(true);
    try {
      const saved = await savedCompanyApi.getUserSavedCompanies(user.id);
      const companiesWithDetails = saved
        .filter((s: any) => s.company != null)
        .map((s: any) => ({ ...s, company: s.company }));
      setSavedCompanies(companiesWithDetails);
    } catch (error) {
      message.error('Không thể tải danh sách công ty đã lưu');
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleUnsaveJob = async (jobId: number) => {
    if (!user?.id) return;
    try {
      await savedJobApi.unsaveJob(user.id, jobId);
      message.success('Đã bỏ lưu công việc');
      loadSavedJobs();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const handleUnsaveCompany = async (companyId: number) => {
    if (!user?.id) return;
    try {
      await savedCompanyApi.unsaveCompany(user.id, companyId);
      message.success('Đã bỏ lưu công ty');
      loadSavedCompanies();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const isLoading = activeTab === 'jobs' ? loadingJobs : loadingCompanies;
  const isEmpty = activeTab === 'jobs' ? savedJobs.length === 0 : savedCompanies.length === 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8f9fa',
      paddingTop: 40,
      paddingBottom: 60,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div style={{
          marginBottom: 32,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
          }}>
            ❤️
          </div>
          <div>
            <h1 style={{
              fontSize: 32,
              fontWeight: 700,
              color: '#111827',
              margin: 0,
              marginBottom: 4,
            }}>
              Thư mục đã lưu
            </h1>
            <p style={{
              fontSize: 15,
              color: '#6b7280',
              margin: 0,
            }}>
              Quản lý việc làm và công ty bạn quan tâm
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="large"
          items={[
            {
              key: 'jobs',
              label: (
                <span style={{ fontSize: 15, fontWeight: 600 }}>
                  Việc làm ({savedJobs.length})
                </span>
              ),
              children: (
                <div style={{ marginTop: 24 }}>
                  {loadingJobs ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                      <Spin size="large" />
                    </div>
                  ) : savedJobs.length === 0 ? (
                    <Card style={{
                      borderRadius: 16,
                      border: '1px solid #e5e7eb',
                      textAlign: 'center',
                      padding: '60px 20px',
                    }}>
                      <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
                      <h3 style={{
                        fontSize: 20,
                        fontWeight: 600,
                        color: '#111827',
                        marginBottom: 8,
                      }}>
                        Bạn chưa lưu việc làm nào
                      </h3>
                      <p style={{
                        fontSize: 14,
                        color: '#6b7280',
                        marginBottom: 24,
                      }}>
                        Khám phá và lưu các việc làm phù hợp với bạn để không bỏ lỡ cơ hội nghề nghiệp tốt nhất.
                      </p>
                      <Button
                        type="primary"
                        size="large"
                        icon={<ArrowRightOutlined />}
                        onClick={() => router.push('/jobs')}
                        style={{
                          height: 48,
                          borderRadius: 12,
                          background: 'linear-gradient(135deg, #16a34a 0%, #16a34a 100%)',
                          border: 'none',
                          fontWeight: 600,
                        }}
                      >
                        Tìm việc làm ngay
                      </Button>
                    </Card>
                  ) : (
                    <Row gutter={[20, 20]}>
                      {savedJobs.map((item: any) => (
                        <Col xs={24} lg={12} key={item.id}>
                          <Card
                            hoverable
                            style={{
                              borderRadius: 16,
                              border: '1px solid #e5e7eb',
                              height: '100%',
                              transition: 'all 0.3s',
                            }}
                            styles={{ body: { padding: 24 } }}
                          >
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              marginBottom: 16,
                            }}>
                              <div style={{ flex: 1 }}>
                                <h3
                                  style={{
                                    fontSize: 18,
                                    fontWeight: 700,
                                    color: '#111827',
                                    marginBottom: 8,
                                    cursor: 'pointer',
                                  }}
                                  onClick={() => router.push(`/jobs/${item.job.id}`)}
                                >
                                  {item.job.title}
                                </h3>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  color: '#6b7280',
                                  fontSize: 14,
                                  marginBottom: 12,
                                }}>
                                  <BankOutlined />
                                  <span>{item.job.companyName || 'Công ty'}</span>
                                </div>
                              </div>
                              <Button
                                type="text"
                                danger
                                icon={<HeartFilled style={{ fontSize: 20 }} />}
                                onClick={() => handleUnsaveJob(item.job.id)}
                                style={{ flexShrink: 0 }}
                              />
                            </div>

                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 10,
                              marginBottom: 16,
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                color: '#6b7280',
                                fontSize: 14,
                              }}>
                                <EnvironmentOutlined />
                                <span>{item.job.location}</span>
                              </div>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                color: '#6b7280',
                                fontSize: 14,
                              }}>
                                <DollarOutlined />
                                <span>
                                  {item.job.salaryMin?.toLocaleString()} - {item.job.salaryMax?.toLocaleString()} VNĐ
                                </span>
                              </div>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                color: '#6b7280',
                                fontSize: 14,
                              }}>
                                <ClockCircleOutlined />
                                <span>
                                  Lưu {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                            </div>

                            <div style={{
                              display: 'flex',
                              gap: 8,
                              flexWrap: 'wrap',
                              marginBottom: 16,
                            }}>
                              <Tag
                                color="blue"
                                style={{
                                  borderRadius: 6,
                                  padding: '4px 12px',
                                  border: 'none',
                                }}
                              >
                                {item.job.jobType}
                              </Tag>
                              <Tag
                                color="green"
                                style={{
                                  borderRadius: 6,
                                  padding: '4px 12px',
                                  border: 'none',
                                }}
                              >
                                {item.job.level}
                              </Tag>
                            </div>

                            <Button
                              type="primary"
                              block
                              onClick={() => router.push(`/jobs/${item.job.id}`)}
                              style={{
                                height: 44,
                                borderRadius: 10,
                                background: 'linear-gradient(135deg, #16a34a 0%, #16a34a 100%)',
                                border: 'none',
                                fontWeight: 600,
                              }}
                            >
                              Xem chi tiết
                            </Button>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              ),
            },
            {
              key: 'companies',
              label: (
                <span style={{ fontSize: 15, fontWeight: 600 }}>
                  Công ty ({savedCompanies.length})
                </span>
              ),
              children: (
                <div style={{ marginTop: 24 }}>
                  {loadingCompanies ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                      <Spin size="large" />
                    </div>
                  ) : savedCompanies.length === 0 ? (
                    <Card style={{
                      borderRadius: 16,
                      border: '1px solid #e5e7eb',
                      textAlign: 'center',
                      padding: '60px 20px',
                    }}>
                      <div style={{ fontSize: 64, marginBottom: 16 }}>🏢</div>
                      <h3 style={{
                        fontSize: 20,
                        fontWeight: 600,
                        color: '#111827',
                        marginBottom: 8,
                      }}>
                        Bạn chưa lưu công ty nào
                      </h3>
                      <p style={{
                        fontSize: 14,
                        color: '#6b7280',
                        marginBottom: 24,
                      }}>
                        Theo dõi các công ty bạn quan tâm để cập nhật tin tức và cơ hội việc làm mới nhất.
                      </p>
                      <Button
                        type="primary"
                        size="large"
                        icon={<ArrowRightOutlined />}
                        onClick={() => router.push('/companies')}
                        style={{
                          height: 48,
                          borderRadius: 12,
                          background: 'linear-gradient(135deg, #16a34a 0%, #16a34a 100%)',
                          border: 'none',
                          fontWeight: 600,
                        }}
                      >
                        Khám phá công ty
                      </Button>
                    </Card>
                  ) : (
                    <Row gutter={[20, 20]}>
                      {savedCompanies.map((item: any) => (
                        <Col xs={24} lg={12} key={item.id}>
                          <Card
                            hoverable
                            style={{
                              borderRadius: 16,
                              border: '1px solid #e5e7eb',
                              height: '100%',
                              transition: 'all 0.3s',
                              cursor: 'pointer',
                            }}
                            styles={{ body: { padding: 24 } }}
                            onClick={() => router.push(`/companies/${item.company.id}`)}
                          >
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              marginBottom: 16,
                            }}>
                              <div style={{ flex: 1 }}>
                                <h3
                                  style={{
                                    fontSize: 18,
                                    fontWeight: 700,
                                    color: '#111827',
                                    marginBottom: 8,
                                  }}
                                >
                                  {item.company.name}
                                </h3>
                                {item.company.address && (
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    color: '#6b7280',
                                    fontSize: 14,
                                    marginBottom: 8,
                                  }}>
                                    <EnvironmentOutlined style={{ color: '#9ca3af' }} />
                                    <span>{item.company.address}</span>
                                  </div>
                                )}
                                {item.company.companySize && (
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    color: '#6b7280',
                                    fontSize: 14,
                                  }}>
                                    <TeamOutlined style={{ color: '#9ca3af' }} />
                                    <span>{item.company.companySize} nhân viên</span>
                                  </div>
                                )}
                              </div>
                              <Button
                                type="text"
                                danger
                                icon={<HeartFilled style={{ fontSize: 20 }} />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUnsaveCompany(item.company.id);
                                }}
                                style={{ flexShrink: 0 }}
                              />
                            </div>

                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              color: '#6b7280',
                              fontSize: 14,
                              marginBottom: 16,
                            }}>
                              <ClockCircleOutlined style={{ color: '#9ca3af' }} />
                              <span>
                                Lưu {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>

                            <Button
                              type="primary"
                              block
                              onClick={() => router.push(`/companies/${item.company.id}`)}
                              style={{
                                height: 44,
                                borderRadius: 10,
                                background: 'linear-gradient(135deg, #16a34a 0%, #16a34a 100%)',
                                border: 'none',
                                fontWeight: 600,
                              }}
                            >
                              Xem chi tiết công ty
                            </Button>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}

export default function SavedJobsPage() {
  return (
    <MainLayout>
      <SavedJobsContent />
    </MainLayout>
  );
}
