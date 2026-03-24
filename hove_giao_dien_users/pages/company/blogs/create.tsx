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
  Space
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { MainLayout } from '@/components/layout/MainLayout';
import { companyBlogApi, CompanyBlog } from '@/lib/companyBlogApi';
import { companyApi } from '@/lib/companyApi';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/router';

const { TextArea } = Input;
const { Option } = Select;

export default function CreateBlogPage() {
  const [loading, setLoading] = useState(false);
  const [checkingCompany, setCheckingCompany] = useState(true);
  const [form] = Form.useForm();
  const { user, updateUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      return;
    }
    
    if (user.userType !== 'hr') {
      message.error('Bạn không có quyền truy cập trang này');
      router.push('/');
      return;
    }

    checkCompanyExists();
  }, [user, router]);

  const checkCompanyExists = async () => {
    if (!user?.id) return;
    
    setCheckingCompany(true);
    try {
      // Try to get company by HR ID
      const company = await companyApi.getCompanyByHrId(user.id);
      
      if (!company) {
        message.warning('Bạn chưa tạo công ty. Vui lòng tạo công ty trước khi đăng blog.');
        router.push('/company/manage');
        return;
      }
      
      // Update user store with companyId if not already set
      if (company.id && !user.companyId) {
        updateUser({ ...user, companyId: company.id });
      }
    } catch (error: any) {
      console.error('Error checking company:', error);
      message.error('Không thể kiểm tra thông tin công ty');
      router.push('/company/manage');
    } finally {
      setCheckingCompany(false);
    }
  };

  const handleSubmit = async (values: any) => {
    if (!user?.id) {
      message.error('Không tìm thấy thông tin người dùng');
      return;
    }

    setLoading(true);
    try {
      // Get company info again to ensure we have the latest companyId
      const company = await companyApi.getCompanyByHrId(user.id);
      
      if (!company?.id) {
        message.error('Không tìm thấy thông tin công ty');
        router.push('/company/manage');
        return;
      }

      const blogData: CompanyBlog = {
        companyId: company.id,
        title: values.title,
        content: values.content,
        imageUrl: values.imageUrl,
        authorName: values.authorName || user.name || 'Công ty',
        status: values.status || 'draft',
      };

      await companyBlogApi.createBlog(blogData);
      message.success('Tạo blog thành công');
      router.push('/company/blogs');
    } catch (error: any) {
      console.error('Error creating blog:', error);
      message.error(error.message || 'Có lỗi xảy ra khi tạo blog');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/company/blogs');
  };

  if (checkingCompany) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang kiểm tra thông tin công ty...</p>
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
            Tạo Blog Mới
          </h1>
          <p className="text-gray-600">
            Tạo bài viết blog mới cho công ty của bạn
          </p>
        </div>

        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              authorName: user?.name || '',
              status: 'draft'
            }}
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
                  Tạo blog
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