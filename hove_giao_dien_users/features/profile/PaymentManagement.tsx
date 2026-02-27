import { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, message, Modal, Descriptions } from 'antd';
import { DollarOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { freelanceApi } from '@/lib/freelanceApi';
import { useAuthStore } from '@/store/useAuthStore';

export const PaymentManagement = () => {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const data = await freelanceApi.getProjectsByClient(user.id);
      setProjects(data);
    } catch (error) {
      console.error('Load projects error:', error);
      message.error('Không thể tải danh sách dự án');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handlePayment = (project: any) => {
    setSelectedProject(project);
    setPaymentModalVisible(true);
  };

  const handleMomoPayment = async () => {
    if (!selectedProject) return;

    setPaymentLoading(true);
    try {
      // Simulate Momo payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Call API to update payment status
      await freelanceApi.payDeposit(selectedProject.id);
      
      message.success('Thanh toán thành công qua Momo!');
      setPaymentModalVisible(false);
      loadProjects();
    } catch (error) {
      console.error('Payment error:', error);
      message.error('Thanh toán thất bại');
    } finally {
      setPaymentLoading(false);
    }
  };

  const columns = [
    {
      title: 'Dự án',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Ngân sách',
      dataIndex: 'budget',
      key: 'budget',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Ứng trước (20%)',
      dataIndex: 'depositAmount',
      key: 'depositAmount',
      render: (amount: number) => (
        <span style={{ color: '#0891b2', fontWeight: 600 }}>
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'depositStatus',
      key: 'depositStatus',
      render: (status: string) => {
        const statusMap = {
          pending: { color: 'warning', icon: <ClockCircleOutlined />, text: 'Chờ thanh toán' },
          paid: { color: 'success', icon: <CheckCircleOutlined />, text: 'Đã thanh toán' },
        };
        const info = statusMap[status as keyof typeof statusMap] || statusMap.pending;
        return (
          <Tag color={info.color} icon={info.icon}>
            {info.text}
          </Tag>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: any) => (
        record.depositStatus === 'pending' ? (
          <Button
            type="primary"
            icon={<DollarOutlined />}
            onClick={() => handlePayment(record)}
            style={{
              background: 'linear-gradient(to right, #2563eb, #0891b2, #14b8a6)',
              border: 'none'
            }}
          >
            Thanh toán
          </Button>
        ) : (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Hoàn tất
          </Tag>
        )
      ),
    },
  ];

  return (
    <>
      <Card title="💳 Quản lý thanh toán">
        <Table
          columns={columns}
          dataSource={projects}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'Chưa có dự án nào cần thanh toán' }}
        />
      </Card>

      {/* Payment Modal */}
      <Modal
        title="Thanh toán ứng trước"
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedProject && (
          <>
            <Descriptions column={1} bordered style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Dự án">
                <strong>{selectedProject.title}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng ngân sách">
                {formatCurrency(selectedProject.budget)}
              </Descriptions.Item>
              <Descriptions.Item label="Số tiền cần thanh toán">
                <span style={{ fontSize: '20px', color: '#0891b2', fontWeight: 700 }}>
                  {formatCurrency(selectedProject.depositAmount)}
                </span>
              </Descriptions.Item>
            </Descriptions>

            <div style={{
              padding: '20px',
              background: '#f0f9ff',
              borderRadius: '12px',
              marginBottom: 24,
              border: '1px solid #bae6fd'
            }}>
              <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: 12 }}>
                💡 Lưu ý quan trọng
              </div>
              <ul style={{ margin: 0, paddingLeft: 20, color: '#0c4a6e' }}>
                <li>Số tiền ứng trước là 20% tổng ngân sách dự án</li>
                <li>Tiền sẽ được giữ an toàn bởi hệ thống Escrow</li>
                <li>Chỉ chuyển cho freelancer khi dự án hoàn thành</li>
                <li>Sau khi thanh toán, dự án sẽ mở ứng tuyển</li>
              </ul>
            </div>

            {/* Momo Payment Button */}
            <Button
              type="primary"
              size="large"
              block
              loading={paymentLoading}
              onClick={handleMomoPayment}
              style={{
                height: '56px',
                fontSize: '16px',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #a50064, #d82d8b)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(165, 0, 100, 0.3)'
              }}
            >
              <Space>
                <img 
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z'/%3E%3C/svg%3E"
                  alt="Momo"
                  style={{ width: 24, height: 24 }}
                />
                <span>Thanh toán qua Momo</span>
              </Space>
            </Button>

            <div style={{
              marginTop: 16,
              textAlign: 'center',
              fontSize: '13px',
              color: '#64748b'
            }}>
              🔒 Giao dịch được bảo mật bởi Momo
            </div>
          </>
        )}
      </Modal>
    </>
  );
};
