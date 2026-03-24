import { useState, useEffect } from 'react';
import { Card, Button, Table, Tag, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/router';
import { jobApi } from '@/lib/jobApi';

export default function MyJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user?.id) {
      loadJobs();
    }
  }, [user?.id]);

  const loadJobs = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const data = await jobApi.getJobsByUser(user.id);
      setJobs(data);
    } catch (error) {
      message.error('Không thể tải danh sách công việc');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await jobApi.deleteJob(id);
      message.success('Xóa tin tuyển dụng thành công');
      loadJobs();
    } catch (error) {
      message.error('Không thể xóa tin tuyển dụng');
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    try {
      await jobApi.toggleStatus(id);
      message.success(currentStatus === 'active' ? 'Đã dừng tuyển dụng' : 'Đã mở lại tuyển dụng');
      loadJobs();
    } catch (error) {
      message.error('Không thể cập nhật trạng thái tuyển dụng');
    }
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Đang tuyển' : 'Đã đóng'}
        </Tag>
      ),
    },
    {
      title: 'Ứng tuyển',
      dataIndex: 'applications',
      key: 'applications',
      render: (applications: number) => (
        <span style={{ fontWeight: 'bold', color: applications > 0 ? '#1890ff' : '#999' }}>
          {applications || 0} ứng viên
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => router.push(`/jobs/${record.id}`)}
          >
            Xem tin
          </Button>
          <Button
            type="primary"
            size="small"
            onClick={() => router.push(`/applications/job/${record.id}`)}
            disabled={!record.applications || record.applications === 0}
          >
            Xem ứng viên ({record.applications || 0})
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => router.push(`/jobs/edit/${record.id}`)}
          >
            Sửa
          </Button>
          <Popconfirm
            title={record.status === 'active' ? 'Dừng tuyển dụng tin này?' : 'Mở lại tuyển dụng tin này?'}
            onConfirm={() => handleToggleStatus(record.id, record.status)}
          >
            <Button type="link" style={{ color: record.status === 'active' ? '#fa8c16' : '#52c41a' }}>
              {record.status === 'active' ? 'Dừng tuyển dụng' : 'Mở lại tuyển'}
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Bạn có chắc muốn xóa?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        <Card
          title="Quản lý tin tuyển dụng"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push('/jobs/post')}
            >
              Đăng tin mới
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={jobs}
            loading={loading}
            rowKey="id"
          />
        </Card>
      </div>
    </MainLayout>
  );
}

