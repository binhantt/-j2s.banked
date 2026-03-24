# Table Columns — UserManagementPage

```tsx
// src/features/users/pages/UserManagementPage.tsx

const columns: ColumnsType<UserAdminRow> = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },

  {
    title: 'Tài khoản',
    key: 'user',
    width: 300,
    render: (_: unknown, record: UserAdminRow) => (
      <Space>
        <Avatar icon={<UserOutlined />} style={{ background: '#16a34a' }} />
        <Space direction="vertical" size={0} style={{ minWidth: 0, flex: 1 }}>
          <Text strong ellipsis={{ tooltip: record.fullName }} style={{ maxWidth: 220 }}>
            {record.fullName}
          </Text>
          <Text type="secondary" ellipsis={{ tooltip: record.email }} style={{ fontSize: 12, maxWidth: 220 }}>
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
      value === 'backend'
        ? <Tag color="volcano">Backend</Tag>
        : <Tag color="green">User</Tag>,
  },

  {
    title: 'Vai trò',
    dataIndex: 'role',
    key: 'role',
    render: (value: AccountRole) =>
      <Tag color={roleColor[value]}>{roleLabel[value]}</Tag>,
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
];
```
