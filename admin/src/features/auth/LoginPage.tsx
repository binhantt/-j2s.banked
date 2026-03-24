import { Alert, Button, Card, Checkbox, Form, Input, Typography, message } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import type { LoginPayload } from './types/authTypes';

const { Title, Text } = Typography;

export function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const bannedError = useAuthStore((state) => state.bannedError);
  const clearError = useAuthStore((state) => state.clearError);
  const clearBannedError = useAuthStore((state) => state.clearBannedError);
  const logout = useAuthStore((state) => state.logout);

  // Tự động logout + xóa localStorage khi phát hiện tài khoản bị khóa
  useEffect(() => {
    if (bannedError) {
      message.error(bannedError, 3);
      // Xóa auth-store khỏi localStorage để không bị re-hydrate lại token cũ khi reload
      localStorage.removeItem('auth-store');
      logout();
      clearBannedError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bannedError]);

  const handleLogin = async (values: LoginPayload) => {
    clearError();
    try {
      await login(values);
      message.success('Đăng nhập thành công');
    } catch {
      // error handled via store state
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Abstract Background Patterns */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        opacity: 0.4,
        zIndex: 0,
        pointerEvents: 'none',
      }}>
        {/* Top Left Shape */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          left: '-100px',
          width: '400px',
          height: '400px',
          borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
          background: 'linear-gradient(135deg, rgba(22,163,74,0.1), rgba(34,197,94,0.05))',
          filter: 'blur(40px)',
          animation: 'float 20s ease-in-out infinite alternate',
        }} />
        
        {/* Bottom Right Shape */}
        <div style={{
          position: 'absolute',
          bottom: '-150px',
          right: '-100px',
          width: '500px',
          height: '500px',
          borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
          background: 'linear-gradient(135deg, rgba(22,163,74,0.08), rgba(15,23,42,0.03))',
          filter: 'blur(60px)',
          animation: 'float 25s ease-in-out infinite alternate-reverse',
        }} />

        {/* Pattern Dots Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(rgba(22,163,74,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Floating Elements */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '15%', left: '10%',
          width: 24, height: 24, borderRadius: '50%',
          border: '4px solid rgba(22,163,74,0.15)',
          animation: 'floatY 6s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '15%',
          width: 32, height: 32,
          border: '4px solid rgba(22,163,74,0.1)',
          transform: 'rotate(45deg)',
          animation: 'floatY 8s ease-in-out infinite reverse'
        }} />
      </div>

      <Card
        style={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 24,
          border: '1px solid rgba(0, 0, 0, 0.04)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          zIndex: 1,
        }}
        styles={{ body: { padding: '48px 40px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: 'linear-gradient(135deg, #16a34a, #22c55e)',
              margin: '0 auto 20px',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 10px 20px rgba(22,163,74,0.15)',
              color: '#fff',
              fontWeight: 800,
              fontSize: 28,
            }}
          >
            A
          </div>
          <Title level={2} style={{ 
            marginBottom: 8, 
            fontWeight: 800, 
            color: '#0f172a',
            letterSpacing: '-0.02em' 
          }}>
            Hệ thống Admin
          </Title>
          <Text style={{ color: '#64748b', fontSize: 15 }}>
            Quản trị viên vui lòng đăng nhập để tiếp tục
          </Text>
        </div>

        {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 24, borderRadius: 12 }} />}

        {bannedError && (
          <Alert
            type="error"
            showIcon
            icon={<LockOutlined />}
            message={<span style={{ fontWeight: 700 }}>Tài khoản đã bị khóa</span>}
            description={
              <span style={{ fontSize: 13 }}>
                {bannedError}
                <br />
                Vui lòng liên hệ bộ phận kỹ thuật để được hỗ trợ.
              </span>
            }
            style={{ marginBottom: 24, borderRadius: 12 }}
          />
        )}

        <Form<LoginPayload> 
          layout="vertical" 
          onFinish={handleLogin} 
          initialValues={{ remember: true }}
          requiredMark={false}
        >
          <Form.Item
            label={<span style={{ fontWeight: 600, color: '#475569', fontSize: 13 }}>ĐỊA CHỈ EMAIL</span>}
            name="email"
            rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}
          >
            <Input 
              size="large" 
              prefix={<MailOutlined style={{ color: '#94a3b8', marginRight: 8 }} />} 
              placeholder="admin@vieclam24h.vn"
              style={{ borderRadius: 12, padding: '10px 16px', border: '1px solid #e2e8f0' }}
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: 600, color: '#475569', fontSize: 13 }}>MẬT KHẨU</span>}
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
            style={{ marginBottom: 12 }}
          >
            <Input.Password 
              size="large" 
              prefix={<LockOutlined style={{ color: '#94a3b8', marginRight: 8 }} />} 
              placeholder="••••••••"
              style={{ borderRadius: 12, padding: '10px 16px', border: '1px solid #e2e8f0' }}
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: 0 }}>
              <Checkbox style={{ color: '#64748b', fontSize: 14 }}>Ghi nhớ đăng nhập</Checkbox>
            </Form.Item>
            <Button type="link" style={{ padding: 0, color: '#16a34a', fontWeight: 600, fontSize: 14 }}>
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
              height: 52,
              background: 'linear-gradient(135deg, #16a34a, #22c55e)',
              border: 'none',
              borderRadius: 14,
              fontWeight: 700,
              fontSize: 16,
              boxShadow: '0 10px 20px rgba(22,163,74,0.15)',
            }}
          >
            Đăng nhập ngay
          </Button>
        </Form>
      </Card>

      <style>{`
        @keyframes float {
          0% { transform: translate(0, 0) rotate(0deg) scale(1); }
          50% { transform: translate(20px, 40px) rotate(5deg) scale(1.05); }
          100% { transform: translate(-10px, -20px) rotate(-3deg) scale(0.95); }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(15deg); }
        }
      `}</style>
    </div>
  );
}
