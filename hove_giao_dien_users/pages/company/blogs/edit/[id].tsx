import { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Form, 
  Input, 
  Select, 
  message, 
  Row,
  Col,
  Space,
  Spin
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { MainLayout } from '@/components/layout/MainLayout';
import { companyBlogApi, CompanyBlog } from '@/lib/companyBlogApi';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/router';

const { TextArea } = Input;
const { Option } = Select;

export default function EditBlogPage() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [blog, setBlog] = useState<CompanyBlog | null>(null);
  const [form] = Form.useForm();
  const { user } = useAuthStore();
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!user) {
      return;
    }
    
    if (user.userType !== 'hr') {
      message.error('Bạn không có quyền truy cập trang này');
      router.push('/');
      return;
    }

    if (!user.companyId) {
      message.error('Không tìm thấy thông tin công ty');
      router.push('/company/manage');
      return;
    }

    if (id) {
      loadBlog();
    }
  }, [user, router, id]);

  const loadBlog = async () => {
    if (!id || Array.isArray(id)) return;
    
    setInitialLoading(true);
    try {
      const blogData = await companyBlogApi.getBlog(parseInt(id));
      
      // Check if this blog belongs to the user's company
      if (blogData.companyId !== user?.companyId) {
        message.error('Bạn không có quyền chỉnh sửa blog này');
        router.push('/company/blogs');
        return;
      }
      
      setBlog(blogData);
      form.setFieldsValue({
        title: blogData.title,
        content: blogData.content,
        imageUrl: blogData.imageUrl,
        authorName: blogData.authorName,
        status: blogData.status,
      });
    } catch (error: any) {
      console.error('Error loading blog:', error);
      message.error(error.message || 'Không thể tải thông tin blog');
      router.push('/company/blogs');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    if (!blog || !user?.companyId) {
      message.error('Không tìm thấy thông tin blog hoặc công ty');
      return;
    }

    setLoading(true);
    try {
      const blogData: CompanyBlog = {
        companyId: user.companyId,
        title: values.title,
        content: values.content,
        imageUrl: values.imageUrl,
        authorName: values.authorName,
        status: values.status,
      };

      await companyBlogApi.updateBlog(blog.id!, blogData);
      message.success('Cập nhật blog thành công');
      router.push('/company/blogs');
    } catch (error: any) {
      console.error('Error updating blog:', error);
      message.error(error.message || 'Có lỗi xảy ra khi cập nhật blog');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/company/blogs');
  };

  if (initialLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  if (!blog) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center">
            <h1 className="text-xl text-gray-600">Không tìm thấy blog</h1>
            <Button onClick={handleBack} className="mt-4">
              Quay lại danh sách
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack}
            className="mb-4"
          >
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Chỉnh sửa Blog
          </h1>
          <p className="text-gray-600">
            Cập nhật thông tin bài viết blog
          </p>
        </div>

        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
            >
              <Input placeholder="Nhập tiêu đề blog" size="large" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="authorName"
                  label="Tác giả"
                  rules={[{ required: true, message: 'Vui lòng nhập tên tác giả' }]}
                >
                  <Input placeholder="Nhập tên tác giả" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Trạng thái"
                  rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                >
                  <Select placeholder="Chọn trạng thái">
                    <Option value="draft">Bản nháp</Option>
                    <Option value="published">Xuất bản</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="imageUrl"
              label="Ảnh đại diện (URL)"
            >
              <Input placeholder="https://example.com/image.jpg" />
            </Form.Item>

            <Form.Item
              name="content"
              label="Nội dung"
              rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
            >
              <TextArea 
                rows={15} 
                placeholder="Nhập nội dung blog..."
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  icon={<SaveOutlined />}
                  size="large"
                >
                  Cập nhật blog
                </Button>
                <Button onClick={handleBack} size="large">
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </MainLayout>
  );
}