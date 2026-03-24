# Store + API — updateDomain

## API
```ts
// src/features/domains/api/domainApi.ts
async updateDomain(payload: UpdateDomainPayload): Promise<Domain> {
  const data = {
    name: payload.name,
    description: payload.description || null,
    isActive: payload.isActive ?? true,
  };
  return httpRequest<Domain>(`/domains/${payload.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
```

## Component
```tsx
// src/features/domains/pages/DomainManagementPage.tsx
const [editingDomain, setEditingDomain] = useState<DomainSummary | null>(null);

const openEditModal = (domain: DomainSummary) => {
  setEditingDomain(domain);
  form.setFieldsValue({
    name: domain.name,
    description: domain.description,
    isActive: domain.isActive,
  });
  setEditModalVisible(true);
};

const handleEdit = async (values: any) => {
  if (!editingDomain) return;
  try {
    await domainApi.updateDomain({ ...values, id: editingDomain.id });
    message.success('Cập nhật lĩnh vực thành công');
    setEditModalVisible(false);
    setEditingDomain(null);
    form.resetFields();
    await loadDomains();
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : 'Không thể cập nhật lĩnh vực';
    message.error(errorMessage);
  }
};
```

## UI — Modal chỉnh sửa
```tsx
<Modal
  title="Chỉnh sửa lĩnh vực"
  open={editModalVisible}
  onCancel={() => { setEditModalVisible(false); setEditingDomain(null); form.resetFields(); }}
  footer={null}
  width={500}
>
  <Form form={form} layout="vertical" onFinish={handleEdit}>
    <Form.Item name="name" label="Tên lĩnh vực"
      rules={[{ required: true, message: 'Vui lòng nhập tên lĩnh vực' }]}>
      <Input placeholder="Ví dụ: Công nghệ thông tin" />
    </Form.Item>
    <Form.Item name="description" label="Mô tả">
      <Input.TextArea rows={3} placeholder="Mô tả ngắn về lĩnh vực này..." />
    </Form.Item>
    <Form.Item name="isActive" valuePropName="checked">
      <Checkbox>Lĩnh vực đang hoạt động</Checkbox>
    </Form.Item>
    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
      <Space>
        <Button onClick={() => { setEditModalVisible(false); setEditingDomain(null); form.resetFields(); }}>Hủy</Button>
        <Button type="primary" htmlType="submit">Cập nhật</Button>
      </Space>
    </Form.Item>
  </Form>
</Modal>
```
