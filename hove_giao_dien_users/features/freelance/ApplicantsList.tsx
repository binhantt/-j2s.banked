import React, { useState, useEffect } from 'react';
import {
  Card,
  Avatar,
  Tag,
  Button,
  Row,
  Col,
  Divider,
  Modal,
  Typography,
  Space,
  Empty,
  message,
  Tabs,
} from 'antd';
import {
  UserOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import { freelanceApi } from '@/lib/freelanceApi';
import { FreelancerProfileView } from './FreelancerProfileView';
import { api } from '@/lib/api';
import { cvApi } from '@/lib/cvApi';

const { Text, Title, Paragraph } = Typography;

interface Applicant {
  applicationId: number;
  freelancerId: number;
  freelancerName: string;
  freelancerEmail: string;
  avatarUrl?: string;
  currentPosition?: string;
  hometown?: string;
  currentLocation?: string;
  location?: string; // alias for currentLocation
  cvUrl?: string;
  certificateImages?: string;
  phone?: string;
  bio?: string;
  status: string;
  coverLetter?: string;
  achievements?: string;
  proposedPrice: number;
  estimatedDuration: number;
  appliedAt: string;
}

interface ApplicantsListProps {
  projectId: number;
  isOwner: boolean;
}

export default function ApplicantsList({ projectId, isOwner }: ApplicantsListProps) {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    loadApplicants();
  }, [projectId]);

  const loadApplicants = async () => {
    try {
      setLoading(true);
      const data = await freelanceApi.getProjectApplicants(projectId);
      setApplicants(data);
    } catch (error) {
      console.error('Error loading applicants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: number, status: string) => {
    try {
      await freelanceApi.updateApplicationStatus(applicationId, status);
      message.success(status === 'accepted' ? 'Đã chấp nhận ứng viên' : 'Đã từ chối ứng viên');
      loadApplicants();
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Cập nhật thất bại');
    }
  };

  const handleViewDetails = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setDetailsOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      default: return 'warning';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted': return 'Đã chấp nhận';
      case 'rejected': return 'Đã từ chối';
      default: return 'Chờ xét duyệt';
    }
  };

  if (loading) {
    return <Text>Đang tải...</Text>;
  }

  if (!isOwner) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Text type="secondary">
          Chỉ chủ dự án mới có thể xem danh sách ứng viên
        </Text>
      </div>
    );
  }

  if (applicants.length === 0) {
    return (
      <Empty
        description="Chưa có ứng viên nào ứng tuyển"
        style={{ padding: '40px 0' }}
      />
    );
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>
        Danh sách ứng viên ({applicants.length})
      </Title>

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {applicants.map((applicant) => (
          <Card key={applicant.applicationId} hoverable>
            <Row gutter={16}>
              <Col flex="80px">
                <Avatar
                  src={applicant.avatarUrl}
                  size={64}
                  icon={<UserOutlined />}
                />
              </Col>
              
              <Col flex="auto">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                  <div>
                    <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
                      {applicant.freelancerName}
                    </Title>
                    
                    {applicant.currentPosition && (
                      <div style={{ marginBottom: 4 }}>
                        <IdcardOutlined style={{ marginRight: 6, color: '#1890ff' }} />
                        <Text type="secondary">{applicant.currentPosition}</Text>
                      </div>
                    )}
                    
                    {applicant.currentLocation && (
                      <div>
                        <EnvironmentOutlined style={{ marginRight: 6, color: '#52c41a' }} />
                        <Text type="secondary">{applicant.currentLocation}</Text>
                      </div>
                    )}
                  </div>
                  
                  <Tag color={getStatusColor(applicant.status)}>
                    {getStatusLabel(applicant.status)}
                  </Tag>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                <Row gutter={16} style={{ marginBottom: 12 }}>
                  <Col span={12}>
                    <Text type="secondary">Giá đề xuất:</Text>
                    <div>
                      <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                        {applicant.proposedPrice?.toLocaleString('vi-VN')} VNĐ
                      </Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">Thời gian ước tính:</Text>
                    <div>
                      <Text strong style={{ fontSize: 16 }}>
                        {applicant.estimatedDuration} ngày
                      </Text>
                    </div>
                  </Col>
                </Row>

                {applicant.coverLetter && (
                  <div style={{ marginBottom: 12 }}>
                    <Text type="secondary">Thư giới thiệu:</Text>
                    <Paragraph ellipsis={{ rows: 2, expandable: false }} style={{ margin: '4px 0 0 0' }}>
                      {applicant.coverLetter}
                    </Paragraph>
                  </div>
                )}

                <Space wrap>
                  <Button
                    size="small"
                    onClick={() => handleViewDetails(applicant)}
                  >
                    Xem chi tiết
                  </Button>

                  {applicant.cvUrl && (
                    <Button
                      size="small"
                      type="primary"
                      icon={<FileTextOutlined />}
                      onClick={async () => {
                        try {
                          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                          if (!currentUser.id) {
                            message.error('Vui lòng đăng nhập');
                            return;
                          }
                          
                          // Find CV ID from cvUrl
                          const response = await api.get(`/api/user-cvs/user/${applicant.freelancerId}`);
                          const cvs = response.data;
                          const cv = cvs.find((c: any) => c.fileUrl === applicant.cvUrl || 
                                                          `http://localhost:8080${c.fileUrl}` === applicant.cvUrl);
                          
                          if (!cv) {
                            message.error('Không tìm thấy CV');
                            return;
                          }
                          
                          // Generate secure token
                          const { token } = await cvApi.generateViewToken(cv.id, currentUser.id);
                          const viewUrl = `http://localhost:8080/api/cv/view/${token}`;
                          window.open(viewUrl, '_blank');
                        } catch (error: any) {
                          console.error('View CV error:', error);
                          message.error(error.response?.data?.error || 'Không thể xem CV');
                        }
                      }}
                    >
                      Xem CV ứng tuyển
                    </Button>
                  )}

                  {applicant.status === 'pending' && (
                    <>
                      <Button
                        size="small"
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleStatusUpdate(applicant.applicationId, 'accepted')}
                      >
                        Chấp nhận
                      </Button>
                      <Button
                        size="small"
                        danger
                        icon={<CloseCircleOutlined />}
                        onClick={() => handleStatusUpdate(applicant.applicationId, 'rejected')}
                      >
                        Từ chối
                      </Button>
                    </>
                  )}
                </Space>
              </Col>
            </Row>
          </Card>
        ))}
      </Space>

      {/* Details Modal */}
      <Modal
        title={
          <Space>
            <Avatar src={selectedApplicant?.avatarUrl} icon={<UserOutlined />} />
            <div>
              <div>{selectedApplicant?.freelancerName}</div>
              {selectedApplicant?.currentPosition && (
                <Text type="secondary" style={{ fontSize: 14 }}>
                  {selectedApplicant.currentPosition}
                </Text>
              )}
            </div>
          </Space>
        }
        open={detailsOpen}
        onCancel={() => setDetailsOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={900}
      >
        {selectedApplicant && (
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="📋 Thông tin ứng tuyển" key="1">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <MailOutlined style={{ marginRight: 8 }} />
                  <Text>{selectedApplicant.freelancerEmail}</Text>
                </div>

                {selectedApplicant.phone && (
                  <div>
                    <PhoneOutlined style={{ marginRight: 8 }} />
                    <Text>{selectedApplicant.phone}</Text>
                  </div>
                )}

                {selectedApplicant.currentPosition && (
                  <div>
                    <IdcardOutlined style={{ marginRight: 8 }} />
                    <Text strong>Vị trí công việc: </Text>
                    <Text>{selectedApplicant.currentPosition}</Text>
                  </div>
                )}

                {selectedApplicant.currentLocation && (
                  <div>
                    <EnvironmentOutlined style={{ marginRight: 8 }} />
                    <Text strong>Địa điểm: </Text>
                    <Text>{selectedApplicant.currentLocation}</Text>
                  </div>
                )}

                {selectedApplicant.bio && (
                  <div>
                    <Divider />
                    <Text strong>Giới thiệu bản thân:</Text>
                    <Paragraph style={{ marginTop: 8 }}>{selectedApplicant.bio}</Paragraph>
                  </div>
                )}

                {selectedApplicant.coverLetter && (
                  <div>
                    <Divider />
                    <Text strong>Thư giới thiệu:</Text>
                    <Paragraph style={{ marginTop: 8 }}>{selectedApplicant.coverLetter}</Paragraph>
                  </div>
                )}

                {selectedApplicant.achievements && (
                  <div>
                    <Divider />
                    <Text strong>🏆 Giải thưởng / Thành tích:</Text>
                    <Paragraph style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
                      {selectedApplicant.achievements}
                    </Paragraph>
                  </div>
                )}

                <Divider />

                <Row gutter={16}>
                  <Col span={12}>
                    <Text type="secondary">Giá đề xuất:</Text>
                    <div>
                      <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                        {selectedApplicant.proposedPrice?.toLocaleString('vi-VN')} VNĐ
                      </Title>
                    </div>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">Thời gian ước tính:</Text>
                    <div>
                      <Title level={4} style={{ margin: 0 }}>
                        {selectedApplicant.estimatedDuration} ngày
                      </Title>
                    </div>
                  </Col>
                </Row>
              </Space>
            </Tabs.TabPane>

            <Tabs.TabPane tab="👤 Hồ sơ chi tiết" key="2">
              <FreelancerProfileView 
                userId={selectedApplicant.freelancerId}
                cvUrl={selectedApplicant.cvUrl}
              />
            </Tabs.TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
}
