import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Divider } from 'antd';
import { useRouter } from 'next/router';
import { MainLayout } from '@/components/layout/MainLayout';
import AvatarUpload from '@/components/AvatarUpload';
import { useAuthStore } from '@/store/useAuthStore';
import { userApi } from '@/lib/userApi';

export default function ProfileSettingsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const router = useRouter();
  const { user, isAuthenticated, updateUser } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
      });
      setAvatarUrl(user.avatarUrl);
    }
  }, [user, isAuthenticated, router, form]);

  const handleSubmit = async (values: any) => {
    if (!user) return;

    setLoading(true);
    try {
      const updated = await userApi.updateUser(user.id, {
        name: values.name,
        avatarUrl: avatarUrl,
      });

      // Update auth store
      updateUser(updated);
      
      message.success('Cập nhật thông tin thành công!');
    } catch (error) {
      message.error('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
        <Card title="Cài đặt tài khoản">
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ marginBottom: 16 }}>Avatar</h3>
            <AvatarUpload
              userId={user.id}
              currentAvatar={avatarUrl}
              onAvatarChange={(url) => setAvatarUrl(url || undefined)}
              size={120}
            />
          </div>

          <Divider />

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              label="Họ tên"
              name="name"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
            >
              <Input size="large" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
            >
              <Input size="large" disabled />
            </Form.Item>

            <Form.Item
              label="Loại tài khoản"
            >
              <Input 
                value={user.userType === 'job_seeker' ? 'Ứng viên' : 'Nhà tuyển dụng'} 
                size="large" 
                disabled 
              />
            </Form.Item>

            <Form.Item>
              <div style={{ display: 'flex', gap: 12 }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  size="large"
                >
                  Lưu thay đổi
                </Button>
                <Button 
                  size="large"
                  onClick={() => router.back()}
                >
                  Hủy
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </MainLayout>
  );
}
