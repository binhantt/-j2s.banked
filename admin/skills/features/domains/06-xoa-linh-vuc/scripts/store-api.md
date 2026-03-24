# Store + API — deleteDomain

## API
```ts
// src/features/domains/api/domainApi.ts
async deleteDomain(id: string): Promise<void> {
  await httpRequest<void>(`/domains/${id}`, { method: 'DELETE' });
}
```

## Store
```ts
// src/features/domains/store/useDomainStore.ts
removeDomainById: (id: string) => {
  const { domains } = get();
  const updatedDomains = domains.filter(domain => domain.id !== id);
  set({ domains: updatedDomains });
},
```

## Component
```tsx
// src/features/domains/pages/DomainManagementPage.tsx
const { removeDomainById } = useDomainStore();

const handleDelete = async (id: string, name: string) => {
  try {
    await domainApi.deleteDomain(id);
    message.success(`Đã xóa lĩnh vực "${name}"`);
    removeDomainById(id);
  } catch {
    message.error('Không thể xóa lĩnh vực');
  }
};
```

## UI — Button + Popconfirm
```tsx
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
```
