import { Modal, Avatar, Descriptions, Button, Space } from 'antd';
import { UserOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { useState } from 'react';

interface ClientInfoModalProps {
  visible: boolean;
  onClose: () => void;
  clientInfo: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    location?: string;
    avatar?: string;
  };
}

export const ClientInfoModal = ({ visible, onClose, clientInfo }: ClientInfoModalProps) => {
  const [showLocation, setShowLocation] = useState(false);

  return (
    <Modal
      title={
        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
          👤 Thông tin người tuyển dụng
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Đóng
        </Button>
      ]}
      width={600}
    >
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Avatar 
          size={100} 
          src={clientInfo.avatar} 
          icon={<UserOutlined />}
          style={{ 
            border: '4px solid #1890ff',
            boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
          }}
        />
        <h2 style={{ marginTop: 16, marginBottom: 4 }}>{clientInfo.name}</h2>
        <p style={{ color: '#8c8c8c' }}>Client</p>
      </div>

      <Descriptions column={1} bordered>
        <Descriptions.Item 
          label={<Space><MailOutlined /> Email</Space>}
        >
          <a href={`mailto:${clientInfo.email}`}>{clientInfo.email}</a>
        </Descriptions.Item>
        
        {clientInfo.phone && (
          <Descriptions.Item 
            label={<Space><PhoneOutlined /> Số điện thoại</Space>}
          >
            <a href={`tel:${clientInfo.phone}`}>{clientInfo.phone}</a>
          </Descriptions.Item>
        )}
        
        <Descriptions.Item 
          label={<Space><EnvironmentOutlined /> Địa chỉ</Space>}
        >
          {!showLocation ? (
            <Button 
              type="link" 
              onClick={() => setShowLocation(true)}
              style={{ padding: 0 }}
            >
              📍 Click để xem địa chỉ
            </Button>
          ) : (
            <div style={{ 
              padding: '12px', 
              background: '#f0f2f5', 
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              {clientInfo.location || 'Chưa cập nhật địa chỉ'}
            </div>
          )}
        </Descriptions.Item>
      </Descriptions>

      <div style={{ 
        marginTop: 16, 
        padding: '12px', 
        background: '#e6f7ff', 
        borderRadius: '8px',
        border: '1px solid #91d5ff'
      }}>
        <Space>
          <span style={{ fontSize: '16px' }}>ℹ️</span>
          <span style={{ fontSize: '13px', color: '#0050b3' }}>
            Thông tin liên hệ chỉ hiển thị khi bạn được chọn cho dự án này
          </span>
        </Space>
      </div>
    </Modal>
  );
};
