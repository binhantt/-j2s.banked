# Store + API — toggleDomainStatus

## API
```ts
// src/features/domains/api/domainApi.ts
async toggleDomainStatus(id: string, isActive: boolean): Promise<void> {
  await httpRequest<void>(`/domains/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  });
}
```

## Store
```ts
// src/features/domains/store/useDomainStore.ts
updateDomainInList: (updatedDomain: DomainSummary) => {
  const { domains } = get();
  const updatedDomains = domains.map(domain =>
    domain.id === updatedDomain.id ? updatedDomain : domain
  );
  set({ domains: updatedDomains });
},
```

## Component
```tsx
// src/features/domains/pages/DomainManagementPage.tsx
const { domains, updateDomainInList } = useDomainStore();

const handleToggleStatus = async (id: string, isActive: boolean, name: string) => {
  try {
    await domainApi.toggleDomainStatus(id, isActive);
    message.success(`Đã ${isActive ? 'kích hoạt' : 'vô hiệu hóa'} lĩnh vực "${name}"`);
    const domain = domains.find(d => d.id === id);
    if (domain) {
      updateDomainInList({ ...domain, isActive });
    }
  } catch {
    message.error('Không thể thay đổi trạng thái lĩnh vực');
  }
};
```

## UI — Switch trong Table
```tsx
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
}
```
