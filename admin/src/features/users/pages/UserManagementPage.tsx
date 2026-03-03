import { useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Input,
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
import { SearchOutlined, ReloadOutlined, UserOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

type AccountGroup = 'user' | 'backend';
type UserRole = 'job_seeker' | 'freelancer' | 'hr' | 'admin';
type BackendRole = 'super_admin' | 'moderator' | 'support';
type AccountRole = UserRole | BackendRole;

interface UserRow {
  id: number;
  fullName: string;
  email: string;
  group: AccountGroup;
  role: AccountRole;
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
}

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
  job_seeker: 'green',
  freelancer: 'lime',
  hr: 'cyan',
  admin: 'gold',
  super_admin: 'red',
  moderator: 'purple',
  support: 'blue',
};

const initialUsers: UserRow[] = [
  {
    id: 1,
    fullName: 'Nguyễn Văn A',
    email: 'nva@gmail.com',
    group: 'user',
    role: 'job_seeker',
    isActive: true,
    createdAt: '20/11/2026',
    lastLogin: '08:21 22/11/2026',
  },
  {
    id: 2,
    fullName: 'Trần Thị B',
    email: 'ttb@company.vn',
    group: 'user',
    role: 'hr',
    isActive: true,
    createdAt: '19/11/2026',
    lastLogin: '09:05 22/11/2026',
  },
  {
    id: 3,
    fullName: 'Lê C',
    email: 'lec@gmail.com',
    group: 'user',
    role: 'freelancer',
    isActive: false,
    createdAt: '18/11/2026',
    lastLogin: '17:45 20/11/2026',
  },
  {
    id: 4,
    fullName: 'Admin Root',
    email: 'admin@timviec24h.vn',
    group: 'backend',
    role: 'super_admin',
    isActive: true,
    createdAt: '01/01/2026',
    lastLogin: '10:12 22/11/2026',
  },
  {
    id: 5,
    fullName: 'Ngô Kiểm Duyệt',
    email: 'moderator@timviec24h.vn',
    group: 'backend',
    role: 'moderator',
    isActive: true,
    createdAt: '01/03/2026',
    lastLogin: '09:37 22/11/2026',
  },
  {
    id: 6,
    fullName: 'Hỗ Trợ Khách Hàng',
    email: 'support@timviec24h.vn',
    group: 'backend',
    role: 'support',
    isActive: false,
    createdAt: '15/04/2026',
    lastLogin: '16:10 21/11/2026',
  },
];

const userRoleOptions = [
  { value: 'all', label: 'Tất cả vai trò User' },
  { value: 'job_seeker', label: roleLabel.job_seeker },
  { value: 'freelancer', label: roleLabel.freelancer },
  { value: 'hr', label: roleLabel.hr },
  { value: 'admin', label: roleLabel.admin },
];

const backendRoleOptions = [
  { value: 'all', label: 'Tất cả vai trò Backend' },
  { value: 'super_admin', label: roleLabel.super_admin },
  { value: 'moderator', label: roleLabel.moderator },
  { value: 'support', label: roleLabel.support },
];

export function UserManagementPage() {
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState<AccountGroup>('user');
  const [roleFilter, setRoleFilter] = useState<'all' | AccountRole>('all');
  const [users, setUsers] = useState<UserRow[]>(initialUsers);

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

  const toggleActive = (id: number, checked: boolean) => {
    setUsers((prev) => prev.map((item) => (item.id === id ? { ...item, isActive: checked } : item)));
    message.success(checked ? 'Đã mở tài khoản' : 'Đã khóa tài khoản');
  };

  const resetPassword = (record: UserRow) => {
    message.success(`Đã gửi yêu cầu đặt lại mật khẩu cho ${record.email}`);
  };

  const handleGroupChange = (value: string | number) => {
    setGroupFilter(value as AccountGroup);
    setRoleFilter('all');
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ marginBottom: 4, color: '#0b1220' }}>
          Quản lý tài khoản User & Backend
        </Title>
        <Text type="secondary">
          Quản trị riêng 2 nhóm tài khoản: người dùng hệ thống và tài khoản vận hành backend.
        </Text>
      </div>

      <Card style={{ marginBottom: 16, borderRadius: 14 }}>
        <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space wrap>
            <Segmented
              value={groupFilter}
              onChange={handleGroupChange}
              options={[
                { label: `User (${stats.userTotal})`, value: 'user' },
                { label: `Backend (${stats.backendTotal})`, value: 'backend' },
              ]}
            />
            <Input
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc email"
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
            />
            <Select
              value={roleFilter}
              onChange={(value) => setRoleFilter(value)}
              style={{ width: 220 }}
              options={groupFilter === 'user' ? userRoleOptions : backendRoleOptions}
            />
          </Space>
          <Button icon={<ReloadOutlined />} onClick={() => setUsers(initialUsers)}>
            Làm mới
          </Button>
        </Space>
      </Card>

      <Card style={{ marginBottom: 16, borderRadius: 14 }}>
        <Space size={32} wrap>
          <div>
            <Text type="secondary">Tổng tài khoản User</Text>
            <Title level={4} style={{ margin: 0 }}>{stats.userTotal}</Title>
          </div>
          <div>
            <Text type="secondary">User đang hoạt động</Text>
            <Title level={4} style={{ margin: 0, color: '#16a34a' }}>{stats.userActive}</Title>
          </div>
          <div>
            <Text type="secondary">Tổng tài khoản Backend</Text>
            <Title level={4} style={{ margin: 0 }}>{stats.backendTotal}</Title>
          </div>
          <div>
            <Text type="secondary">Backend đang hoạt động</Text>
            <Title level={4} style={{ margin: 0, color: '#16a34a' }}>{stats.backendActive}</Title>
          </div>
        </Space>
      </Card>

      <Card style={{ borderRadius: 14 }}>
        <Table
          rowKey="id"
          dataSource={filteredUsers}
          pagination={{ pageSize: 8 }}
          columns={[
            { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
            {
              title: 'Tài khoản',
              key: 'user',
              render: (_: unknown, record: UserRow) => (
                <Space>
                  <Avatar icon={<UserOutlined />} style={{ background: '#16a34a' }} />
                  <Space direction="vertical" size={0}>
                    <Text strong>{record.fullName}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
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
              render: (value: AccountRole) => <Tag color={roleColor[value]}>{roleLabel[value]}</Tag>,
            },
            {
              title: 'Trạng thái',
              dataIndex: 'isActive',
              key: 'isActive',
              width: 130,
              render: (_: boolean, record: UserRow) => (
                <Switch checked={record.isActive} onChange={(checked) => toggleActive(record.id, checked)} />
              ),
            },
            { title: 'Lần đăng nhập cuối', dataIndex: 'lastLogin', key: 'lastLogin', width: 170 },
            { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', width: 130 },
            {
              title: 'Thao tác',
              key: 'actions',
              width: 180,
              render: (_: unknown, record: UserRow) => (
                <Space>
                  <Button size="small" onClick={() => resetPassword(record)}>
                    Reset pass
                  </Button>
                  <Popconfirm
                    title={record.isActive ? 'Khóa tài khoản này?' : 'Mở lại tài khoản này?'}
                    okText="Xác nhận"
                    cancelText="Hủy"
                    onConfirm={() => toggleActive(record.id, !record.isActive)}
                  >
                    <Button
                      size="small"
                      icon={record.isActive ? <LockOutlined /> : <UnlockOutlined />}
                      danger={record.isActive}
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
    </div>
  );
}
