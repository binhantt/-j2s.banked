# Store + API — loadDetail + closeDetail

## Store
```ts
// src/features/blog/store/useBlogStore.ts
loadDetail: async (id: string) => {
  set({ error: null });
  try {
    const data = await blogApi.getPostById(id);
    set({ detail: data, detailVisible: true });
  } catch (error) {
    set({
      error: error instanceof Error ? error.message : 'Không tải được chi tiết bài viết',
    });
    throw error;
  }
},

closeDetail: () => set({ detailVisible: false }),
```

## API
```ts
// src/features/blog/api/blogApi.ts
async getPostById(id: string): Promise<BlogPostDetail> {
  return httpRequest<BlogPostDetail>(`/blog/posts/${id}`);
}
```

## Component
```tsx
// src/features/blog/pages/BlogManagementPage.tsx
const { loadDetail, detail, detailVisible, closeDetail } = useBlogStore();

const handleViewDetail = async (id: string) => {
  await loadDetail(id).catch(() => {
    message.error('Không tải được chi tiết bài viết');
  });
};
```

## UI — Modal chi tiết
```tsx
<Modal
  title={detail?.title}
  open={detailVisible}
  onCancel={closeDetail}
  footer={null}
  width={900}
  styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
>
  {detail && (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <Space>
        <Tag color="blue">{detail.category}</Tag>
        <Tag>{detail.source === 'platform' ? 'Nền tảng' : 'Công ty'}</Tag>
        <Tag>{detail.readTime}</Tag>
      </Space>
      <Text type="secondary">
        {detail.author} • {detail.date} • {detail.views} lượt xem
      </Text>
      {detail.tags?.length ? (
        <Space wrap>
          {detail.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
        </Space>
      ) : null}
      <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{detail.content}</Paragraph>
    </Space>
  )}
</Modal>
```
