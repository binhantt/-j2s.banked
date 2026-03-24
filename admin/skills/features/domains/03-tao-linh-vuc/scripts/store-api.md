# Store + API — createDomain

## API
```ts
// src/features/domains/api/domainApi.ts
async createDomain(payload: CreateDomainPayload): Promise<Domain> {
  const data = {
    name: payload.name,
    description: payload.description || null,
    isActive: payload.isActive ?? true,
  };
  return httpRequest<Domain>('/domains', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

## Component
```tsx
// src/features/domains/pages/DomainManagementPage.tsx
const [form] = Form.useForm();

const handleCreate = async (values: any) => {
  try {
    await domainApi.createDomain(values);
    message.success('Tạo lĩnh vực thành công');
    setCreateModalVisible(false);
    form.resetFields();
    await loadDomains();
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : 'Không thể tạo lĩnh vực';
    message.error(errorMessage);
  }
};
```

## UI — Modal tạo
```tsx
<Modal
  title="Thêm lĩnh vực mới"
  open={createModalVisible}
  onCancel={() => { setCreateModalVisible(false); form.resetFields(); }}
  footer={null}
  width={500}
>
  <Form
    form={form}
    layout="vertical"
    onFinish={handleCreate}
    initialValues={{ isActive: true }}
  >
    <Form.Item name="name" label="Tên lĩnh vực"
      rules={[{ required: true, message: 'Vui lòng nhập tên lĩnh vực' }]}>
      <Input placeholder="Ví dụ: Công nghệ thông tin" />
    </Form.Item>

    <Form.Item name="description" label="Mô tả">
      <Input.TextArea rows={3} placeholder="Mô tả ngắn về lĩnh vực này..." />
    </Form.Item>

    <Form.Item name="isActive" valuePropName="checked">
      <Checkbox>Kích hoạt ngay sau khi tạo</Checkbox>
    </Form.Item>

    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
      <Space>
        <Button onClick={() => { setCreateModalVisible(false); form.resetFields(); }}>Hủy</Button>
        <Button type="primary" htmlType="submit">Tạo lĩnh vực</Button>
      </Space>
    </Form.Item>
  </Form>
</Modal>
```
