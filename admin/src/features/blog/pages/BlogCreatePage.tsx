import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Space, 
  Typography, 
  Select, 
  App, 
  Row, 
  Col, 
  Divider 
} from 'antd';
import {
  EditOutlined,
  FileTextOutlined,
  UserOutlined,
  FolderOpenOutlined,
  ClockCircleOutlined,
  PictureOutlined,
  TagsOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { CreateBlogPostPayload } from '../types/blogTypes';
import { blogApi } from '../api/blogApi';
import { useBlogStore } from '../store/useBlogStore';

const { Title, Text } = Typography;

interface BlogCreatePageProps {
  onBackToList: () => void;
}

export function BlogCreatePage({ onBackToList }: BlogCreatePageProps) {
  const [form] = Form.useForm<CreateBlogPostPayload>();
  const loadPosts = useBlogStore((state) => state.loadPosts);
  const { message } = App.useApp();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const result = await blogApi.createPost({
        ...values,
        image: values.image || null,
      });
      
      message.success('Tạo bài viết thành công');
      form.resetFields();
      await loadPosts();
      onBackToList();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể tạo bài viết';
      message.error(errorMessage);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Space direction="vertical" size={4}>
          <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Tạo bài viết mới
          </Title>
          <Text style={{ color: '#64748b', fontSize: 15 }}>
            Chia sẻ kiến thức và tin mới nhất đến cộng đồng
          </Text>
        </Space>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={onBackToList}
          style={{ borderRadius: 12, height: 40, fontWeight: 600 }}
        >
          Quay lại
        </Button>
      </div>

      <Card 
        style={{ 
          borderRadius: 24, 
          boxShadow: '0 4px 20px rgba(15,23,42,0.03)', 
          border: '1px solid #f1f5f9',
          padding: '12px'
        }}
      >
        <Form form={form} layout="vertical" size="large">
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item<CreateBlogPostPayload>
                name="title"
                label={<Space><EditOutlined /> Tiêu đề bài viết</Space>}
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
              >
                <Input 
                  placeholder="Ví dụ: Lộ trình trở thành Senior Developer 2026" 
                  style={{ borderRadius: 12, padding: '12px 16px' }}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item<CreateBlogPostPayload>
                name="excerpt"
                label={<Space><FileTextOutlined /> Mô tả ngắn</Space>}
                rules={[{ required: true, message: 'Vui lòng nhập mô tả ngắn' }]}
              >
                <Input.TextArea 
                  rows={2} 
                  placeholder="Tóm tắt nội dung bài viết trong 1-2 câu..." 
                  style={{ borderRadius: 12, padding: '12px 16px' }}
                />
              </Form.Item>
            </Col>

            <Divider style={{ margin: '12px 0 24px' }} />

            <Col span={12}>
              <Form.Item<CreateBlogPostPayload>
                name="author"
                label={<Space><UserOutlined /> Tác giả</Space>}
                rules={[{ required: true, message: 'Vui lòng nhập tên tác giả' }]}
              >
                <Input placeholder="Tên tác giả hoặc Ban biên tập" style={{ borderRadius: 12 }} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item<CreateBlogPostPayload>
                name="category"
                label={<Space><FolderOpenOutlined /> Danh mục</Space>}
                rules={[{ required: true, message: 'Vui lòng nhập danh mục' }]}
              >
                <Input placeholder="Ví dụ: Kiến thức, Hướng dẫn, Review" style={{ borderRadius: 12 }} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item<CreateBlogPostPayload>
                name="readTime"
                label={<Space><ClockCircleOutlined /> Thời gian đọc</Space>}
                rules={[{ required: true, message: 'Vui lòng nhập thời gian đọc' }]}
                initialValue="5 phút đọc"
              >
                <Input placeholder="Ví dụ: 5 phút đọc" style={{ borderRadius: 12 }} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item<CreateBlogPostPayload> 
                name="image" 
                label={<Space><PictureOutlined /> Ảnh bìa (URL)</Space>}
              >
                <Input placeholder="https://example.com/banner.jpg" style={{ borderRadius: 12 }} />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item<CreateBlogPostPayload> 
                name="tags" 
                label={<Space><TagsOutlined /> Thẻ (Tags)</Space>}
              >
                <Select 
                  mode="tags" 
                  style={{ width: '100%' }} 
                  placeholder="Nhập và nhấn Enter để thêm tag" 
                  tokenSeparators={[',']}
                  dropdownStyle={{ borderRadius: 12 }}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item<CreateBlogPostPayload>
                name="content"
                label={<Space><EditOutlined /> Nội dung chi tiết</Space>}
                rules={[{ required: true, message: 'Vui lòng nhập nội dung bài viết' }]}
              >
                <Input.TextArea 
                  rows={10} 
                  placeholder="Viết nội dung bài viết tại đây..." 
                  style={{ borderRadius: 16, padding: '16px' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '24px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button 
              size="large" 
              onClick={onBackToList}
              style={{ borderRadius: 12, minWidth: 120, height: 48, fontWeight: 600 }}
            >
              Hủy bỏ
            </Button>
            <Button 
              type="primary" 
              size="large"
              icon={<PlusOutlined />}
              onClick={() => void handleSubmit()}
              style={{ 
                borderRadius: 12, 
                minWidth: 180, 
                height: 48, 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                border: 'none',
                boxShadow: '0 8px 16px rgba(22,163,74,0.2)'
              }}
            >
              Phát hành bài viết
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
