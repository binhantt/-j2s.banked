import { useState, useEffect } from 'react';
import { Button, Table, Space, Modal, Form, Input, Select, message, Tag, Card, Row, Col, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, PictureOutlined } from '@ant-design/icons';
import { MainLayout } from '@/components/layout/MainLayout';
import { companyBlogApi, CompanyBlog } from '@/lib/companyBlogApi';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/router';

const { TextArea } = Input;

export default function CompanyBlogsPage() {
  const [blogs, setBlogs] = useState<CompanyBlog[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageGalleryVisible, setImageGalleryVisible] = useState(false);
  const [companyImages, setCompanyImages] = useState<any[]>([]);
  const [editingBlog, setEditingBlog] = useState<CompanyBlog | null>(null);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [form] = Form.useForm();
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
      loadCompanyImages(company.id);
    } catch (error) {
      console.error('Error loading company:', error);
      message.error('Không thể tải thông tin công ty');
    }
  };

  const loadCompanyImages = async (companyId: number) => {
    try {
      const response = await api.get(`/api/company-images/company/${companyId}`);
      setCompanyImages(response.data);
    } catch (error) {
      console.error('Error loading company images:', error);
    }
  };

  const handleSelectImage = (imageUrl: string) => {
    form.setFieldsValue({ imageUrl });
    setImageGalleryVisible(false);
    message.success('Đã chọn ảnh');
  };

  const loadBlogs = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const data = await companyBlogApi.getBlogsByHR(user.id);
      setBlogs(data);
    } catch (error) {
      console.error('Error loading blogs:', error);
      message.error('Không thể tải danh sách blog');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingBlog(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (blog: CompanyBlog) => {
    setEditingBlog(blog);
    form.setFieldsValue(blog);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa blog này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await companyBlogApi.deleteBlog(id);
          message.success('Xóa blog thành công');
          loadBlogs();
        } catch (error) {
          console.error('Error deleting blog:', error);
          message.error('Không thể xóa blog');
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    if (!companyId) {
      message.error('Không tìm thấy thông tin công ty');
      return;
    }
    
    try {
      const blogData: CompanyBlog = {
        ...values,
        companyId: companyId,
        authorName: user?.name || 'HR',
      };

      if (editingBlog) {
        await companyBlogApi.updateBlog(editingBlog.id!, blogData);
        message.success('Cập nhật blog thành công');
      } else {
        await companyBlogApi.createBlog(blogData);
        message.success('Tạo blog thành công');
      }

      setModalVisible(false);
      form.resetFields();
      loadBlogs();
    } catch (error) {
      console.error('Error saving blog:', error);
      message.error('Không thể lưu blog');
    }
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: '30%',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      render: (status: string) => (
        <Tag color={status === 'published' ? 'green' : 'orange'}>
          {status === 'published' ? 'Đã xuất bản' : 'Nháp'}
        </Tag>
      ),
    },
    {
      title: 'Lượt xem',
      dataIndex: 'views',
      key: 'views',
      width: '10%',
      render: (views: number) => views || 0,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '15%',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: '20%',
      render: (_: any, record: CompanyBlog) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => router.push(`/blog/company_${record.id}`)}
          >
            Xem
          </Button>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Blog</h1>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              size="large"
            >
              Tạo blog mới
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={blogs}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} blog`,
            }}
          />
        </Card>

        <Modal
          title={editingBlog ? 'Chỉnh sửa blog' : 'Tạo blog mới'}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={800}
        >
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

            <Form.Item
              name="content"
              label="Nội dung"
              rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
            >
              <TextArea
                rows={10}
                placeholder="Nhập nội dung blog"
                showCount
              />
            </Form.Item>

            <Form.Item
              name="imageUrl"
              label="URL hình ảnh"
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space.Compact style={{ width: '100%' }}>
                  <Input placeholder="https://example.com/image.jpg" size="large" />
                  <Button
                    size="large"
                    icon={<PictureOutlined />}
                    onClick={() => setImageGalleryVisible(true)}
                  >
                    Chọn từ thư viện
                  </Button>
                </Space.Compact>
                
                {/* Image Preview */}
                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.imageUrl !== currentValues.imageUrl}>
                  {({ getFieldValue }) => {
                    const imageUrl = getFieldValue('imageUrl');
                    return imageUrl ? (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-2">Xem trước:</p>
                        <Image
                          src={imageUrl}
                          alt="Preview"
                          style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8 }}
                          fallback="data:image/png;base64,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"
                        />
                      </div>
                    ) : null;
                  }}
                </Form.Item>
              </Space>
            </Form.Item>

            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              initialValue="draft"
            >
              <Select size="large">
                <Select.Option value="draft">Nháp</Select.Option>
                <Select.Option value="published">Xuất bản</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" size="large">
                  {editingBlog ? 'Cập nhật' : 'Tạo mới'}
                </Button>
                <Button
                  onClick={() => {
                    setModalVisible(false);
                    form.resetFields();
                  }}
                  size="large"
                >
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Image Gallery Modal */}
        <Modal
          title="Chọn ảnh từ thư viện công ty"
          open={imageGalleryVisible}
          onCancel={() => setImageGalleryVisible(false)}
          footer={null}
          width={900}
        >
          {companyImages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Chưa có ảnh trong thư viện</p>
              <p className="text-sm text-gray-400">
                Vui lòng thêm ảnh vào thư viện công ty trước
              </p>
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {companyImages.map((img: any) => (
                <Col key={img.id} xs={12} sm={8} md={6}>
                  <Card
                    hoverable
                    cover={
                      <Image
                        src={img.imageUrl}
                        alt={img.description || 'Company image'}
                        style={{ height: 150, objectFit: 'cover' }}
                        preview={false}
                      />
                    }
                    onClick={() => handleSelectImage(img.imageUrl)}
                    className="cursor-pointer"
                  >
                    <Card.Meta
                      description={
                        <div className="text-xs text-gray-500 truncate">
                          {img.description || 'Nhấn để chọn'}
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
}
