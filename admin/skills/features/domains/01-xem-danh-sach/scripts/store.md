# Store — loadDomains

```ts
// src/features/domains/store/useDomainStore.ts
loadDomains: async () => {
  set({ loading: true, error: null });
  try {
    const domains = await domainApi.getDomains();
    set({ domains, loading: false });
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : 'Không tải được danh sách lĩnh vực';
    set({ error: errorMessage, loading: false });
  }
}
```

## Component
```tsx
// src/features/domains/pages/DomainManagementPage.tsx
const { domains, loading, loadDomains } = useDomainStore();

useEffect(() => {
  void loadDomains().catch(() => {
    message.error('Không tải được danh sách lĩnh vực');
  });
}, [loadDomains]);
```

## Table Columns
```tsx
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
        <Button type="text" icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record.id)} title="Xem chi tiết" />
        <Button type="text" icon={<EditOutlined />}
          onClick={() => openEditModal(record)} title="Chỉnh sửa" />
        <Popconfirm
          title="Xóa lĩnh vực"
          description={`Bạn có chắc muốn xóa lĩnh vực "${record.name}"?`}
          onConfirm={() => handleDelete(record.id, record.name)}
          okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
          <Button type="text" icon={<DeleteOutlined />} danger title="Xóa" />
        </Popconfirm>
      </Space>
    ),
  },
];
```
