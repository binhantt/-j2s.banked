import { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, message, Select, Modal, Space, Progress } from 'antd';
import { UserOutlined, MessageOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { applicationApi } from '@/lib/applicationApi';
import { chatApi } from '@/lib/chatApi';
import { useAuthStore } from '@/store/useAuthStore';
import { CandidateProfileView } from './CandidateProfileView';
import dayjs from 'dayjs';

export default function JobApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [jobInfo, setJobInfo] = useState<any>(null);
  const router = useRouter();
  const { jobId } = router.query;
  const { user } = useAuthStore();

  useEffect(() => {
    if (jobId) {
      loadApplications();
      loadJobInfo();
    }
  }, [jobId]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await applicationApi.getJobApplications(Number(jobId));
      setApplications(data);
    } catch (error) {
      message.error('Không thể tải danh sách ứng viên');
    } finally {
      setLoading(false);
    }
  };

  const loadJobInfo = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/jobs/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        setJobInfo(data);
      } else {
        console.warn(`Job ${jobId} not found: ${response.status}`);
      }
    } catch (error) {
      console.error('Error loading job info:', error);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await applicationApi.updateStatus(id, status);
      message.success('Đã cập nhật trạng thái');
      loadApplications();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const handleRoundUpdate = async (id: number, action: 'pass' | 'fail') => {
    try {
      await applicationApi.updateRound(id, action);
      message.success(action === 'pass' ? 'Ứng viên đã qua vòng!' : 'Ứng viên đã bị loại');
      loadApplications();
      setSelectedApp(null);
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  const handleStartChat = async (application: any) => {
    try {
      // Create or get existing conversation
      const conversation = await chatApi.createConversation({
        hrId: user?.id,
        jobSeekerId: application.userId,
        jobPostingId: Number(jobId),
      });
      
      // Navigate to chat page
      router.push(`/chat/${conversation.id}`);
    } catch (error) {
      message.error('Không thể bắt đầu cuộc trò chuyện');
    }
  };

  const statusMap: any = {
    'pending': { text: 'Chờ xét duyệt', color: 'blue' },
    'reviewing': { text: 'Đang xem xét', color: 'orange' },
    'accepted': { text: 'Đã chấp nhận', color: 'green' },
    'rejected': { text: 'Đã từ chối', color: 'red' },
  };

  const getRoundProgress = (currentRound: number, totalRounds: number) => {
    const percent = (currentRound / totalRounds) * 100;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Progress 
          percent={percent} 
          size="small" 
          style={{ width: 100 }}
          format={() => `${currentRound}/${totalRounds}`}
        />
      </div>
    );
  };

  const columns = [
    {
      title: 'Ứng viên',
      dataIndex: 'userId',
      key: 'userId',
      render: (id: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserOutlined />
          <span>User #{id}</span>
        </div>
      ),
    },
    {
      title: 'Vòng phỏng vấn',
      key: 'round',
      render: (_: any, record: any) => {
        const currentRound = record.currentRound || 0;
        const totalRounds = jobInfo?.interviewRounds || 1;
        return getRoundProgress(currentRound, totalRounds);
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: any = {
          'pending': { text: 'Chờ xét duyệt', color: 'blue' },
          'reviewing': { text: 'Đang xem xét', color: 'orange' },
          'accepted': { text: 'Đã chấp nhận', color: 'green' },
          'rejected': { text: 'Đã từ chối', color: 'red' },
        };
        return <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>;
      },
    },
    {
      title: 'Ngày ứng tuyển',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="primary"
            onClick={() => setSelectedApp(record)}
          >
            Xem chi tiết
          </Button>
          <Button
            icon={<MessageOutlined />}
            onClick={() => handleStartChat(record)}
          >
            Chat
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '40px 20px', maxWidth: 1400, margin: '0 auto' }}>
      <Card 
        title={`Danh sách ứng viên (${applications.length})`}
        extra={
          <Button onClick={() => router.back()}>
            Quay lại
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={applications}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết ứng viên"
        open={!!selectedApp}
        onCancel={() => setSelectedApp(null)}
        width={900}
        footer={
          selectedApp && (
            <Space>
              <Button onClick={() => setSelectedApp(null)}>
                Đóng
              </Button>
              
              {/* Chỉ hiển thị nút Qua vòng/Loại khi đang reviewing */}
              {selectedApp.status === 'reviewing' && (
                <>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleRoundUpdate(selectedApp.id, 'pass')}
                    style={{ background: '#52c41a' }}
                  >
                    Qua vòng
                  </Button>
                  <Button
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => handleRoundUpdate(selectedApp.id, 'fail')}
                  >
                    Loại
                  </Button>
                </>
              )}
              
              {/* Nếu pending, cho phép bắt đầu xét duyệt */}
              {selectedApp.status === 'pending' && (
                <Button
                  type="primary"
                  onClick={() => {
                    handleStatusChange(selectedApp.id, 'reviewing');
                    setSelectedApp(null);
                  }}
                >
                  Bắt đầu xét duyệt
                </Button>
              )}
              
              {/* Nếu bị loại, cho phép trở lại reviewing */}
              {selectedApp.status === 'rejected' && (
                <Button
                  type="primary"
                  onClick={() => {
                    handleStatusChange(selectedApp.id, 'reviewing');
                    setSelectedApp(null);
                  }}
                >
                  Cho cơ hội thứ 2
                </Button>
              )}
              
              {/* Dropdown thay đổi trạng thái cho các trường hợp khác */}
              {selectedApp.status !== 'accepted' && (
                <Select
                  value={selectedApp.status}
                  style={{ width: 150 }}
                  onChange={(value) => {
                    handleStatusChange(selectedApp.id, value);
                    setSelectedApp(null);
                  }}
                >
                  <Select.Option value="pending">Chờ xét duyệt</Select.Option>
                  <Select.Option value="reviewing">Đang xem xét</Select.Option>
                  <Select.Option value="accepted">Chấp nhận</Select.Option>
                  <Select.Option value="rejected">Từ chối</Select.Option>
                </Select>
              )}
            </Space>
          )
        }
      >
        {selectedApp && (
          <div>
            <div style={{ marginBottom: 16, padding: 16, background: '#f0f2f5', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <strong>Trạng thái:</strong>
                  <Tag color={statusMap[selectedApp.status]?.color} style={{ marginLeft: 8 }}>
                    {statusMap[selectedApp.status]?.text}
                  </Tag>
                </div>
                <div style={{ color: '#666', fontSize: 13 }}>
                  Ứng tuyển: {dayjs(selectedApp.createdAt).format('DD/MM/YYYY HH:mm')}
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <strong>Tiến độ phỏng vấn:</strong>
                {getRoundProgress(
                  selectedApp.currentRound || 0,
                  jobInfo?.interviewRounds || 1
                )}
                <span style={{ color: '#666', fontSize: 13 }}>
                  Vòng {selectedApp.currentRound || 0}/{jobInfo?.interviewRounds || 1}
                </span>
              </div>
            </div>

            {selectedApp.coverLetter && (
              <Card title="Thư xin việc" style={{ marginBottom: 16 }}>
                <div style={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                  {selectedApp.coverLetter}
                </div>
              </Card>
            )}

            <CandidateProfileView 
              userId={selectedApp.userId} 
              cvUrl={selectedApp.cvUrl}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
