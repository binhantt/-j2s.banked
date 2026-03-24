# Component — toggleActive

```tsx
// src/features/users/pages/UserManagementPage.tsx
const { setUserActive } = useUsersStore();

const toggleActive = async (id: number, checked: boolean) => {
  try {
    await setUserActive(id, checked);
    message.success(checked ? 'Đã mở tài khoản' : 'Đã khóa tài khoản');
  } catch {
    message.error('Không thể thay đổi trạng thái');
  }
};
```

## UI — Switch trong Table

```tsx
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
}
```

## UI — Nút Khóa/Mở + Popconfirm

```tsx
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
```
