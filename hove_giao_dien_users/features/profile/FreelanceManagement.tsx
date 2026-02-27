import { useState, useEffect } from 'react';
import { Card, List, Tag, Progress, Avatar, Button, Space, Empty, Modal, Descriptions, message, Tabs } from 'antd';
import { 
  UserOutlined, 
  EnvironmentOutlined, 
  DollarOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  PlusOutlined,
  MessageOutlined,
  PhoneOutlined,
  MailOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { freelanceApi } from '@/lib/freelanceApi';
import { useAuthStore } from '@/store/useAuthStore';
import { CreateProjectModal } from '@/features/freelance/CreateProjectModal';
import { PaymentManagement } from './PaymentManagement';
import ApplicantsList from '@/features/freelance/ApplicantsList';

const { TabPane } = Tabs;
import form from 'antd/es/form';
import router from 'next/dist/shared/lib/router/router';

interface Applicant {
  id: number;
  name: string;
  avatar?: string;
  location?: string;
  skills: string[];
  appliedAt: string;
}

interface FreelanceProject {
  id: number;
  title: string;
  budget: number;
  depositStatus: 'pending' | 'paid';
  status: 'open' | 'in_progress' | 'completed';
  progress: number;
  applicantsCount: number;
  selectedFreelancer?: {
    id: number;
    name: string;
    avatar?: string;
  };
  deadline: string;
  createdAt: string;
}

// Mock data
const mockProjects: FreelanceProject[] = [
  {
    id: 1,
    title: 'Thiết kế website bán hàng',
    budget: 20000000,
    depositStatus: 'paid',
    status: 'in_progress',
    progress: 65,
    applicantsCount: 12,
    selectedFreelancer: {
      id: 5,
      name: 'Trần Văn B',
      avatar: '',
    },
    deadline: '2024-12-31',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    title: 'Phát triển mobile app',
    budget: 35000000,
    depositStatus: 'paid',
    status: 'open',
    progress: 0,
    applicantsCount: 8,
    deadline: '2025-03-31',
    createdAt: '2024-02-01',
  },
];

const mockApplicants: Applicant[] = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    avatar: '',
    location: 'Hà Nội',
    skills: ['React', 'Node.js', 'MongoDB'],
    appliedAt: '2024-02-05',
  },
  {
    id: 2,
    name: 'Trần Thị B',
    avatar: '',
    location: 'TP.HCM',
    skills: ['Vue.js', 'Laravel', 'MySQL'],
    appliedAt: '2024-02-06',
  },
];

export const FreelanceManagement = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<FreelanceProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<FreelanceProject | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [applicantsModalVisible, setApplicantsModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      loadProjects();
      loadStats();
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const data = await freelanceApi.getProjectsByClient(user.id);
      setProjects(data);
    } catch (error: any) {
      console.error('Load projects error:', error);
      
      // If 403 or 404, show empty state instead of error
      if (error.response?.status === 403 || error.response?.status === 404) {
        console.log('No projects found or access denied - showing empty state');
        setProjects([]);
      } else {
        message.error('Không thể tải danh sách dự án. Vui lòng kiểm tra backend đã chạy chưa.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user?.id) return;
    
    try {
      const data = await freelanceApi.getClientStats(user.id);
      setStats(data);
    } catch (error) {
      console.error('Load stats error:', error);
    }
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
    };
    const info = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
    return <Tag color={info.color}>{info.text}</Tag>;
  };

  const handleViewApplicants = (project: FreelanceProject) => {
    setSelectedProject(project);
    setApplicants(mockApplicants);
    setApplicantsModalVisible(true);
  };

  const handleViewProject = (projectId: number) => {
    router.push(`/freelance/${projectId}`);
  };

  const handleChatWithApplicant = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setChatModalVisible(true);
  };

  const handleSelectFreelancer = (applicant: Applicant) => {
    Modal.confirm({
      title: 'Chọn Freelancer',
      content: `Bạn có chắc muốn chọn ${applicant.name} cho dự án này?`,
      okText: 'Chọn',
      cancelText: 'Hủy',
      onOk: () => {
        message.success(`Đã chọn ${applicant.name}. Thông tin liên hệ đã được mở khóa!`);
        setApplicantsModalVisible(false);
      }
    });
  };

  return (
    <>
      {/* Stats Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
          <Card style={{ background: 'linear-gradient(to right, #2563eb, #0891b2)', border: 'none' }}>
            <div style={{ color: '#fff' }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: 8 }}>Tổng ngân sách</div>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>{formatCurrency(stats.totalBudget)}</div>
            </div>
          </Card>
          <Card style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}>
            <div style={{ color: '#fff' }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: 8 }}>Đã thanh toán</div>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>{formatCurrency(stats.paidDeposit)}</div>
            </div>
          </Card>
          <Card style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}>
            <div style={{ color: '#fff' }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: 8 }}>Chờ thanh toán</div>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>{formatCurrency(stats.pendingDeposit)}</div>
            </div>
          </Card>
          <Card style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none' }}>
            <div style={{ color: '#fff' }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: 8 }}>Tổng dự án</div>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>{stats.totalProjects}</div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginTop: 4 }}>
                {stats.completedProjects} hoàn thành • {stats.inProgressProjects} đang làm
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card 
        title="📋 Quản lý dự án Freelance"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Tạo dự án mới
          </Button>
        }
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="📁 Dự án của tôi" key="1">
        {projects.length === 0 ? (
          <Empty description="Chưa có dự án nào" />
        ) : (
          <List
            dataSource={projects}
            renderItem={(project) => (
              <List.Item
                style={{
                  padding: '20px',
                  marginBottom: '16px',
                  background: '#fafafa',
                  borderRadius: '12px',
                  border: '1px solid #f0f0f0'
                }}
              >
                <div style={{ width: '100%' }}>
                  {/* Header */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: 16
                  }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ marginBottom: 8, fontSize: '18px' }}>
                        {project.title}
                      </h3>
                      <Space size="middle">
                        {getStatusTag(project.status)}
                        <span style={{ color: '#8c8c8c' }}>
                          <DollarOutlined /> {formatCurrency(project.budget)}
                        </span>
                        <span style={{ color: '#8c8c8c' }}>
                          <ClockCircleOutlined /> Hạn: {new Date(project.deadline).toLocaleDateString('vi-VN')}
                        </span>
                      </Space>
                    </div>
                    <Space>
                      <Button 
                        icon={<EyeOutlined />}
                        onClick={() => handleViewProject(project.id)}
                      >
                        Xem chi tiết
                      </Button>
                    </Space>
                  </div>

                  {/* Deposit Status */}
                  <div style={{ 
                    padding: '12px',
                    background: project.depositStatus === 'paid' ? '#f6ffed' : '#fff7e6',
                    borderRadius: '8px',
                    marginBottom: 16,
                    border: `1px solid ${project.depositStatus === 'paid' ? '#b7eb8f' : '#ffd591'}`
                  }}>
                    <Space>
                      {project.depositStatus === 'paid' ? (
                        <>
                          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                          <span style={{ color: '#52c41a', fontWeight: 600 }}>
                            Đã thanh toán ứng trước 50%
                          </span>
                        </>
                      ) : (
                        <>
                          <ClockCircleOutlined style={{ color: '#faad14', fontSize: 16 }} />
                          <span style={{ color: '#faad14', fontWeight: 600 }}>
                            Chờ thanh toán ứng trước
                          </span>
                        </>
                      )}
                    </Space>
                  </div>

                  {/* Applicants & Freelancer */}
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 16,
                    marginBottom: 16
                  }}>
                    {/* Applicants */}
                    <div style={{ 
                      padding: '16px',
                      background: 'white',
                      borderRadius: '8px',
                      border: '1px solid #e8e8e8'
                    }}>
                      <div style={{ 
                        fontSize: '14px',
                        color: '#8c8c8c',
                        marginBottom: 8
                      }}>
                        👥 Người ứng tuyển
                      </div>
                      <div style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                          {project.applicantsCount}
                        </span>
                        <Button 
                          type="link"
                          onClick={() => handleViewApplicants(project)}
                        >
                          Xem danh sách →
                        </Button>
                      </div>
                    </div>

                    {/* Selected Freelancer */}
                    <div style={{ 
                      padding: '16px',
                      background: 'white',
                      borderRadius: '8px',
                      border: '1px solid #e8e8e8'
                    }}>
                      <div style={{ 
                        fontSize: '14px',
                        color: '#8c8c8c',
                        marginBottom: 8
                      }}>
                        ⭐ Freelancer được chọn
                      </div>
                      {project.selectedFreelancer ? (
                        <Space>
                          <Avatar 
                            src={project.selectedFreelancer.avatar}
                            icon={<UserOutlined />}
                            size={32}
                          />
                          <span style={{ fontWeight: 600 }}>
                            {project.selectedFreelancer.name}
                          </span>
                        </Space>
                      ) : (
                        <span style={{ color: '#8c8c8c' }}>Chưa chọn</span>
                      )}
                    </div>
                  </div>

                  {/* Progress */}
                  {project.status === 'in_progress' && (
                    <div style={{ 
                      padding: '16px',
                      background: 'white',
                      borderRadius: '8px',
                      border: '1px solid #e8e8e8'
                    }}>
                      <div style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 8
                      }}>
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>
                          📊 Tiến độ thực hiện
                        </span>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
                          {project.progress}%
                        </span>
                      </div>
                      <Progress 
                        percent={project.progress}
                        strokeColor={{
                          '0%': '#108ee9',
                          '100%': '#87d068',
                        }}
                        status={project.progress === 100 ? 'success' : 'active'}
                      />
                    </div>
                  )}
                </div>
              </List.Item>
            )}
          />
        )}
          </TabPane>
          
          <TabPane tab="💳 Thanh toán" key="2">
            <PaymentManagement />
          </TabPane>
        </Tabs>
      </Card>

      {/* Applicants Modal */}
      <Modal
        title={
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
            👥 Danh sách ứng viên - {selectedProject?.title}
          </div>
        }
        open={applicantsModalVisible}
        onCancel={() => setApplicantsModalVisible(false)}
        footer={null}
        width={900}
      >
        {selectedProject && (
          <ApplicantsList 
            projectId={selectedProject.id} 
            isOwner={true}
          />
        )}
      </Modal>

      {/* Create Project Modal */}
      <Modal
        title={
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
            ✨ Tạo dự án Freelance mới
          </div>
        }
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <div style={{ 
          padding: '12px 16px',
          background: '#fff7e6',
          borderRadius: '8px',
          marginBottom: 24,
          border: '1px solid #ffd591'
        }}>
          <Space>
            <DollarOutlined style={{ color: '#faad14', fontSize: 18 }} />
            <span style={{ color: '#d46b08', fontWeight: 600 }}>
              Cần nạp 20% giá trị dự án để đăng bài
            </span>
          </Space>
        </div>
      </Modal>

      {/* Create Project Modal */}
      <CreateProjectModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSuccess={loadProjects}
        clientId={user?.id || 0}
      />

      {/* Chat Modal */}
      <Modal
        title={
          <Space>
            <Avatar src={selectedApplicant?.avatar} icon={<UserOutlined />} />
            <span>Chat với {selectedApplicant?.name}</span>
          </Space>
        }
        open={chatModalVisible}
        onCancel={() => setChatModalVisible(false)}
        footer={null}
        width={600}
      >
        <div style={{ 
          padding: '16px',
          background: '#f0f2f5',
          borderRadius: '8px',
          marginBottom: 16,
          minHeight: 300
        }}>
          <Empty description="Chức năng chat đang được phát triển" />
        </div>
        
        {selectedApplicant && (
          <div style={{ 
            padding: '16px',
            background: '#e6f7ff',
            borderRadius: '8px',
            border: '1px solid #91d5ff'
          }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>
              📍 Thông tin liên hệ (Hiển thị khi chọn ứng viên)
            </div>
            <Space direction="vertical" size="small">
              <Space>
                <EnvironmentOutlined />
                <span>{selectedApplicant.location}</span>
              </Space>
              <Space>
                <MailOutlined />
                <span>email@example.com</span>
              </Space>
              <Space>
                <PhoneOutlined />
                <span>0123456789</span>
              </Space>
            </Space>
          </div>
        )}
      </Modal>
    </>
  );
};
