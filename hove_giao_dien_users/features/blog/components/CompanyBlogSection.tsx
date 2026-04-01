import { useEffect, useState } from 'react';
import { Row, Col, Card, Empty, Spin, message } from 'antd';
import { EyeOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { companyBlogApi, type CompanyBlog } from '@/lib/companyBlogApi';
import { useRouter } from 'next/router';

export const CompanyBlogSection = () => {
  const [blogs, setBlogs] = useState<CompanyBlog[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const data = await companyBlogApi.getAllBlogs();
      const published = (data || []).filter(
        (blog: CompanyBlog) => blog.status === 'published'
      );
      setBlogs(published);
    } catch (error) {
      message.error('Không thể tải blog nhà tuyển dụng');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!blogs.length) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
        <Empty description="Chưa có blog nhà tuyển dụng" />
      </div>
    );
  }

  return (
    <div style={{ marginTop: 64 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{
          fontSize: 22, fontWeight: 700, color: '#0b1220', margin: 0,
        }}>
          Blog nhà tuyển dụng
        </h2>
        <button
          onClick={() => router.push('/blog')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#16a34a', fontWeight: 500, fontSize: 14,
          }}
        >
          Xem tất cả →
        </button>
      </div>

      <Row gutter={[24, 24]}>
        {blogs.slice(0, 6).map((blog) => (
          <Col xs={24} sm={12} lg={8} key={blog.id}>
            <Card
              hoverable
              onClick={() => router.push(`/blog/company_${blog.id}`)}
              cover={
                blog.imageUrl ? (
                  <img
                    src={blog.imageUrl}
                    alt={blog.title}
                    style={{ height: 192, width: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    height: 192, width: '100%',
                    background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 36,
                  }}>
                    📝
                  </div>
                )
              }
              style={{ height: '100%', borderRadius: 14, border: '1px solid #f0fdf4' }}
              styles={{ body: { padding: 16 } }}
            >
              <h3 style={{
                fontSize: 15, fontWeight: 700,
                color: '#0b1220', marginBottom: 8, lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {blog.title}
              </h3>
              <p style={{
                fontSize: 13, color: '#64748b',
                lineHeight: 1.6, marginBottom: 12,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {blog.content}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <UserOutlined style={{ color: '#16a34a' }} />
                  {blog.authorName}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <EyeOutlined style={{ color: '#16a34a' }} />
                  {blog.views || 0}
                </span>
                {blog.createdAt && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CalendarOutlined style={{ color: '#16a34a' }} />
                    {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};
