# Store + API — loadDetail + closeDetail

## Store
```ts
// src/features/domains/store/useDomainStore.ts
loadDetail: async (id: string) => {
  try {
    const detail = await domainApi.getDomainById(id);
    set({ detail, detailVisible: true });
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : 'Không tải được chi tiết lĩnh vực';
    set({ error: errorMessage });
    throw error;
  }
},

closeDetail: () => {
  set({ detail: null, detailVisible: false });
},
```

## API
```ts
// src/features/domains/api/domainApi.ts
async getDomainById(id: string): Promise<Domain> {
  return httpRequest<Domain>(`/domains/${id}`);
}
```

## Component
```tsx
// src/features/domains/pages/DomainManagementPage.tsx
const { loadDetail, detail, detailVisible, closeDetail } = useDomainStore();

const handleViewDetail = async (id: string) => {
  await loadDetail(id).catch(() => {
    message.error('Không tải được chi tiết lĩnh vực');
  });
};
```

## UI — Modal chi tiết
```tsx
<Modal
  title="Chi tiết lĩnh vực"
  open={detailVisible}
  onCancel={closeDetail}
  footer={null}
  width={600}
  styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
>
  {detail && (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <div>
        <Text strong>Tên lĩnh vực:</Text>
        <div><Text style={{ fontSize: 16 }}>{detail.name}</Text></div>
      </div>
      {detail.description && (
        <div>
          <Text strong>Mô tả:</Text>
          <Paragraph style={{ marginTop: 4, marginBottom: 0 }}>
            {detail.description}
          </Paragraph>
        </div>
      )}
      <div>
        <Text strong>Trạng thái:</Text>
        <div>
          <Tag color={detail.isActive ? 'green' : 'red'}>
            {detail.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
          </Tag>
        </div>
      </div>
      <div>
        <Text strong>Số lượng công việc:</Text>
        <div><Text>{detail.jobCount || 0} việc làm</Text></div>
      </div>
      <div>
        <Text strong>Ngày tạo:</Text>
        <div><Text>{new Date(detail.createdAt).toLocaleString('vi-VN')}</Text></div>
      </div>
      <div>
        <Text strong>Cập nhật lần cuối:</Text>
        <div><Text>{new Date(detail.updatedAt).toLocaleString('vi-VN')}</Text></div>
      </div>
    </Space>
  )}
</Modal>
```
