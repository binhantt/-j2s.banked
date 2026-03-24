import { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Segmented,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  LockOutlined,
  UnlockOutlined,
  PlusOutlined,
  EditOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

import type { AccountGroup, AccountRole, UserAdminRow } from '../types/userTypes';
import { useUsersStore } from '../store/useUsersStore';

const roleLabel: Record<AccountRole, string> = {
  job_seeker: 'Ứng viên',
  freelancer: 'Freelancer',
  hr: 'Nhà tuyển dụng',
  admin: 'Admin hệ thống',
  super_admin: 'Super Admin',
  moderator: 'Kiểm duyệt viên',
  support: 'CSKH / Support',
};

const roleColor: Record<AccountRole, string> = {
  job_seeker: '#16a34a',
  freelancer: '#22c55e',
  hr: '#0891b2',
  admin: '#ca8a04',
  super_admin: '#dc2626',
  moderator: '#9333ea',
  support: '#2563eb',
};

export function UserManagementPage() {
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState<AccountGroup>('user');
  const [roleFilter, setRoleFilter] = useState<'all' | AccountRole>('all');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAdminRow | null>(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [roleForm] = Form.useForm();

  const {
    users,
    loading,
    error,
    fetchUsers,
    setUserActive,
    createBackendUser,
    updateUserRole,
    updateUserCredentials,
  } = useUsersStore();

  useEffect(() => {
    void fetchUsers().catch(() => {
      message.error('Không tải được danh sách tài khoản');
    });
  }, [fetchUsers]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.fullName.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchesGroup = user.group === groupFilter;
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesGroup && matchesRole;
    });
  }, [users, search, groupFilter, roleFilter]);

  const stats = useMemo(() => {
    const backend = users.filter((u) => u.group === 'backend');
    const user = users.filter((u) => u.group === 'user');
    return {
      backendTotal: backend.length,
      backendActive: backend.filter((u) => u.isActive).length,
      userTotal: user.length,
      userActive: user.filter((u) => u.isActive).length,
    };
  }, [users]);

  const toggleActive = async (id: number, checked: boolean) => {
    try {
      await setUserActive(id, checked);
      message.success(checked ? 'Đã mở tài khoản' : 'Đã khóa tài khoản');
    } catch {
      message.error('Không thể thay đổi trạng thái');
    }
  };

  const handleCreateUser = async () => {
    try {
      const values = await createForm.validateFields();
      await createBackendUser(values);
      message.success('Tạo tài khoản thành công');
      createForm.resetFields();
      setCreateModalVisible(false);
    } catch {
      message.error('Không thể tạo tài khoản');
    }
  };

  const handleEditCredentials = async () => {
    if (!selectedUser) return;
    try {
      const values = await editForm.validateFields();
      await updateUserCredentials(selectedUser.id, values);
      message.success('Cập nhật thông tin thành công');
      editForm.resetFields();
      setEditModalVisible(false);
    } catch {
      message.error('Không thể cập nhật thông tin');
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    try {
      const values = await roleForm.validateFields();
      await updateUserRole(selectedUser.id, values.role);
      message.success('Cập nhật vai trò thành công');
      roleForm.resetFields();
      setRoleModalVisible(false);
    } catch {
      message.error('Không thể cập nhật vai trò');
    }
  };

  const openEditModal = (record: UserAdminRow) => {
    setSelectedUser(record);
    editForm.setFieldsValue({ email: record.email });
    setEditModalVisible(true);
  };

  const openRoleModal = (record: UserAdminRow) => {
    setSelectedUser(record);
    roleForm.setFieldsValue({ role: record.role });
    setRoleModalVisible(true);
  };

  const handleGroupChange = (value: string | number) => {
    setGroupFilter(value as AccountGroup);
    setRoleFilter('all');
  };

  const userRoleOptions = [
    { value: 'all', label: 'Tất cả vai trò User' },
    { value: 'job_seeker', label: roleLabel.job_seeker },
    { value: 'freelancer', label: roleLabel.freelancer },
    { value: 'hr', label: roleLabel.hr },
  ];

  const backendRoleOptions = [
    { value: 'all', label: 'Tất cả vai trò Backend' },
    { value: 'admin', label: roleLabel.admin },
    { value: 'super_admin', label: roleLabel.super_admin },
    { value: 'moderator', label: roleLabel.moderator },
    { value: 'support', label: roleLabel.support },
  ];

  const backendRoleCreateOptions = [
    { value: 'admin', label: roleLabel.admin },
    { value: 'super_admin', label: roleLabel.super_admin },
    { value: 'moderator', label: roleLabel.moderator },
    { value: 'support', label: roleLabel.support },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 8, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Quản lý tài khoản
        </Title>
        <Text style={{ color: '#64748b', fontSize: 15 }}>
          Quản trị người dùng hệ thống và tài khoản vận hành backend
        </Text>
      </div>

      <Card style={{ marginBottom: 24, borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
        <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space wrap size={16}>
            <Segmented
              value={groupFilter}
              onChange={handleGroupChange}
              style={{ padding: 4, borderRadius: 12 }}
              options={[
                { label: `Người dùng (${stats.userTotal})`, value: 'user' },
                { label: `Quản trị viên (${stats.backendTotal})`, value: 'backend' },
              ]}
            />
            <Input
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc email"
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              style={{ width: 320, borderRadius: 12, height: 40 }}
            />
            <Select
              value={roleFilter}
              onChange={(value) => setRoleFilter(value)}
              style={{ width: 220, borderRadius: 12 }}
              options={groupFilter === 'user' ? userRoleOptions : backendRoleOptions}
            />
          </Space>
          <Space size={12}>
            {groupFilter === 'backend' && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateModalVisible(true)}
                style={{ 
                  background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                  border: 'none',
                  borderRadius: 12,
                  fontWeight: 600,
                  height: 40,
                  boxShadow: '0 4px 12px rgba(22,163,74,0.15)'
                }}
              >
                Tạo Admin mới
              </Button>
            )}
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => void fetchUsers()}
              style={{ borderRadius: 12, height: 40 }}
            >
              Làm mới
            </Button>
          </Space>
        </Space>
      </Card>

      <Card style={{ marginBottom: 24, borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
        <Space size={48} wrap>
          <div style={{ padding: '0 12px' }}>
            <Text style={{ color: '#64748b', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>TỔNG USER</Text>
            <Title level={2} style={{ margin: '4px 0 0', fontWeight: 800 }}>
              {stats.userTotal}
            </Title>
          </div>
          <div style={{ width: 1, height: 40, background: '#f1f5f9' }} />
          <div style={{ padding: '0 12px' }}>
            <Text style={{ color: '#16a34a', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ĐANG HOẠT ĐỘNG</Text>
            <Title level={2} style={{ margin: '4px 0 0', fontWeight: 800, color: '#16a34a' }}>
              {stats.userActive}
            </Title>
          </div>
          <div style={{ width: 1, height: 40, background: '#f1f5f9' }} />
          <div style={{ padding: '0 12px' }}>
            <Text style={{ color: '#64748b', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>TỔNG ADMIN</Text>
            <Title level={2} style={{ margin: '4px 0 0', fontWeight: 800 }}>
              {stats.backendTotal}
            </Title>
          </div>
        </Space>
      </Card>

      <Card style={{ borderRadius: 14 }}>
        <Table
          rowKey="id"
          dataSource={filteredUsers}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} tài khoản`,
          }}
          columns={[
            { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
            {
              title: 'Tài khoản',
              key: 'user',
              width: 300,
              render: (_: unknown, record: UserAdminRow) => (
                <Space size={12}>
                  <Avatar 
                    icon={<UserOutlined />} 
                    style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #dcfce7' }} 
                  />
                  <Space direction="vertical" size={0} style={{ minWidth: 0, flex: 1 }}>
                    <Text strong style={{ color: '#0f172a' }}>
                      {record.fullName}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#64748b' }}>
                      {record.email}
                    </Text>
                  </Space>
                </Space>
              ),
            },
            {
              title: 'Nhóm',
              dataIndex: 'group',
              key: 'group',
              width: 120,
              render: (value: AccountGroup) =>
                value === 'backend' ? <Tag color="volcano">Backend</Tag> : <Tag color="green">User</Tag>,
            },
            {
              title: 'Vai trò',
              dataIndex: 'role',
              key: 'role',
              render: (value: AccountRole) => (
                <Tag 
                  color="default" 
                  style={{ 
                    color: roleColor[value], 
                    backgroundColor: `${roleColor[value]}10`,
                    borderColor: `${roleColor[value]}30`,
                    fontWeight: 600,
                    borderRadius: 6
                  }}
                >
                  {roleLabel[value]}
                </Tag>
              ),
            },
            {
              title: 'Trạng thái',
              dataIndex: 'isActive',
              key: 'isActive',
              width: 130,
              render: (_: boolean, record: UserAdminRow) => (
                <Switch
                  checked={record.isActive}
                  onChange={(checked) => void toggleActive(record.id, checked)}
                  disabled={record.role === 'super_admin'}
                />
              ),
            },
            { title: 'Lần đăng nhập cuối', dataIndex: 'lastLogin', key: 'lastLogin', width: 170 },
            { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', width: 130 },
            {
              title: 'Thao tác',
              key: 'actions',
              width: 250,
              render: (_: unknown, record: UserAdminRow) => (
                <Space>
                  <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
                    Sửa TK
                  </Button>
                  <Button size="small" onClick={() => openRoleModal(record)}>
                    Đổi vai trò
                  </Button>
                  <Popconfirm
                    title={record.isActive ? 'Khóa tài khoản này?' : 'Mở lại tài khoản này?'}
                    okText="Xác nhận"
                    cancelText="Hủy"
                    onConfirm={() => void toggleActive(record.id, !record.isActive)}
                    disabled={record.role === 'super_admin'}
                  >
                    <Button
                      size="small"
                      icon={record.isActive ? <LockOutlined /> : <UnlockOutlined />}
                      danger={record.isActive}
                      disabled={record.role === 'super_admin'}
                    >
                      {record.isActive ? 'Khóa' : 'Mở'}
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      {/* Create Backend User Modal */}
      <Modal
        title="Tạo tài khoản Backend"
        open={createModalVisible}
        onOk={() => void handleCreateUser()}
        onCancel={() => {
          createForm.resetFields();
          setCreateModalVisible(false);
        }}
        okText="Tạo tài khoản"
        cancelText="Hủy"
      >
        <Form form={createForm} layout="vertical">
          <Form.Item name="name" label="Tên" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input placeholder="Tên người dùng" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input placeholder="email@example.com" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
            ]}
          >
            <Input.Password placeholder="Mật khẩu" />
          </Form.Item>
          <Form.Item name="userType" label="Vai trò" rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}>
            <Select placeholder="Chọn vai trò" options={backendRoleCreateOptions} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Credentials Modal */}
      <Modal
        title="Chỉnh sửa thông tin đăng nhập"
        open={editModalVisible}
        onOk={() => void handleEditCredentials()}
        onCancel={() => {
          editForm.resetFields();
          setEditModalVisible(false);
        }}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="email"
            label="Email mới"
            rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
          >
            <Input placeholder="email@example.com" />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu mới" rules={[{ min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }]}>
            <Input.Password placeholder="Để trống nếu không đổi" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Update Role Modal */}
      <Modal
        title="Thay đổi vai trò"
        open={roleModalVisible}
        onOk={() => void handleUpdateRole()}
        onCancel={() => {
          roleForm.resetFields();
          setRoleModalVisible(false);
        }}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={roleForm} layout="vertical">
          <Form.Item name="role" label="Vai trò mới" rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}>
            <Select
              placeholder="Chọn vai trò"
              options={
                selectedUser?.group === 'backend'
                  ? backendRoleCreateOptions
                  : [
                      { value: 'job_seeker', label: roleLabel.job_seeker },
                      { value: 'freelancer', label: roleLabel.freelancer },
                      { value: 'hr', label: roleLabel.hr },
                    ]
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
