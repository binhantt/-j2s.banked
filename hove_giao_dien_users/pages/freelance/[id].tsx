import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, Button, Descriptions, Tag, Space, Avatar, message, Spin } from 'antd';
import { UserOutlined, CalendarOutlined, DollarOutlined } from '@ant-design/icons';
import { ClientInfoModal } from '@/features/freelance/ClientInfoModal';
import { ProjectProgressTracker } from '@/features/freelance/ProjectProgressTracker';
import { DepositPaymentCard } from '@/features/freelance/DepositPaymentCard';
import { ApplyProjectModal } from '@/features/freelance/ApplyProjectModal';
import ApplicantsList from '@/features/freelance/ApplicantsList';
import { useAuthStore } from '@/store/useAuthStore';
import {MainLayout} from '@/components/layout/MainLayout';
import { freelanceApi } from '@/lib/freelanceApi';
import { api } from '@/lib/api';

export default function FreelanceProjectDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuthStore();
  const [project, setProject] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [clientModalVisible, setClientModalVisible] = useState(false);
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applicationCount, setApplicationCount] = useState(0);
  const [hasApplied, setHasApplied] = useState(false);
  const [myApplication, setMyApplication] = useState<any>(null);
  const [applyLoading, setApplyLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadProject();
      loadMilestones();
      loadApplicationInfo();
    }
  }, [id, user]);

  const loadApplicationInfo = async () => {
    if (!id) return;
    
    try {
      // Load application count
      const countData = await freelanceApi.getApplicationCount(Number(id));
      setApplicationCount(countData.count);

      // Check if current user has applied and get application details
      if (user?.id) {
        const checkData = await freelanceApi.checkApplication(Number(id), user.id);
        setHasApplied(checkData.hasApplied);
        
        // If applied, load application details
        if (checkData.hasApplied) {
          try {
            const applications = await freelanceApi.getFreelancerApplications(user.id);
            const myApp = applications.find((app: any) => app.projectId === Number(id));
            setMyApplication(myApp);
          } catch (error) {
            console.error('Error loading application details:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error loading application info:', error);
    }
  };

  const loadProject = async () => {
    try {
      setLoading(true);
      const data = await freelanceApi.getProject(Number(id));
      setProject(data);
    } catch (error) {
      console.error('Error loading project:', error);
      message.error('Không thể tải thông tin dự án');
    } finally {
      setLoading(false);
    }
  };

  const loadMilestones = async () => {
    try {
      const data = await freelanceApi.getMilestonesByProject(Number(id));
      setMilestones(data);
    } catch (error) {
      console.error('Error loading milestones:', error);
    }
  };

  const handleApply = () => {
    setApplyModalVisible(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusTag = (status: string) => {
    const map = {
      draft: { color: 'default', text: 'Nháp' },
      open: { color: 'blue', text: 'Đang tuyển' },
      in_progress: { color: 'processing', text: 'Đang thực hiện' },
      completed: { color: 'success', text: 'Hoàn thành' },
      cancelled: { color: 'error', text: 'Đã hủy' },
    };
    const info = map[status as keyof typeof map] || { color: 'default', text: status };
    return <Tag color={info.color} style={{ fontSize: '13px', padding: '4px 12px' }}>{info.text}</Tag>;
  };

  const handlePayDeposit = async () => {
    if (!project?.id) return;
    
    setPaymentLoading(true);
    try {
      await freelanceApi.payDeposit(project.id);
      message.success('Thanh toán thành công!');
      await loadProject();
    } catch (error) {
      console.error('Payment error:', error);
      message.error('Thanh toán thất bại');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  if (!project) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <p>Không tìm thấy dự án</p>
          <Button onClick={() => router.back()}>Quay lại</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ 
        background: 'linear-gradient(to right, #2563eb, #0891b2, #14b8a6)',
        minHeight: '300px',
        padding: '60px 24px 120px'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
       
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <div>
              {getStatusTag(project.status)}
            </div>
            <h1 style={{ 
              fontSize: '36px', 
              fontWeight: 700,
              color: '#fff',
              margin: 0,
              lineHeight: 1.3
            }}>
              {project.title}
            </h1>
            <Space size="large" wrap style={{ color: 'rgba(255,255,255,0.9)' }}>
              <span style={{ fontSize: '16px' }}>
                <CalendarOutlined /> Hạn: {project.deadline ? new Date(project.deadline).toLocaleDateString('vi-VN') : 'Chưa có'}
              </span>
              <span style={{ fontSize: '16px', fontWeight: 600 }}>
                <DollarOutlined /> {formatCurrency(project.budget)}
              </span>
            </Space>
          </Space>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '-80px auto 0', padding: '0 24px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 32 }}>
          {/* Left Column */}
          <div>
            {/* Description */}
            <Card 
              style={{ 
                marginBottom: 32,
                borderRadius: '16px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
              }}
            >
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: 20 }}>
                📋 Mô tả dự án
              </h2>
              <p style={{ 
                fontSize: '15px', 
                lineHeight: 1.8, 
                whiteSpace: 'pre-wrap',
                color: '#4a5568'
              }}>
                {project.description}
              </p>

              {/* Apply Button - Only show for non-clients and when deposit is paid */}
              {user?.id !== project.clientId && (
                <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #e2e8f0' }}>
                  {project.depositStatus === 'paid' ? (
                    hasApplied && myApplication ? (
                      myApplication.status === 'rejected' ? (
                        // Rejected - Can reapply
                        <div>
                          <div style={{
                            padding: '20px',
                            background: '#fee2e2',
                            borderRadius: '12px',
                            border: '1px solid #fca5a5',
                            marginBottom: 16
                          }}>
                            <div style={{ fontSize: '24px', marginBottom: 8, textAlign: 'center' }}>❌</div>
                            <div style={{ fontWeight: 600, color: '#991b1b', marginBottom: 4, textAlign: 'center' }}>
                              Đơn ứng tuyển đã bị từ chối
                            </div>
                            <div style={{ fontSize: '14px', color: '#7f1d1d', textAlign: 'center' }}>
                              Bạn có thể ứng tuyển lại với thông tin mới
                            </div>
                          </div>
                          
                          <Button
                            type="primary"
                            size="large"
                            block
                            style={{
                              height: '52px',
                              borderRadius: '12px',
                              fontSize: '16px',
                              fontWeight: 600,
                              background: 'linear-gradient(to right, #2563eb, #0891b2, #14b8a6)',
                              border: 'none',
                              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                            }}
                            onClick={handleApply}
                          >
                            🔄 Ứng tuyển lại
                          </Button>
                        </div>
                      ) : myApplication.status === 'accepted' ? (
                        // Accepted
                        <div style={{
                          padding: '24px',
                          background: '#d1fae5',
                          borderRadius: '12px',
                          border: '1px solid #6ee7b7'
                        }}>
                          <div style={{ fontSize: '24px', marginBottom: 12, textAlign: 'center' }}>🎉</div>
                          <div style={{ fontWeight: 600, color: '#065f46', marginBottom: 16, textAlign: 'center', fontSize: '16px' }}>
                            Chúc mừng! Bạn đã được chọn cho dự án này
                          </div>
                          
                          <div style={{ 
                            background: 'white', 
                            padding: '16px', 
                            borderRadius: '8px',
                            marginBottom: 12
                          }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
                              <div>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: 4 }}>Giá đề xuất</div>
                                <div style={{ fontSize: '18px', fontWeight: 600, color: '#0891b2' }}>
                                  {myApplication.proposedPrice?.toLocaleString('vi-VN')} VNĐ
                                </div>
                              </div>
                              <div>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: 4 }}>Thời gian ước tính</div>
                                <div style={{ fontSize: '18px', fontWeight: 600 }}>
                                  {myApplication.estimatedDuration} ngày
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ fontSize: '14px', color: '#047857', textAlign: 'center' }}>
                            Client sẽ liên hệ với bạn để bắt đầu dự án
                          </div>
                        </div>
                      ) : (
                        // Pending
                        <div style={{
                          padding: '24px',
                          background: '#dbeafe',
                          borderRadius: '12px',
                          border: '1px solid #93c5fd'
                        }}>
                          <div style={{ fontSize: '24px', marginBottom: 12, textAlign: 'center' }}>⏳</div>
                          <div style={{ fontWeight: 600, color: '#1e40af', marginBottom: 16, textAlign: 'center', fontSize: '16px' }}>
                            Bạn đã ứng tuyển dự án này
                          </div>
                          
                          <div style={{ 
                            background: 'white', 
                            padding: '16px', 
                            borderRadius: '8px',
                            marginBottom: 12
                          }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
                              <div>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: 4 }}>Giá đề xuất</div>
                                <div style={{ fontSize: '18px', fontWeight: 600, color: '#0891b2' }}>
                                  {myApplication.proposedPrice?.toLocaleString('vi-VN')} VNĐ
                                </div>
                              </div>
                              <div>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: 4 }}>Thời gian ước tính</div>
                                <div style={{ fontSize: '18px', fontWeight: 600 }}>
                                  {myApplication.estimatedDuration} ngày
                                </div>
                              </div>
                            </div>
                            
                            {myApplication.coverLetter && (
                              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e5e7eb' }}>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: 4 }}>Thư giới thiệu</div>
                                <div style={{ fontSize: '14px', color: '#374151', whiteSpace: 'pre-wrap' }}>
                                  {myApplication.coverLetter}
                                </div>
                              </div>
                            )}
                            
                            {myApplication.achievements && (
                              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e5e7eb' }}>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: 4 }}>🏆 Giải thưởng / Thành tích</div>
                                <div style={{ fontSize: '14px', color: '#374151', whiteSpace: 'pre-wrap' }}>
                                  {myApplication.achievements}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div style={{ fontSize: '14px', color: '#1e40af', textAlign: 'center' }}>
                            Client đang xem xét đơn của bạn
                          </div>
                        </div>
                      )
                    ) : (
                      <Button
                        type="primary"
                        size="large"
                        block
                        loading={applyLoading}
                        style={{
                          height: '52px',
                          borderRadius: '12px',
                          fontSize: '16px',
                          fontWeight: 600,
                          background: 'linear-gradient(to right, #2563eb, #0891b2, #14b8a6)',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                        }}
                        onClick={handleApply}
                      >
                        🚀 Ứng tuyển ngay
                      </Button>
                    )
                  ) : (
                    <div style={{
                      padding: '20px',
                      background: '#fef3c7',
                      borderRadius: '12px',
                      border: '1px solid #fbbf24',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '24px', marginBottom: 8 }}>🔒</div>
                      <div style={{ fontWeight: 600, color: '#92400e', marginBottom: 4 }}>
                        Dự án chưa mở ứng tuyển
                      </div>
                      <div style={{ fontSize: '14px', color: '#78350f' }}>
                        Client cần thanh toán ứng trước để mở ứng tuyển
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Progress Tracker */}
            <div style={{ 
              background: '#fff',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              marginBottom: 32
            }}>
              <ProjectProgressTracker 
                progress={project.progress}
                milestones={milestones}
              />
            </div>

            {/* Applicants List - Only show to project owner */}
            {user?.id === project.clientId && (
              <div style={{ 
                background: '#fff',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
              }}>
                <ApplicantsList 
                  projectId={project.id} 
                  isOwner={user?.id === project.clientId}
                />
              </div>
            )}
          </div>

          {/* Right Column */}
          <div>
            {/* Deposit Payment */}
            {user?.id === project.clientId && (
              <div style={{ marginBottom: 24 }}>
                <DepositPaymentCard
                  budget={project.budget}
                  depositAmount={project.depositAmount}
                  depositStatus={project.depositStatus}
                  onPayDeposit={handlePayDeposit}
                  loading={paymentLoading}
                />
              </div>
            )}

            {/* Client Info */}
            <Card 
              style={{ 
                marginBottom: 24,
                borderRadius: '16px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{
                  width: 100,
                  height: 100,
                  margin: '0 auto 16px',
                  borderRadius: '50%',
                  background: project.clientAvatar 
                    ? `url(${project.clientAvatar}) center/cover`
                    : 'linear-gradient(to right, #2563eb, #0891b2, #14b8a6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '4px solid #f8fafc'
                }}>
                  {!project.clientAvatar && (
                    <UserOutlined style={{ fontSize: 48, color: '#fff' }} />
                  )}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 4 }}>
                  {project.clientName || `Client #${project.clientId}`}
                </h3>
                <p style={{ color: '#8c8c8c', fontSize: '14px', margin: 0 }}>Người tuyển dụng</p>
                {project.clientEmail && (
                  <p style={{ color: '#64748b', fontSize: '13px', marginTop: 8 }}>
                    📧 {project.clientEmail}
                  </p>
                )}
              </div>

              <Button
                type="primary"
                block
                size="large"
                onClick={() => setClientModalVisible(true)}
                style={{
                  height: '48px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  background: 'linear-gradient(to right, #2563eb, #0891b2, #14b8a6)',
                  border: 'none'
                }}
              >
                Xem thông tin liên hệ
              </Button>

              <div style={{ 
                marginTop: 16,
                padding: '16px',
                background: '#f7fafc',
                borderRadius: '12px',
                fontSize: '13px',
                color: '#718096',
                textAlign: 'center',
                lineHeight: 1.6
              }}>
                🔒 Thông tin chi tiết sẽ hiển thị khi bạn được chọn
              </div>
            </Card>

            {/* Project Info */}
            <Card 
              style={{ 
                borderRadius: '16px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: 20 }}>
                📊 Thông tin dự án
              </h3>
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                {/* Applicants Count */}
                {applicationCount > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    <span style={{ color: '#718096' }}>Người ứng tuyển</span>
                    <strong style={{ fontSize: '16px', color: '#0891b2' }}>
                      {applicationCount} người
                    </strong>
                  </div>
                )}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <span style={{ color: '#718096' }}>Ngân sách</span>
                  <strong style={{ fontSize: '16px' }}>{formatCurrency(project.budget)}</strong>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <span style={{ color: '#718096' }}>Ứng trước (20%)</span>
                  <strong style={{ fontSize: '16px', color: '#0891b2' }}>
                    {formatCurrency(project.depositAmount)}
                  </strong>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <span style={{ color: '#718096' }}>Hạn chót</span>
                  <span style={{ fontWeight: 500 }}>
                    {project.deadline ? new Date(project.deadline).toLocaleDateString('vi-VN') : 'Chưa có'}
                  </span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '12px 0'
                }}>
                  <span style={{ color: '#718096' }}>Đăng lúc</span>
                  <span style={{ fontWeight: 500 }}>
                    {project.createdAt ? new Date(project.createdAt).toLocaleDateString('vi-VN') : 'Chưa có'}
                  </span>
                </div>
              </Space>
            </Card>
          </div>
        </div>

        {/* Client Info Modal */}
        <ClientInfoModal
          visible={clientModalVisible}
          onClose={() => setClientModalVisible(false)}
          clientInfo={{
            id: project.clientId,
            name: project.clientName || `Client #${project.clientId}`,
            email: project.clientEmail || 'contact@example.com',
            phone: '0123456789',
            location: 'TP.HCM',
            avatar: project.clientAvatar || '',
          }}
        />

        {/* Apply Project Modal */}
        <ApplyProjectModal
          visible={applyModalVisible}
          onClose={() => setApplyModalVisible(false)}
          onSuccess={() => {
            setHasApplied(true);
            loadApplicationInfo();
          }}
          projectId={project.id}
          projectTitle={project.title}
          projectBudget={project.budget}
          freelancerId={user?.id || 0}
          existingApplication={myApplication}
        />
      </div>
    </MainLayout>
  );
}
