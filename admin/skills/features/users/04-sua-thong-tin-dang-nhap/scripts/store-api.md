# Store + API — updateUserCredentials

## Store
```ts
// src/features/users/store/useUsersStore.ts
updateUserCredentials: async (id, data) => {
  try {
    const updatedUser = await userApi.updateUserCredentials(id, data);
    const userRow = convertToUserAdminRow(updatedUser);
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id ? userRow : user
      ),
    }));
  } catch (error) {
    set({
      error: error instanceof Error
        ? error.message
        : 'Không thể cập nhật thông tin đăng nhập',
    });
    throw error;
  }
}
```

## API
```ts
// src/features/users/api/userApi.ts
async updateUserCredentials(
  id: number,
  data: { email?: string; password?: string }
): Promise<UserResponse> {
  return httpRequest<UserResponse>(`/admin/users/${id}/update-credentials`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
```

## Component — openEditModal + handleEditCredentials
```tsx
// src/features/users/pages/UserManagementPage.tsx
const { updateUserCredentials } = useUsersStore();
const [selectedUser, setSelectedUser] = useState<UserAdminRow | null>(null);

const openEditModal = (record: UserAdminRow) => {
  setSelectedUser(record);
  editForm.setFieldsValue({ email: record.email });
  setEditModalVisible(true);
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
```

## UI — Modal
```tsx
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
    <Form.Item name="email" label="Email mới"
      rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
      <Input placeholder="email@example.com" />
    </Form.Item>
    <Form.Item name="password" label="Mật khẩu mới"
      rules={[{ min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }]}>
      <Input.Password placeholder="Để trống nếu không đổi" />
    </Form.Item>
  </Form>
</Modal>
```
