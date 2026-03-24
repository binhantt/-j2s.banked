# Store + API — updateUserRole

## Store
```ts
// src/features/users/store/useUsersStore.ts
updateUserRole: async (id, userType) => {
  try {
    const updatedUser = await userApi.updateUserRole(id, userType);
    const userRow = convertToUserAdminRow(updatedUser);
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id ? userRow : user
      ),
    }));
  } catch (error) {
    set({
      error: error instanceof Error ? error.message : 'Không thể cập nhật vai trò',
    });
    throw error;
  }
}
```

## API
```ts
// src/features/users/api/userApi.ts
async updateUserRole(id: number, userType: string): Promise<UserResponse> {
  return httpRequest<UserResponse>(`/admin/users/${id}/update-role`, {
    method: 'PUT',
    body: JSON.stringify({ userType }),
  });
}
```

## Component — openRoleModal + handleUpdateRole
```tsx
// src/features/users/pages/UserManagementPage.tsx
const { updateUserRole } = useUsersStore();

const openRoleModal = (record: UserAdminRow) => {
  setSelectedUser(record);
  roleForm.setFieldsValue({ role: record.role });
  setRoleModalVisible(true);
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
```

## UI — Modal
```tsx
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
    <Form.Item name="role" label="Vai trò mới"
      rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}>
      <Select
        placeholder="Chọn vai trò"
        options={
          selectedUser?.group === 'backend'
            ? backendRoleCreateOptions
            : userRoleOptions
        }
      />
    </Form.Item>
  </Form>
</Modal>
```

## Options
```ts
const userRoleOptions = [
  { value: 'job_seeker', label: 'Ứng viên' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'hr', label: 'Nhà tuyển dụng' },
];

const backendRoleCreateOptions = [
  { value: 'admin',       label: 'Admin hệ thống' },
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'moderator',   label: 'Kiểm duyệt viên' },
  { value: 'support',     label: 'CSKH / Support' },
];
```
