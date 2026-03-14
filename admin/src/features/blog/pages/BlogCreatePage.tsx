import { Form, Input, Button, Card, Space, Typography, Select, message } from 'antd';
import type { CreateBlogPostPayload } from '../types/blogTypes';
import { blogApi } from '../api/blogApi';

const { Title } = Typography;

interface BlogCreatePageProps {
  onBackToList: () => void;
}

export function BlogCreatePage({ onBackToList }: BlogCreatePageProps) {
  const [form] = Form.useForm<CreateBlogPostPayload>();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      await blogApi.createPost({
        ...values,
        image: values.image || null,
      });

      message.success('Tạo bài viết thành công');
      form.resetFields();
      onBackToList();
    } catch {
      // validateFields đã hiển thị lỗi, chỉ báo lỗi khi call API fail
      message.error('Không thể tạo bài viết');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ marginBottom: 4, color: '#0b1220' }}>
          Tạo bài viết blog mới
        </Title>
      </div>

      <Card style={{ borderRadius: 14 }}>
        <Form form={form} layout="vertical">
          <Form.Item<CreateBlogPostPayload>
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Tiêu đề bài viết" />
          </Form.Item>

          <Form.Item<CreateBlogPostPayload>
            name="excerpt"
            label="Mô tả ngắn"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả ngắn' }]}
          >
            <Input.TextArea rows={2} placeholder="Mô tả ngắn sẽ hiển thị ở danh sách" />
          </Form.Item>

          <Space style={{ width: '100%' }} size="middle">
            <Form.Item<CreateBlogPostPayload>
              style={{ flex: 1 }}
              name="author"
              label="Tác giả"
              rules={[{ required: true, message: 'Vui lòng nhập tên tác giả' }]}
            >
              <Input placeholder="Tên tác giả" />
            </Form.Item>

            <Form.Item<CreateBlogPostPayload>
              style={{ flex: 1 }}
              name="category"
              label="Danh mục"
              rules={[{ required: true, message: 'Vui lòng nhập danh mục' }]}
            >
              <Input placeholder="Ví dụ: Kiến thức, Hướng dẫn..." />
            </Form.Item>
          </Space>

          <Space style={{ width: '100%' }} size="middle">
            <Form.Item<CreateBlogPostPayload>
              style={{ flex: 1 }}
              name="readTime"
              label="Thời gian đọc"
              rules={[{ required: true, message: 'Vui lòng nhập thời gian đọc' }]}
              initialValue="5 phút đọc"
            >
              <Input placeholder="Ví dụ: 5 phút đọc" />
            </Form.Item>

            <Form.Item<CreateBlogPostPayload> style={{ flex: 1 }} name="image" label="Ảnh (URL)">
              <Input placeholder="Đường dẫn ảnh (nếu có)" />
            </Form.Item>
          </Space>

          <Form.Item<CreateBlogPostPayload> name="tags" label="Tags">
            <Select mode="tags" style={{ width: '100%' }} placeholder="Nhập và nhấn Enter để thêm tag" />
          </Form.Item>

          <Form.Item<CreateBlogPostPayload>
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung bài viết' }]}
          >
            <Input.TextArea rows={8} placeholder="Nội dung chi tiết bài viết" />
          </Form.Item>

          <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={onBackToList}>Hủy</Button>
            <Button type="primary" onClick={() => void handleSubmit()}>
              Tạo bài viết
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
}

