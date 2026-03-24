import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { industryApi, Industry } from '@/lib/industryApi';
import { MainLayout } from '@/components/layout/MainLayout';

const { TextArea } = Input;

const AdminIndustriesPage = () => {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadIndustries();
  }, []);

  const loadIndustries = async () => {
    setLoading(true);
    try {
      const data = await industryApi.getAllIndustriesAdmin();
      setIndustries(data);
    } catch (error) {
      message.error('Không thể tải danh sách lĩnh vực');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingIndustry(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (industry: Industry) => {
    setEditingIndustry(industry);
    form.setFieldsValue({
      name: industry.name,
      description: industry.description,
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingIndustry) {
        await industryApi.updateIndustry(editingIndustry.id, values);
        message.success('Cập nhật lĩnh vực thành công');
      } else {
        await industryApi.createIndustry({ ...values, isActive: true });
        message.success('Tạo lĩnh vực thành công');
      }
      setModalVisible(false);
      loadIndustries();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const handleToggleStatus = async (industry: Industry) => {
    try {
      await industryApi.toggleIndustryStatus(industry.id);
      message.success(`${industry.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'} lĩnh vực thành công`);
      loadIndustries();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await industryApi.deleteIndustry(id);
      message.success('Xóa lĩnh vực thành công');
      loadIndustries();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Tên lĩnh vực',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (isActive: boolean, record: Industry) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleStatus(record)}
          checkedChildren="Hoạt động"
          unCheckedChildren="Vô hiệu"
        />
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_: any, record: Industry) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa lĩnh vực này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              danger
              size="small"
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
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý lĩnh vực</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Thêm lĩnh vực
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={industries}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} lĩnh vực`,
          }}
        />

        <Modal
          title={editingIndustry ? 'Sửa lĩnh vực' : 'Thêm lĩnh vực'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="name"
              label="Tên lĩnh vực"
              rules={[
                { required: true, message: 'Vui lòng nhập tên lĩnh vực' },
                { max: 100, message: 'Tên lĩnh vực không được quá 100 ký tự' },
              ]}
            >
              <Input placeholder="VD: Công nghệ thông tin" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
              rules={[
                { max: 500, message: 'Mô tả không được quá 500 ký tự' },
              ]}
            >
              <TextArea
                rows={3}
                placeholder="Mô tả chi tiết về lĩnh vực..."
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <Space className="w-full justify-end">
                <Button onClick={() => setModalVisible(false)}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingIndustry ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default AdminIndustriesPage;