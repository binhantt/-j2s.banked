# Store + API

## Store
```ts
// src/features/blog/store/useBlogStore.ts
loadPosts: async () => {
  set({ loading: true, error: null });
  try {
    const data = await blogApi.getPosts();
    set({ posts: data, loading: false });
  } catch (error) {
    set({
      loading: false,
      error: error instanceof Error ? error.message : 'Không tải được danh sách blog',
    });
    throw error;
  }
},
```

## API
```ts
// src/features/blog/api/blogApi.ts
async getPosts(): Promise<BlogPostSummary[]> {
  const data = await httpRequest<BlogPostDetail[]>('/blog/posts');
  return data.map((post) => ({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    author: post.author,
    category: post.category,
    date: post.date,
    readTime: post.readTime,
    views: post.views,
    source: post.source,
  }));
}
```

## Component
```tsx
// src/features/blog/pages/BlogManagementPage.tsx
const { posts, loading, loadPosts } = useBlogStore();

useEffect(() => {
  void loadPosts().catch(() => {
    message.error('Không tải được danh sách blog');
  });
}, [loadPosts]);
```

## Table Columns
```tsx
const columns: ColumnsType<BlogPostSummary> = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  {
    title: 'Tiêu đề',
    dataIndex: 'title',
    key: 'title',
    render: (value: string) => <Text strong>{value}</Text>,
  },
  { title: 'Tác giả', dataIndex: 'author', key: 'author', width: 160 },
  {
    title: 'Nguồn', dataIndex: 'source', key: 'source', width: 120,
    render: (source: BlogPostSummary['source']) =>
      source === 'platform'
        ? <Tag color="blue">Nền tảng</Tag>
        : <Tag color="green">Công ty</Tag>,
  },
  { title: 'Danh mục', dataIndex: 'category', key: 'category', width: 140,
    render: (value: string) => <Tag>{value}</Tag> },
  { title: 'Ngày', dataIndex: 'date', key: 'date', width: 120 },
  { title: 'Lượt xem', dataIndex: 'views', key: 'views', width: 110 },
  { title: 'Thời gian đọc', dataIndex: 'readTime', key: 'readTime', width: 130 },
  {
    title: 'Thao tác', key: 'actions', width: 170,
    render: (_, record) => (
      <Space>
        <Button size="small" icon={<EyeOutlined />}
          onClick={() => void handleViewDetail(String(record.id))}>Xem</Button>
        <Button size="small" danger icon={<DeleteOutlined />}
          onClick={() => void handleDelete(String(record.id))}>Xóa</Button>
      </Space>
    ),
  },
];
```
