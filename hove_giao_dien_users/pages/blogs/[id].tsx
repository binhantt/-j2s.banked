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
          <Button type="primary" onClick={() => router.push('/blogs')}>
            Quay lại danh sách
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/blogs')}
          style={{ marginBottom: '24px' }}
        >
          Quay lại
        </Button>

        <Card>
          {blog.imageUrl && (
            <img
              alt={blog.title}
              src={blog.imageUrl}
              style={{
                width: '100%',
                maxHeight: '400px',
                objectFit: 'cover',
                borderRadius: '8px',
                marginBottom: '24px',
              }}
            />
          )}

          <h1 style={{ 
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '16px',
            lineHeight: '1.4'
          }}>
            {blog.title}
          </h1>

          <div style={{
            display: 'flex',
            gap: '24px',
            marginBottom: '24px',
            fontSize: '14px',
            color: '#6b7280',
            flexWrap: 'wrap'
          }}>
            <span>
              <UserOutlined /> {blog.authorName}
            </span>
            <span>
              <CalendarOutlined /> {new Date(blog.createdAt!).toLocaleDateString('vi-VN')}
            </span>
            <span>
              <EyeOutlined /> {blog.views || 0} lượt xem
            </span>
            <Tag color={blog.status === 'published' ? 'green' : 'orange'}>
              {blog.status === 'published' ? 'Đã xuất bản' : 'Nháp'}
            </Tag>
          </div>

          <Divider />

          <div style={{
            fontSize: '16px',
            lineHeight: '1.8',
            color: '#374151',
            whiteSpace: 'pre-wrap'
          }}>
            {blog.content}
          </div>

          {blog.publishedAt && (
            <div style={{
              marginTop: '32px',
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              Xuất bản lúc: {new Date(blog.publishedAt).toLocaleString('vi-VN')}
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
