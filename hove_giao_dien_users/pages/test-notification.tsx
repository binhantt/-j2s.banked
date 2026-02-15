import { useState } from 'react';
import { Button, Card, Form, Input, Select, message } from 'antd';
import { MainLayout } from '@/components/layout/MainLayout';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

export default function TestNotificationPage() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await api.post('/api/notifications/create', {
        userId: user?.id || 1,
        type: values.type,
        title: values.title,
        message: values.message,
        relatedEntityType: 'job_application',
        relatedEntityId: 1,
      });
      message.success('Tạo thông báo thành công! Reload trang để xem.');
      form.resetFields();
    } catch (error) {
      console.error('Error:', error);
      message.error('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card title="Test Tạo Thông Báo">
          <p className="mb-4 text-gray-600">
            User ID hiện tại: <strong>{user?.id || 'Chưa đăng nhập'}</strong>
          </p>
          
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              type: 'application_accepted',
              title: 'Chúc mừng! Đơn ứng tuyển của bạn đã được chấp nhận',
              message: 'Đơn ứng tuyển của bạn cho vị trí "Senior Developer" đã được chấp nhận. Công ty sẽ liên hệ với bạn sớm.',
            }}
          >
            <Form.Item
              name="type"
              label="Loại thông báo"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value="application_accepted">Đơn được chấp nhận</Select.Option>
                <Select.Option value="application_rejected">Đơn bị từ chối</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="message"
              label="Nội dung"
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Tạo Thông Báo Test
              </Button>
            </Form.Item>
          </Form>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Lưu ý:</strong> Sau khi tạo thông báo, reload trang để thấy thông báo xuất hiện trong navbar.
            </p>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
