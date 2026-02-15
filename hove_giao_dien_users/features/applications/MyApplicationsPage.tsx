import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, message, Alert, Space, Progress, Tooltip } from 'antd';
import { EyeOutlined, DeleteOutlined, CheckCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { applicationApi } from '@/lib/applicationApi';
import { useAuthStore } from '@/store/useAuthStore';
import dayjs from 'dayjs';

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jobsInfo, setJobsInfo] = useState<any>({});
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.id) {
      loadApplications();
    }
  }, [user?.id]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await applicationApi.getUserApplications(user.id);
      setApplications(data);
      
      // Load job info for each application
      const jobIds = [...new Set(data.map((app: any) => app.jobPostingId))];
      const jobsData: any = {};
      
      await Promise.all(
        jobIds.map(async (jobId) => {
          try {
            const response = await fetch(`http://localhost:8080/api/jobs/${jobId}`);
            if (response.ok) {
              const job = await response.json();
              jobsData[jobId] = job;
            } else {
              console.warn(`Job ${jobId} not found or error: ${response.status}`);
            }
          } catch (error) {
            console.error(`Error loading job ${jobId}:`, error);
          }
        })
      );
      
      setJobsInfo(jobsData);
      
      // Check for newly accepted applications
      const acceptedApps = data.filter((app: any) => app.status === 'accepted');
      if (acceptedApps.length > 0) {
        message.success({
          content: `Chúc mừng! Bạn có ${acceptedApps.length} đơn ứng tuyển được chấp nhận`,
          duration: 5,
        });
      }
    } catch (error) {
      message.error('Không thể tải danh sách ứng tuyển');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await applicationApi.deleteApplication(id);
      message.success('Đã hủy ứng tuyển');
      loadApplications();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const handleConfirm = async (id: number) => {
    try {
      await applicationApi.confirmApplication(id);
      message.success('Đã xác nhận đi làm! Tin tuyển dụng sẽ được ẩn.');
      loadApplications();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  const statusMap: any = {
    'pending': { text: 'Chờ xét duyệt', color: 'blue' },
    'reviewing': { text: 'Đang xem xét', color: 'orange' },
    'accepted': { text: 'Đã chấp nhận', color: 'green' },
    'rejected': { text: 'Đã từ chối', color: 'red' },
  };

  const getRoundProgress = (currentRound: number, totalRounds: number) => {
    const percent = totalRounds > 0 ? (currentRound / totalRounds) * 100 : 0;
    const status = currentRound >= totalRounds ? 'success' : 'active';
    
    return (
      <Tooltip title={`Vòng ${currentRound}/${totalRounds}`}>
        <Progress 
          percent={percent} 
          size="small" 
          status={status}
          style={{ width: 120 }}
          format={() => `${currentRound}/${totalRounds}`}
        />
      </Tooltip>
    );
  };

  const columns = [
    {
      title: 'Công việc',
      dataIndex: 'jobPostingId',
      key: 'jobPostingId',
      render: (id: number) => {
        const job = jobsInfo[id];
        return job ? (
          <div>
            <div style={{ fontWeight: 500 }}>{job.title}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{job.companyName}</div>
          </div>
        ) : (
          `Job #${id}`
        );
      },
    },
    {
      title: 'Tiến độ phỏng vấn',
      key: 'round',
      render: (_: any, record: any) => {
        const job = jobsInfo[record.jobPostingId];
        const currentRound = record.currentRound || 0;
        const totalRounds = job?.interviewRounds || 1;
        
        if (record.status === 'rejected') {
          return <Tag color="red">Đã bị loại</Tag>;
        }
        
        if (record.status === 'pending') {
          return <Tag color="blue">Chưa bắt đầu</Tag>;
        }
        
        if (currentRound >= totalRounds && record.status === 'accepted') {
          return (
            <Space>
              <TrophyOutlined style={{ color: '#52c41a' }} />
              <Tag color="success">Hoàn thành</Tag>
            </Space>
          );
        }
        
        return getRoundProgress(currentRound, totalRounds);
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusMap[status]?.color || 'default'}>
          {statusMap[status]?.text || status}
        </Tag>
      ),
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
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => router.push(`/jobs/${record.jobPostingId}`)}
          >
            Xem tin
          </Button>
          {record.status === 'accepted' && !record.userConfirmed && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleConfirm(record.id)}
            >
              Xác nhận đi làm
            </Button>
          )}
          {record.status === 'accepted' && record.userConfirmed && (
            <Tag color="success">Đã xác nhận</Tag>
          )}
          {record.status === 'pending' && (
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            >
              Hủy
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '40px 20px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Accepted Applications Alert */}
      {applications.filter((app: any) => app.status === 'accepted').length > 0 && (
        <Alert
          message="Chúc mừng! Bạn đã được chấp nhận"
          description={
            <Space direction="vertical" style={{ width: '100%' }}>
              <p>Bạn có {applications.filter((app: any) => app.status === 'accepted').length} đơn ứng tuyển được chấp nhận.</p>
              <p>Các tin tuyển dụng này sẽ được ẩn khỏi danh sách tìm kiếm của bạn.</p>
            </Space>
          }
          type="success"
          icon={<CheckCircleOutlined />}
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      <Card title="Danh sách ứng tuyển của tôi">
        <Table
          columns={columns}
          dataSource={applications}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}
