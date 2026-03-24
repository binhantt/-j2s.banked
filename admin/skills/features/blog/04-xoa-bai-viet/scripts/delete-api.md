# Store + API — deletePost

## API
```ts
// src/features/blog/api/blogApi.ts
async deletePost(id: string): Promise<void> {
  await httpRequest<void>(`/blog/posts/${id}`, { method: 'DELETE' });
}
```

## Store
```ts
// src/features/blog/store/useBlogStore.ts
removePostById: (id: string | number) =>
  set((state) => ({
    posts: state.posts.filter((post) => String(post.id) !== String(id)),
  })),
```

## Component
```tsx
// src/features/blog/pages/BlogManagementPage.tsx
const { removePostById } = useBlogStore();

const handleDelete = async (id: string) => {
  try {
    // Import dynamic để tránh circular dependency
    const { blogApi } = await import('../api/blogApi');
    await blogApi.deletePost(id);
    message.success('Đã xóa bài viết');
    removePostById(id);
  } catch {
    message.error('Không thể xóa bài viết');
  }
};
```

## UI — Nút xóa
```tsx
<Button
  size="small"
  danger
  icon={<DeleteOutlined />}
  onClick={() => void handleDelete(String(record.id))}
>
  Xóa
</Button>
```

## Tại sao dùng dynamic import?
Store `useBlogStore` đã import `blogApi` rồi. Nếu component cũng import `blogApi` trực tiếp, sẽ gây **circular dependency**:
```
useBlogStore.ts imports blogApi.ts
BlogManagementPage.tsx imports blogApi.ts AND useBlogStore.ts
→ circular!
```
Giải pháp: dùng `await import('../api/blogApi')` trong handler để load động.
