import { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Card, 
  Typography, 
  Modal, 
  Form, 
  Input, 
  Switch, 
  App, 
  Tooltip,
  Tag,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  TagsOutlined,
  CheckCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import { blogApi } from '../api/blogApi';

const { Title, Text } = Typography;

export function CategoryManagementPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [form] = Form.useForm();
  const { message, modal } = App.useApp();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await blogApi.getCategories();
      setCategories(data);
    } catch (error: any) {
      message.error('Không thể tải danh mục blog');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description,
      isActive: category.isActive
    });
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    modal.confirm({
      title: 'Xóa danh mục này?',
      content: 'Lưu ý: Bạn không nên xóa danh mục đang có bài viết sử dụng.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await blogApi.deleteCategory(id);
          message.success('Xóa danh mục thành công');
          loadCategories();
        } catch (error: any) {
          message.error('Có lỗi xảy ra khi xóa danh mục');
        }
      }
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingCategory) {
        await blogApi.updateCategory(editingCategory.id, values);
        message.success('Cập nhật danh mục thành công');
      } else {
        await blogApi.createCategory(values);
        message.success('Tạo danh mục thành công');
      }
      setModalVisible(false);
      loadCategories();
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra');
    }
  };

  const columns = [
    {
      title: 'TÊN DANH MỤC',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong style={{ color: '#0f172a', fontSize: 16 }}>{text}</Text>
    },
    {
      title: 'MÔ TẢ',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => <Text style={{ color: '#64748b' }}>{text || '-'}</Text>
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 150,
      render: (isActive: boolean) => (
        <Tag 
          icon={isActive ? <CheckCircleOutlined /> : <StopOutlined />} 
          color={isActive ? '#f0fdf4' : '#fef2f2'}
          style={{ 
            color: isActive ? '#15803d' : '#991b1b', 
            border: 'none', 
            padding: '4px 12px', 
            borderRadius: 100,
            fontWeight: 700
          }}
        >
          {isActive ? 'Hoạt động' : 'Tạm dừng'}
        </Tag>
      )
    },
    {
      title: 'QUẢN LÝ',
      key: 'actions',
      width: 120,
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Sửa">
            <Button 
              type="text" 
              icon={<EditOutlined style={{ color: '#16a34a' }} />} 
              onClick={() => handleEdit(record)}
              style={{ background: '#f0fdf4', borderRadius: 10 }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDelete(record.id)}
              style={{ background: '#fef2f2', borderRadius: 10 }}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Space direction="vertical" size={2}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #16a34a, #22c55e)', borderRadius: 14, display: 'grid', placeItems: 'center', color: '#fff' }}>
              <TagsOutlined style={{ fontSize: 22 }} />
            </div>
            <Title level={2} style={{ margin: 0, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Quản lý danh mục Blog
            </Title>
          </div>
          <Text style={{ color: '#64748b', fontSize: 16 }}>
            Phân loại bài viết để người dùng dễ dàng tìm kiếm kiến thức
          </Text>
        </Space>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleCreate}
          style={{ 
            borderRadius: 12, height: 48, fontWeight: 700, 
            background: 'linear-gradient(135deg, #16a34a, #22c55e)', border: 'none',
            boxShadow: '0 8px 16px rgba(22,163,74,0.15)'
          }}
        >
          THÊM DANH MỤC
        </Button>
      </div>

      <Card style={{ borderRadius: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
        <Table 
          columns={columns} 
          dataSource={categories} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={null}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
        centered
        width={500}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ padding: '32px' }}>
          <Title level={4} style={{ marginBottom: 8, fontWeight: 900 }}>
            {editingCategory ? 'Chỉnh sửa chuyên mục' : 'Thêm chuyên mục mới'}
          </Title>
          <Text style={{ color: '#64748b', display: 'block', marginBottom: 24 }}>
            Thông tin danh mục sẽ hiển thị trên bộ lọc trang chủ Blog.
          </Text>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
            initialValues={{ isActive: true }}
          >
            <Form.Item
              name="name"
              label={<Text strong style={{ fontSize: 13, color: '#94a3b8' }}>TÊN DANH MỤC</Text>}
              rules={[{ required: true, message: 'Nhập tên danh mục' }]}
            >
              <Input placeholder="Ví dụ: Kỹ năng mềm, Công nghệ..." style={{ borderRadius: 12, height: 48, border: '1.5px solid #e2e8f0' }} />
            </Form.Item>

            <Form.Item
              name="description"
              label={<Text strong style={{ fontSize: 13, color: '#94a3b8' }}>MÔ TẢ (TÙY CHỌN)</Text>}
            >
              <Input.TextArea placeholder="Mô tả ngắn về danh mục này..." rows={3} style={{ borderRadius: 12, border: '1.5px solid #e2e8f0' }} />
            </Form.Item>

            <Form.Item
              name="isActive"
              label={<Text strong style={{ fontSize: 13, color: '#94a3b8' }}>TRẠNG THÁI HOẠT ĐỘNG</Text>}
              valuePropName="checked"
            >
              <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
            </Form.Item>

            <Divider />

            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)} style={{ borderRadius: 10, height: 44 }}>Hủy</Button>
              <Button 
                type="primary" 
                htmlType="submit"
                style={{ 
                  borderRadius: 10, height: 44, fontWeight: 700,
                  background: 'linear-gradient(135deg, #16a34a, #22c55e)', border: 'none'
                }}
              >
                {editingCategory ? 'Cập nhật' : 'Thêm ngay'}
              </Button>
            </Space>
          </Form>
        </div>
      </Modal>

      <style>{`
        .ant-table-thead > tr > th {
          background: #f8fafc !important;
          color: #94a3b8 !important;
          font-weight: 800 !important;
          font-size: 11px !important;
          letter-spacing: 0.05em !important;
          border-bottom: 2px solid #f1f5f9 !important;
        }
      `}</style>
    </div>
  );
}
