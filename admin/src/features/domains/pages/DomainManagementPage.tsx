import { useEffect, useState } from 'react';
import { 
  Button, 
  Card, 
  Modal, 
  Space, 
  Table, 
  Tag, 
  Typography, 
  App,
  Switch,
  Popconfirm,
  Form,
  Input,
  Checkbox
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  EyeOutlined, 
  DeleteOutlined, 
  ReloadOutlined, 
  EditOutlined,
  PlusOutlined
} from '@ant-design/icons';
import type { DomainSummary } from '../types/domainTypes';
import { useDomainStore } from '../store/useDomainStore';
import { domainApi } from '../api/domainApi';
import { DomainStats } from '../components/DomainStats';

const { Title, Text, Paragraph } = Typography;

export function DomainManagementPage() {
  const { 
    domains, 
    loading, 
    error, 
    detail, 
    detailVisible, 
    loadDomains, 
    loadDetail, 
    closeDetail, 
    removeDomainById,
    updateDomainInList
  } = useDomainStore();
  
  const { message } = App.useApp();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingDomain, setEditingDomain] = useState<DomainSummary | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    void loadDomains().catch(() => {
      message.error('Không tải được danh sách lĩnh vực');
    });
  }, [loadDomains, message]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error, message]);

  const handleViewDetail = async (id: string) => {
    await loadDetail(id).catch(() => {
      message.error('Không tải được chi tiết lĩnh vực');
    });
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await domainApi.deleteDomain(id);
      message.success(`Đã xóa lĩnh vực "${name}"`);
      removeDomainById(id);
    } catch {
      message.error('Không thể xóa lĩnh vực');
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean, name: string) => {
    try {
      await domainApi.toggleDomainStatus(id, isActive);
      message.success(`Đã ${isActive ? 'kích hoạt' : 'vô hiệu hóa'} lĩnh vực "${name}"`);
      
      // Update in store
      const domain = domains.find(d => d.id === id);
      if (domain) {
        updateDomainInList({ ...domain, isActive });
      }
    } catch {
      message.error('Không thể thay đổi trạng thái lĩnh vực');
    }
  };

  const handleCreate = async (values: any) => {
    try {
      await domainApi.createDomain(values);
      message.success('Tạo lĩnh vực thành công');
      setCreateModalVisible(false);
      form.resetFields();
      await loadDomains();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể tạo lĩnh vực';
      message.error(errorMessage);
    }
  };

  const handleEdit = async (values: any) => {
    if (!editingDomain) return;
    
    try {
      await domainApi.updateDomain({ ...values, id: editingDomain.id });
      message.success('Cập nhật lĩnh vực thành công');
      setEditModalVisible(false);
      setEditingDomain(null);
      form.resetFields();
      await loadDomains();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể cập nhật lĩnh vực';
      message.error(errorMessage);
    }
  };

  const openEditModal = (domain: DomainSummary) => {
    setEditingDomain(domain);
    form.setFieldsValue({
      name: domain.name,
      description: domain.description,
      isActive: domain.isActive,
    });
    setEditModalVisible(true);
  };

  const columns: ColumnsType<DomainSummary> = [
    {
      title: 'Tên lĩnh vực',
      dataIndex: 'name',
      key: 'name',
      width: '25%',
      render: (name: string, record) => (
        <div>
          <Text strong style={{ fontSize: 14 }}>{name}</Text>
          {record.description && (
            <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: '15%',
      render: (isActive: boolean, record) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleToggleStatus(record.id, checked, record.name)}
          checkedChildren="Hoạt động"
          unCheckedChildren="Tạm dừng"
        />
      ),
    },
    {
      title: 'Số công việc',
      dataIndex: 'jobCount',
      key: 'jobCount',
      width: '15%',
      render: (count: number) => (
        <Tag color={count > 100 ? 'green' : count > 50 ? 'orange' : 'default'}>
          {count} việc làm
        </Tag>
      ),
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
      key: 'actions',
      width: '20%',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record.id)}
            title="Xem chi tiết"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            title="Chỉnh sửa"
          />
          <Popconfirm
            title="Xóa lĩnh vực"
            description={`Bạn có chắc chắn muốn xóa lĩnh vực "${record.name}"?`}
            onConfirm={() => handleDelete(record.id, record.name)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              danger
              title="Xóa"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 8, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Quản lý lĩnh vực
        </Title>
        <Text style={{ color: '#64748b', fontSize: 15 }}>
          Quản lý các lĩnh vực nghề nghiệp và phân loại công việc
        </Text>
      </div>

      <DomainStats domains={domains} />

      <Card style={{ borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Text strong style={{ color: '#0f172a' }}>Tổng số lĩnh vực: {domains.length}</Text>
            <Text style={{ marginLeft: 16, color: '#64748b' }}>
              Hoạt động: {domains.filter(d => d.isActive).length}
            </Text>
          </div>
          
          <Space size={12}>
            <Button 
              icon={<PlusOutlined />} 
              type="primary"
              onClick={() => setCreateModalVisible(true)}
              style={{ 
                borderRadius: 12, 
                height: 40,
                background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                border: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(22,163,74,0.15)'
              }}
            >
              Thêm lĩnh vực
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => void loadDomains()}
              style={{ borderRadius: 12, height: 40 }}
            >
              Làm mới
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={domains}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} lĩnh vực`,
          }}
          style={{ marginTop: 16 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết lĩnh vực"
        open={detailVisible}
        onCancel={closeDetail}
        footer={null}
        width={600}
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
      >
        {detail && (
          <div>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div>
                <Text strong>Tên lĩnh vực:</Text>
                <div style={{ marginTop: 4 }}>
                  <Text style={{ fontSize: 16 }}>{detail.name}</Text>
                </div>
              </div>

              {detail.description && (
                <div>
                  <Text strong>Mô tả:</Text>
                  <Paragraph style={{ marginTop: 4, marginBottom: 0 }}>
                    {detail.description}
                  </Paragraph>
                </div>
              )}

              <div>
                <Text strong>Trạng thái:</Text>
                <div style={{ marginTop: 4 }}>
                  <Tag color={detail.isActive ? 'green' : 'red'}>
                    {detail.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                  </Tag>
                </div>
              </div>

              <div>
                <Text strong>Số lượng công việc:</Text>
                <div style={{ marginTop: 4 }}>
                  <Text>{detail.jobCount || 0} việc làm</Text>
                </div>
              </div>

              <div>
                <Text strong>Ngày tạo:</Text>
                <div style={{ marginTop: 4 }}>
                  <Text>{new Date(detail.createdAt).toLocaleString('vi-VN')}</Text>
                </div>
              </div>

              <div>
                <Text strong>Cập nhật lần cuối:</Text>
                <div style={{ marginTop: 4 }}>
                  <Text>{new Date(detail.updatedAt).toLocaleString('vi-VN')}</Text>
                </div>
              </div>
            </Space>
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal
        title="Thêm lĩnh vực mới"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{ isActive: true }}
        >
          <Form.Item
            name="name"
            label="Tên lĩnh vực"
            rules={[{ required: true, message: 'Vui lòng nhập tên lĩnh vực' }]}
          >
            <Input placeholder="Ví dụ: Công nghệ thông tin" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Mô tả ngắn về lĩnh vực này..."
            />
          </Form.Item>

          <Form.Item
            name="isActive"
            valuePropName="checked"
          >
            <Checkbox>Kích hoạt ngay sau khi tạo</Checkbox>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setCreateModalVisible(false);
                form.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Tạo lĩnh vực
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa lĩnh vực"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingDomain(null);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEdit}
        >
          <Form.Item
            name="name"
            label="Tên lĩnh vực"
            rules={[{ required: true, message: 'Vui lòng nhập tên lĩnh vực' }]}
          >
            <Input placeholder="Ví dụ: Công nghệ thông tin" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Mô tả ngắn về lĩnh vực này..."
            />
          </Form.Item>

          <Form.Item
            name="isActive"
            valuePropName="checked"
          >
            <Checkbox>Lĩnh vực đang hoạt động</Checkbox>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setEditModalVisible(false);
                setEditingDomain(null);
                form.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}