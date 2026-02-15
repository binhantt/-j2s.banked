import { useState, useEffect } from 'react';
import { Card, Row, Col, Tag, Empty, Spin, Input } from 'antd';
import { EyeOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { MainLayout } from '@/components/layout/MainLayout';
import { companyBlogApi, CompanyBlog } from '@/lib/companyBlogApi';
import { useRouter } from 'next/router';

const { Search } = Input;

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<CompanyBlog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<CompanyBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const data = await companyBlogApi.getBlogsByStatus('published');
      setBlogs(data);
      setFilteredBlogs(data);
    } catch (error) {
      console.error('Error loading blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    if (!value) {
      setFilteredBlogs(blogs);
      return;
    }
    const filtered = blogs.filter(blog =>
      blog.title.toLowerCase().includes(value.toLowerCase()) ||
      blog.content.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredBlogs(filtered);
  };

  const handleBlogClick = (id: number) => {
    router.push(`/blogs/${id}`);
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

  return (
    <MainLayout>
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>
            Blog Công ty
          </h1>
          <Search
            placeholder="Tìm kiếm blog..."
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ maxWidth: '500px' }}
            size="large"
          />
        </div>

        {filteredBlogs.length === 0 ? (
          <Empty description="Chưa có blog nào" />
        ) : (
          <Row gutter={[24, 24]}>
            {filteredBlogs.map((blog) => (
              <Col xs={24} sm={12} lg={8} key={blog.id}>
                <Card
                  hoverable
                  cover={
                    blog.imageUrl ? (
                      <img
                        alt={blog.title}
                        src={blog.imageUrl}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          height: '200px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '48px',
                        }}
                      >
                        📝
                      </div>
                    )
                  }
                  onClick={() => handleBlogClick(blog.id!)}
                >
                  <Card.Meta
                    title={
                      <div style={{ 
                        fontSize: '18px',
                        fontWeight: 'bold',
                        marginBottom: '8px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {blog.title}
                      </div>
                    }
                    description={
                      <div>
                        <p style={{
                          color: '#6b7280',
                          marginBottom: '12px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                        }}>
                          {blog.content}
                        </p>
                        <div style={{ 
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '12px',
                          color: '#9ca3af'
                        }}>
                          <span>
                            <UserOutlined /> {blog.authorName}
                          </span>
                          <span>
                            <EyeOutlined /> {blog.views || 0}
                          </span>
                        </div>
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#9ca3af' }}>
                          <CalendarOutlined /> {new Date(blog.createdAt!).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </MainLayout>
  );
}
