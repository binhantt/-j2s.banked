import { Card, Button, Statistic, Row, Col, Alert, Space, Divider } from 'antd';
import { DollarOutlined, SafetyOutlined, CheckCircleOutlined } from '@ant-design/icons';

interface DepositPaymentCardProps {
  budget: number;
  depositAmount: number;
  depositStatus: 'pending' | 'paid' | 'refunded';
  onPayDeposit: () => void;
  loading?: boolean;
}

export const DepositPaymentCard = ({ 
  budget, 
  depositAmount, 
  depositStatus,
  onPayDeposit,
  loading = false
}: DepositPaymentCardProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusInfo = () => {
    switch (depositStatus) {
      case 'paid':
        return {
          color: 'success',
          icon: <CheckCircleOutlined />,
          text: 'Đã thanh toán',
          description: 'Số tiền ứng trước đã được thanh toán và bảo quản an toàn'
        };
      case 'refunded':
        return {
          color: 'warning',
          icon: <SafetyOutlined />,
          text: 'Đã hoàn tiền',
          description: 'Số tiền đã được hoàn trả'
        };
      default:
        return {
          color: 'info',
          icon: <DollarOutlined />,
          text: 'Chờ thanh toán',
          description: 'Vui lòng thanh toán 20% để đăng dự án'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const percentage = Math.round((depositAmount / budget) * 100);

  return (
    <Card
      style={{
        background: 'linear-gradient(to right, #2563eb, #0891b2, #14b8a6)',
        border: 'none',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)'
      }}
    >
      <div style={{ color: 'white' }}>
        <div style={{ 
          fontSize: '18px', 
          fontWeight: 600, 
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <SafetyOutlined style={{ fontSize: 24 }} />
          <span>Thanh toán ứng trước</span>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ 
            background: 'rgba(255,255,255,0.15)', 
            padding: '20px',
            borderRadius: '12px',
            marginBottom: 12
          }}>
            <div style={{ fontSize: '13px', marginBottom: 8, opacity: 0.9 }}>
              Tổng giá trị dự án
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700 }}>
              {formatCurrency(budget)}
            </div>
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.25)', 
            padding: '20px',
            borderRadius: '12px',
            border: '2px solid rgba(255,255,255,0.3)'
          }}>
            <div style={{ fontSize: '13px', marginBottom: 8, opacity: 0.9 }}>
              Cần ứng trước ({percentage}%)
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700 }}>
              {formatCurrency(depositAmount)}
            </div>
          </div>
        </div>

        <div style={{ 
          background: 'rgba(255,255,255,0.15)', 
          padding: '16px',
          borderRadius: '12px',
          marginBottom: 20
        }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '15px' }}>
              {statusInfo.icon}
              <span style={{ fontWeight: 600 }}>{statusInfo.text}</span>
            </div>
            <div style={{ fontSize: '13px', opacity: 0.9, lineHeight: 1.5 }}>
              {statusInfo.description}
            </div>
          </Space>
        </div>

        {depositStatus === 'pending' && (
          <>
            <Button
              type="primary"
              size="large"
              block
              onClick={onPayDeposit}
              loading={loading}
              style={{
                height: '52px',
                fontSize: '16px',
                fontWeight: 600,
                background: 'white',
                color: '#2563eb',
                border: 'none',
                borderRadius: '12px',
                marginBottom: 16,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              💳 Thanh toán ngay
            </Button>

            <div style={{ 
              fontSize: '12px', 
              textAlign: 'center',
              opacity: 0.85,
              lineHeight: 1.5
            }}>
              <SafetyOutlined /> Số tiền được bảo quản an toàn bởi hệ thống Escrow
            </div>
          </>
        )}

        {depositStatus === 'paid' && (
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.3)',
            textAlign: 'center'
          }}>
            <CheckCircleOutlined style={{ fontSize: 32, marginBottom: 8 }} />
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Đã thanh toán thành công</div>
            <div style={{ fontSize: '13px', opacity: 0.9 }}>
              Số tiền được giữ an toàn và chỉ chuyển cho freelancer khi hoàn thành
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
