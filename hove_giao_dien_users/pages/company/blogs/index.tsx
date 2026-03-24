import { useState, useEffect } from 'react';
import { Button, Table, Space, Modal, Form, Input, Select, message, Tag, Card, Row, Col, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, PictureOutlined } from '@ant-design/icons';
import { MainLayout } from '@/components/layout/MainLayout';
import { companyBlogApi, CompanyBlog } from '@/lib/companyBlogApi';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/router';

const { TextArea } = Input;

export default function CompanyBlogsIndexPage() {
  const [blogs, setBlogs] = useState<CompanyBlog[]>([]);
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const { user } = useAuthStore();
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
    
    loadCompanyAndBlogs();
  }, [user]);

  const loadCompanyAndBlogs = async () => {
    if (!user?.id) return;
    
    try {
      // Get company first
      const companyResponse = await api.get(`/api/companies/hr/${user.id}`);
      const company = companyResponse.data;
      
      if (!company || !company.id) {
        message.warning('Bạn chưa tạo công ty. Vui lòng tạo công ty trước.');
        return;
      }
      
      setCompanyId(company.id);
      loadBlogs();
    } catch (error) {
      console.error('Error loading company:', error);
      message.error('Không thể tải thông tin công ty');
    }
  };

  const loadBlogs = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const data = await companyBlogApi.getBlogsByHR(user.id);
      setBlogs(data);
    } catch (error: any) {
      console.error('Error loading blogs:', error);
      message.error(error.message || 'Không thể tải danh sách blog');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    router.push('/company/blogs/create');
  };

  const handleEdit = (blog: CompanyBlog) => {
    router.push(`/company/blogs/edit/${blog.id}`);
  };

  const handleDelete = async (id: number) => {
    try {
      await companyBlogApi.deleteBlog(id);
      message.success('Xóa blog thành công');
      loadBlogs();
    } catch (error: any) {
      console.error('Error deleting blog:', error);
      message.error(error.message || 'Có lỗi xảy ra khi xóa blog');
    }
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: CompanyBlog) => (
        <div>
          <div className="font-semibold text-gray-900 mb-1">{text}</div>
          <div className="text-sm text-gray-500 line-clamp-2">
            {record.content?.substring(0, 100)}...
          </div>
        </div>
      ),
    },
    {
      title: 'Tác giả',
      dataIndex: 'authorName',
      key: 'authorName',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'published' ? 'green' : 'green'}>
          {status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
        </Tag>
      ),
    },
    {
      title: 'Lượt xem',
      dataIndex: 'views',
      key: 'views',
      render: (views: number) => (
        <span className="flex items-center gap-1">
          <EyeOutlined className="text-gray-400" />
          {views || 0}
        </span>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: CompanyBlog) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id!)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <Row justify="space-between" align="middle">
            <Col>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Quản lý Blog Công ty
              </h1>
              <p className="text-gray-600">
                Tạo và quản lý các bài viết blog của công ty bạn
              </p>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                size="large"
              >
                Tạo blog mới
              </Button>
            </Col>
          </Row>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={blogs}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Tổng ${total} bài viết`,
            }}
          />
        </Card>
      </div>
    </MainLayout>
  );
}