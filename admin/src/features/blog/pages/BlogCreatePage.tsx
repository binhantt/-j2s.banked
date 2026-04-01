import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Space, 
  Typography, 
  App, 
  Row, 
  Col, 
  Divider,
  Tooltip,
  Select
} from 'antd';
import {
  EditOutlined,
  UserOutlined,
  ClockCircleOutlined,
  PictureOutlined,
  TagsOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  FacebookOutlined,
  InstagramOutlined,
  GlobalOutlined,
  BoldOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import { useRef, useState, useEffect } from 'react';
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
  const textAreaRef = useRef<any>(null);
  const [activeCategories, setActiveCategories] = useState<any[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await blogApi.getActiveCategories();
      setActiveCategories(data);
    } catch (error) {
      console.error('Failed to load categories');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      await blogApi.createPost({
        ...values,
        image: values.image || null,
        tags: Array.isArray(values.tags) ? values.tags.join(',') : (values.tags || ''),
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

  const insertFormat = (tagOpen: string, tagClose: string) => {
    const textArea = textAreaRef.current?.resizableTextArea?.textArea;
    if (!textArea) return;

    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const text = form.getFieldValue('content') || '';
    const selectedText = text.substring(start, end);
    const beforeText = text.substring(0, start);
    const afterText = text.substring(end);

    const newText = `${beforeText}${tagOpen}${selectedText}${tagClose}${afterText}`;
    form.setFieldsValue({ content: newText });

    setTimeout(() => {
      textArea.focus();
      textArea.setSelectionRange(start + tagOpen.length, end + tagOpen.length);
    }, 0);
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 100 }}>
      {/* Header Section */}
      <div style={{ marginBottom: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Space direction="vertical" size={2}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #16a34a, #22c55e)', borderRadius: 16, display: 'grid', placeItems: 'center', color: '#fff', boxShadow: '0 8px 16px rgba(22,163,74,0.2)' }}>
              <EditOutlined style={{ fontSize: 24 }} />
            </div>
            <Title level={1} style={{ margin: 0, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', fontSize: 32 }}>
              Tạo bài viết mới
            </Title>
          </div>
          <Text style={{ color: '#64748b', fontSize: 17, marginLeft: 68 }}>
            Xuất bản kiến thức và cập nhật tin tức cho cộng đồng tìm việc
          </Text>
        </Space>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={onBackToList}
          type="text"
          style={{ borderRadius: 12, height: 44, fontWeight: 700, color: '#64748b' }}
        >
          QUAY LẠI DANH SÁCH
        </Button>
      </div>

      <Form form={form} layout="vertical" size="large">
        <Row gutter={32}>
          <Col span={16}>
            <Card style={{ borderRadius: 32, boxShadow: '0 10px 40px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9', padding: 12 }}>
              <Form.Item<CreateBlogPostPayload>
                name="title"
                label={<Text strong style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tiêu đề bài viết</Text>}
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
              >
                <Input 
                  placeholder="Tiêu đề thu hút người đọc..." 
                  style={{ borderRadius: 16, height: 64, fontSize: 22, fontWeight: 900, border: '2px solid #e2e8f0', boxShadow: 'none' }}
                />
              </Form.Item>

              <Form.Item<CreateBlogPostPayload>
                name="excerpt"
                label={<Text strong style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mô tả ngắn (SEO)</Text>}
                rules={[{ required: true, message: 'Vui lòng nhập mô tả ngắn' }]}
              >
                <Input.TextArea 
                  rows={2} 
                  placeholder="Tóm tắt ngắn gọn nội dung bài viết để hiển thị trên kết quả tìm kiếm..." 
                  style={{ borderRadius: 16, padding: '16px 20px', background: '#f8fafc', border: 'none', fontSize: 15 }}
                />
              </Form.Item>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 12 }}>
                <Text strong style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nội dung chi tiết</Text>
                <div style={{ background: '#f1f5f9', padding: '6px', borderRadius: 16, display: 'flex', gap: '4px', border: '1px solid #e2e8f0' }}>
                  <Tooltip title="In đậm">
                    <Button type="text" className="hover-tool" icon={<BoldOutlined style={{ color: '#475569' }} />} onClick={() => insertFormat('<b>', '</b>')} style={{ borderRadius: 10, width: 36, height: 36 }} />
                  </Tooltip>
                  <Tooltip title="Chèn Code">
                    <Button type="text" className="hover-tool" icon={<CodeOutlined style={{ color: '#475569' }} />} onClick={() => insertFormat('<pre><code>', '</code></pre>')} style={{ borderRadius: 10, width: 36, height: 36 }} />
                  </Tooltip>
                  <Tooltip title="Chèn liên kết">
                    <Button type="text" className="hover-tool" icon={<GlobalOutlined style={{ color: '#475569' }} />} onClick={() => insertFormat('<a href="#">', '</a>')} style={{ borderRadius: 10, width: 36, height: 36 }} />
                  </Tooltip>
                </div>
              </div>
              <Form.Item<CreateBlogPostPayload>
                name="content"
                rules={[{ required: true, message: 'Vui lòng nhập nội dung bài viết' }]}
                style={{ marginBottom: 0 }}
              >
                <Input.TextArea 
                  ref={textAreaRef}
                  rows={18} 
                  placeholder="Bắt đầu viết nội dung tại đây... (Sử dụng thanh công cụ để định dạng Bold/Code)" 
                  style={{ borderRadius: 24, padding: '28px', border: '2px solid #e2e8f0', fontSize: 17, lineHeight: 1.8, boxShadow: 'none' }}
                />
              </Form.Item>
            </Card>
          </Col>

          <Col span={8}>
            <Card style={{ borderRadius: 32, boxShadow: '0 10px 40px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9', position: 'sticky', top: 24, padding: 8 }}>
              <Space direction="vertical" size={28} style={{ width: '100%' }}>
                <div>
                  <Title level={5} style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: 18 }}>
                    <ClockCircleOutlined style={{ color: '#16a34a' }} /> Thông tin xuất bản
                  </Title>
                  <Form.Item<CreateBlogPostPayload>
                    name="author"
                    label={<Text strong style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>TÁC GIẢ</Text>}
                    rules={[{ required: true, message: 'Nhập tên tác giả' }]}
                    style={{ marginBottom: 16 }}
                  >
                    <Input placeholder="Tên tác giả" prefix={<UserOutlined style={{ color: '#16a34a', marginRight: 8 }} />} style={{ borderRadius: 12, height: 48, border: '1.5px solid #e2e8f0' }} />
                  </Form.Item>

                  <Form.Item<CreateBlogPostPayload>
                    name="category"
                    label={<Text strong style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>CHUYÊN MỤC</Text>}
                    rules={[{ required: true, message: 'Chọn chuyên mục' }]}
                    style={{ marginBottom: 16 }}
                  >
                    <Select 
                      placeholder="Chọn chuyên mục" 
                      dropdownStyle={{ borderRadius: 12 }} 
                      style={{ borderRadius: 12, height: 48 }}
                    >
                      {activeCategories.map(cat => (
                        <Select.Option key={cat.id} value={cat.name}>{cat.name}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item<CreateBlogPostPayload>
                    name="readTime"
                    label={<Text strong style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>ƯỚC TÍNH ĐỌC</Text>}
                    initialValue="5 phút đọc"
                    style={{ marginBottom: 16 }}
                  >
                    <Input prefix={<ClockCircleOutlined style={{ color: '#16a34a', marginRight: 8 }} />} style={{ borderRadius: 12, height: 48, border: '1.5px solid #e2e8f0' }} />
                  </Form.Item>

                  <Form.Item<CreateBlogPostPayload> 
                    name="image" 
                    label={<Text strong style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>ẢNH BÌA (URL)</Text>}
                    style={{ marginBottom: 0 }}
                  >
                    <Input prefix={<PictureOutlined style={{ color: '#16a34a', marginRight: 8 }} />} placeholder="https://..." style={{ borderRadius: 12, height: 48, border: '1.5px solid #e2e8f0' }} />
                  </Form.Item>
                </div>

                <Divider style={{ margin: 0 }} />

                <div>
                  <Title level={5} style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: 18 }}>
                    <TagsOutlined style={{ color: '#16a34a' }} /> Mạng xã hội & Thẻ
                  </Title>
                  <Form.Item<CreateBlogPostPayload> name="facebookLink" noStyle>
                    <Input placeholder="Facebook Link" prefix={<FacebookOutlined style={{ color: '#1877f2', marginRight: 8 }} />} style={{ borderRadius: 12, height: 48, border: '1.5px solid #e2e8f0', marginBottom: 16 }} />
                  </Form.Item>
                  <Form.Item<CreateBlogPostPayload> name="instagramLink" noStyle>
                    <Input placeholder="Instagram Link" prefix={<InstagramOutlined style={{ color: '#e4405f', marginRight: 8 }} />} style={{ borderRadius: 12, height: 48, border: '1.5px solid #e2e8f0', marginBottom: 16 }} />
                  </Form.Item>
                  
                  <Form.Item<CreateBlogPostPayload> name="tags" noStyle>
                    <Input placeholder="Tags (ngăn cách bởi dấu phẩy)" prefix={<TagsOutlined style={{ color: '#16a34a', marginRight: 8 }} />} style={{ borderRadius: 12, height: 48, border: '1.5px solid #e2e8f0' }} />
                  </Form.Item>
                </div>

                <Button 
                  type="primary" 
                  size="large"
                  block
                  icon={<PlusOutlined />}
                  onClick={() => void handleSubmit()}
                  style={{ 
                    borderRadius: 16, 
                    height: 64, 
                    fontWeight: 900,
                    fontSize: 18,
                    background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                    border: 'none',
                    boxShadow: '0 12px 24px rgba(22,163,74,0.2)',
                    marginTop: 12
                  }}
                >
                  XUẤT BẢN BÀI VIẾT
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
      <style>{`
        .hover-tool:hover { background: #fff !important; }
      `}</style>
    </div>
  );
}
