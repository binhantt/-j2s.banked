import { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Table, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message, 
  Popconfirm,
  Tag,
  Space,
  Row,
  Col
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined
} from '@ant-design/icons';
import { companyBlogApi, CompanyBlog } from '@/lib/companyBlogApi';
import { useAuthStore } from '@/store/useAuthStore';

const { TextArea } = Input;
const { Option } = Select;

export default function CompanyBlogManagement() {
  const [blogs, setBlogs] = useState<CompanyBlog[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBlog, setEditingBlog] = useState<CompanyBlog | null>(null);
  const [form] = Form.useForm();
  const { user } = useAuthStore();

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      if (!user?.companyId) {
        message.error('Không tìm thấy thông tin công ty');
        return;
      }
      
      const response = await companyBlogApi.getBlogsByCompany(user.companyId);
      setBlogs(response);
    } catch (error: any) {
      console.error('Error loading blogs:', error);
      message.error(error.message || 'Không thể tải danh sách blog');
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
    form.setFieldsValue({
      title: blog.title,
      content: blog.content,
      imageUrl: blog.imageUrl,
      authorName: blog.authorName,
      status: blog.status,
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (!user?.companyId) {
        message.error('Không tìm thấy thông tin công ty');
        return;
      }

      const blogData: CompanyBlog = {
        companyId: user.companyId,
        title: values.title,
        content: values.content,
        imageUrl: values.imageUrl,
        authorName: values.authorName || user.name || 'Công ty',
        status: values.status || 'draft',
      };

      if (editingBlog) {
        await companyBlogApi.updateBlog(editingBlog.id!, blogData);
        message.success('Cập nhật blog thành công');
      } else {
        await companyBlogApi.createBlog(blogData);
        message.success('Tạo blog thành công');
      }

      setModalVisible(false);
      loadBlogs();
    } catch (error: any) {
      console.error('Error saving blog:', error);
      message.error(error.message || 'Có lỗi xảy ra khi lưu blog');
    }
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
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa blog này?"
            onConfirm={() => handleDelete(record.id!)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
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

      <Modal
        title={editingBlog ? 'Chỉnh sửa blog' : 'Tạo blog mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
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
            <Input placeholder="Nhập tiêu đề blog" />
          </Form.Item>

          <Form.Item
            name="authorName"
            label="Tác giả"
            rules={[{ required: true, message: 'Vui lòng nhập tên tác giả' }]}
          >
            <Input placeholder="Nhập tên tác giả" />
          </Form.Item>

          <Row gutter={16}>
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
            <Col span={12}>
              <Form.Item
                name="imageUrl"
                label="Ảnh đại diện (URL)"
              >
                <Input placeholder="https://example.com/image.jpg" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            <TextArea 
              rows={12} 
              placeholder="Nhập nội dung blog..."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingBlog ? 'Cập nhật' : 'Tạo blog'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}