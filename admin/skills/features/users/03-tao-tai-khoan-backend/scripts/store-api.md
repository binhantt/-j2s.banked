# Store + API — createBackendUser

## Store
```ts
// src/features/users/store/useUsersStore.ts
createBackendUser: async (data) => {
  try {
    const newUser = await userApi.createBackendUser(data);
    const userRow = convertToUserAdminRow(newUser);
    set((state) => ({
      users: [...state.users, userRow],
    }));
  } catch (error) {
    set({
      error: error instanceof Error ? error.message : 'Không thể tạo tài khoản',
    });
    throw error;
  }
}
```

## API
```ts
// src/features/users/api/userApi.ts
async createBackendUser(data: {
  email: string;
  name: string;
  password: string;
  userType: string;
}): Promise<UserResponse> {
  return httpRequest<UserResponse>('/admin/users/create', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

## Component — handleCreateUser
```tsx
// src/features/users/pages/UserManagementPage.tsx
const { createBackendUser } = useUsersStore();

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
```

## UI — Nút tạo (chỉ hiện ở tab Backend)
```tsx
{groupFilter === 'backend' && (
  <Button
    type="primary"
    icon={<PlusOutlined />}
    onClick={() => setCreateModalVisible(true)}
    style={{ background: '#16a34a' }}
  >
    Tạo tài khoản Backend
  </Button>
)}
```

## UI — Modal
```tsx
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
    <Form.Item name="name" label="Tên"
      rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
      <Input placeholder="Tên người dùng" />
    </Form.Item>
    <Form.Item name="email" label="Email"
      rules={[
        { required: true, message: 'Vui lòng nhập email' },
        { type: 'email', message: 'Email không hợp lệ' },
      ]}>
      <Input placeholder="email@example.com" />
    </Form.Item>
    <Form.Item name="password" label="Mật khẩu"
      rules={[
        { required: true, message: 'Vui lòng nhập mật khẩu' },
        { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
      ]}>
      <Input.Password placeholder="Mật khẩu" />
    </Form.Item>
    <Form.Item name="userType" label="Vai trò"
      rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}>
      <Select placeholder="Chọn vai trò" options={backendRoleCreateOptions} />
    </Form.Item>
  </Form>
</Modal>
```

## Options vai trò
```ts
const backendRoleCreateOptions = [
  { value: 'admin',       label: 'Admin hệ thống' },
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'moderator',   label: 'Kiểm duyệt viên' },
  { value: 'support',     label: 'CSKH / Support' },
];
```
