import { useState, useEffect } from 'react';
import { Card, Tag, Spin, Button, Divider } from 'antd';
import { EyeOutlined, CalendarOutlined, UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { MainLayout } from '@/components/layout/MainLayout';
import { companyBlogApi, CompanyBlog } from '@/lib/companyBlogApi';
import { useRouter } from 'next/router';

export default function BlogDetailPage() {
  const [blog, setBlog] = useState<CompanyBlog | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      loadBlog(Number(id));
    }
  }, [id]);

  const loadBlog = async (blogId: number) => {
    setLoading(true);
    try {
      const data = await companyBlogApi.getBlog(blogId);
      setBlog(data);
    } catch (error) {
      console.error('Error loading blog:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  if (!blog) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <h2>Không tìm thấy blog</h2>
          <Button type="primary" onClick={() => router.push('/blog')}>
            Quay lại danh sách
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ padding: '32px 24px', maxWidth: 900, margin: '0 auto' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/blog')}
          style={{ marginBottom: 24, borderRadius: 8 }}
        >
          Quay lại
        </Button>

        <Card style={{ borderRadius: 14, border: '1px solid #e5e7eb' }}>
          {blog.imageUrl && (
            <img
              alt={blog.title}
              src={blog.imageUrl}
              style={{
                width: '100%',
                maxHeight: 400,
                objectFit: 'cover',
                borderRadius: 10,
                marginBottom: 24,
              }}
            />
          )}

          <h1 style={{
            fontSize: 'clamp(20px, 4vw, 32px)',
            fontWeight: 700,
            marginBottom: 16,
            lineHeight: 1.3,
            color: '#0b1220',
            letterSpacing: '-0.01em',
          }}>
            {blog.title}
          </h1>

          <div style={{
            display: 'flex',
            gap: 24,
            marginBottom: 24,
            fontSize: 14,
            color: '#64748b',
            flexWrap: 'wrap',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <UserOutlined style={{ color: '#16a34a' }} />
              {blog.authorName}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CalendarOutlined style={{ color: '#16a34a' }} />
              {new Date(blog.createdAt!).toLocaleDateString('vi-VN')}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <EyeOutlined style={{ color: '#16a34a' }} />
              {blog.views || 0} lượt xem
            </span>
            <Tag color={blog.status === 'published' ? 'green' : 'green'} style={{ borderRadius: 6 }}>
              {blog.status === 'published' ? 'Đã xuất bản' : 'Nháp'}
            </Tag>
          </div>

          <Divider />

          <div style={{
            fontSize: 16,
            lineHeight: 1.9,
            color: '#374151',
            whiteSpace: 'pre-wrap',
          }}>
            {blog.content}
          </div>

          {blog.publishedAt && (
            <div style={{
              marginTop: 32,
              padding: 16,
              background: '#f0fdf4',
              borderRadius: 10,
              border: '1px solid #dcfce7',
              fontSize: 14,
              color: '#64748b',
            }}>
              Xuất bản lúc: {new Date(blog.publishedAt).toLocaleString('vi-VN')}
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
