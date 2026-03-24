# API + Component — createPost

## API
```ts
// src/features/blog/api/blogApi.ts
async createPost(payload: CreateBlogPostPayload): Promise<BlogPostDetail> {
  const data = {
    title: payload.title,
    excerpt: payload.excerpt,
    content: payload.content,
    author: payload.author,
    authorAvatar: null,
    category: payload.category,
    readTime: payload.readTime,
    image: payload.image || null,
    tags: Array.isArray(payload.tags) ? payload.tags.join(',') : '',
    source: 'platform', // Admin luôn tạo bài nền tảng
    companyId: null,
  };
  console.log('Sending blog post data:', data);
  return httpRequest<BlogPostDetail>('/blog/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

## BlogCreatePage — submit
```tsx
// src/features/blog/pages/BlogCreatePage.tsx
interface Props {
  onBackToList: () => void;
}

const BlogCreatePage = ({ onBackToList }: Props) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    await blogApi.createPost(values);
    message.success('Tạo bài viết thành công');
    onBackToList();
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="excerpt" label="Tóm tắt">
        <Input.TextArea />
      </Form.Item>
      <Form.Item name="content" label="Nội dung" rules={[{ required: true }]}>
        <Input.TextArea rows={10} />
      </Form.Item>
      <Form.Item name="author" label="Tác giả" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="category" label="Danh mục" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="readTime" label="Thời gian đọc" rules={[{ required: true }]}>
        <Input placeholder="Ví dụ: 5 phút" />
      </Form.Item>
      <Form.Item name="tags" label="Tags">
        <Input placeholder="Nhập tags, cách nhau bởi dấu phẩy" />
      </Form.Item>
      <Button type="primary" htmlType="submit">Tạo bài viết</Button>
    </Form>
  );
};
```

## App.tsx — routing
```tsx
// src/App.tsx
const App = () => {
  const [view, setView] = useState<AdminView>('dashboard');

  return (
    <AdminLayout>
      {view === 'blogCreate' && (
        <BlogCreatePage onBackToList={() => setView('blog')} />
      )}
    </AdminLayout>
  );
};
```
