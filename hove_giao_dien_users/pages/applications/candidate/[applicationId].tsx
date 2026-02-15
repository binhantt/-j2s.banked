import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Card, Button, Tag, message, Spin, Select, Space } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { api } from '@/lib/api';
import { CandidateProfileView } from '@/features/applications/CandidateProfileView';

export default function CandidateDetailPage() {
  const router = useRouter();
  const { applicationId } = router.query;
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (applicationId) {
      loadApplication();
    }
  }, [applicationId]);

  const loadApplication = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/applications/${applicationId}`);
      setApplication(response.data);
    } catch (error) {
      console.error('Load application error:', error);
      message.error('Không thể tải thông tin ứng viên');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    setUpdating(true);
    try {
      await api.put(`/api/applications/${applicationId}/status`, { status });
      message.success('Cập nhật trạng thái thành công');
      loadApplication();
    } catch (error) {
      console.error('Update status error:', error);
      message.error('Cập nhật thất bại');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'reviewing': return 'blue';
      case 'accepted': return 'green';
      case 'rejected': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'reviewing': return 'Đang xem xét';
      case 'accepted': return 'Chấp nhận';
      case 'rejected': return 'Từ chối';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!application) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <h2>Không tìm thấy đơn ứng tuyển</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          style={{ marginBottom: 16 }}
        >
          Quay lại
        </Button>
        
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, marginBottom: 8 }}>Chi tiết ứng viên</h2>
              <div style={{ color: '#666' }}>
                Ứng tuyển ngày: {new Date(application.createdAt).toLocaleDateString('vi-VN')}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Tag color={getStatusColor(application.status)} style={{ fontSize: 14, padding: '4px 12px' }}>
                {getStatusText(application.status)}
              </Tag>
              
              <Select
                value={application.status}
                onChange={handleUpdateStatus}
                loading={updating}
                style={{ width: 200 }}
                size="large"
              >
                <Select.Option value="pending">Chờ xử lý</Select.Option>
                <Select.Option value="reviewing">Đang xem xét</Select.Option>
                <Select.Option value="accepted">Chấp nhận</Select.Option>
                <Select.Option value="rejected">Từ chối</Select.Option>
              </Select>
            </div>
          </div>
        </Card>
      </div>

      {/* Cover Letter */}
      {application.coverLetter && (
        <Card title="Thư xin việc" style={{ marginBottom: 24 }}>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
            {application.coverLetter}
          </div>
        </Card>
      )}

      {/* Candidate Profile */}
      <CandidateProfileView 
        userId={application.userId} 
        cvUrl={application.cvUrl}
      />

      {/* Action Buttons */}
      <Card style={{ marginTop: 24 }}>
        <Space size="large" style={{ width: '100%', justifyContent: 'center' }}>
          <Button
            type="primary"
            size="large"
            icon={<CheckCircleOutlined />}
            onClick={() => handleUpdateStatus('accepted')}
            loading={updating}
            style={{ minWidth: 150 }}
          >
            Chấp nhận
          </Button>
          <Button
            danger
            size="large"
            icon={<CloseCircleOutlined />}
            onClick={() => handleUpdateStatus('rejected')}
            loading={updating}
            style={{ minWidth: 150 }}
          >
            Từ chối
          </Button>
        </Space>
      </Card>
    </div>
  );
}
