import { useState } from 'react';
import { Button, Card, Checkbox, Form, Input, Typography } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 600);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0b1220 0%, #0f172a 45%, #16a34a 220%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 16,
          border: '1px solid #dbe5ee',
          boxShadow: '0 20px 40px rgba(2, 6, 23, 0.25)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: '#16a34a',
              margin: '0 auto 12px',
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 22,
            }}
          >
            A
          </div>
          <Title level={3} style={{ marginBottom: 4 }}>
            Đăng nhập Admin
          </Title>
          <Text type="secondary">Truy cập trang quản trị hệ thống</Text>
        </div>

        <Form layout="vertical" onFinish={handleLogin} initialValues={{ remember: true }}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}
          >
            <Input size="large" prefix={<MailOutlined />} placeholder="admin@company.vn" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password size="large" prefix={<LockOutlined />} placeholder="••••••••" />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: 0 }}>
              <Checkbox>Ghi nhớ</Checkbox>
            </Form.Item>
            <Button type="link" style={{ padding: 0 }}>
              Quên mật khẩu?
            </Button>
          </div>

          <Button
            htmlType="submit"
            type="primary"
            block
            size="large"
            loading={loading}
            style={{
              background: '#16a34a',
              borderColor: '#16a34a',
              fontWeight: 600,
            }}
          >
            Đăng nhập
          </Button>
        </Form>
      </Card>
    </div>
  );
}


