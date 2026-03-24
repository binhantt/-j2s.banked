import { useState, useEffect } from 'react';
import { Card, Row, Col, Tag, Empty, Spin, Input, Tabs, Avatar } from 'antd';
import { EyeOutlined, CalendarOutlined, UserOutlined, GlobalOutlined, BankOutlined } from '@ant-design/icons';
import { MainLayout } from '@/components/layout/MainLayout';
import { blogApi, PlatformBlog } from '@/lib/blogApi';
import { useRouter } from 'next/router';

const { Search } = Input;

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<PlatformBlog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<PlatformBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'platform' | 'company'>('all');
  const router = useRouter();

  useEffect(() => {
    loadBlogs();
  }, [activeTab]);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const source = activeTab === 'all' ? undefined : activeTab;
      const data = await blogApi.getAllBlogs(source);
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
      blog.content.toLowerCase().includes(value.toLowerCase()) ||
      (blog.excerpt && blog.excerpt.toLowerCase().includes(value.toLowerCase()))
    );
    setFilteredBlogs(filtered);
  };

  const handleBlogClick = (id: string) => {
    router.push(`/blog/${id}`);
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
            Blog & Tin tức
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Khám phá kiến thức và tin tức mới nhất từ nền tảng và các công ty
          </p>

          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as 'all' | 'platform' | 'company')}
            items={[
              {
                key: 'all',
                label: 'Tất cả',
              },
              {
                key: 'platform',
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <GlobalOutlined /> Blog nền tảng
                  </span>
                ),
              },
              {
                key: 'company',
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BankOutlined /> Blog công ty
                  </span>
                ),
              },
            ]}
            style={{ marginBottom: '24px' }}
          />

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
                    blog.image ? (
                      <div style={{ position: 'relative' }}>
                        <img
                          alt={blog.title}
                          src={blog.image}
                          style={{ height: '200px', objectFit: 'cover', width: '100%' }}
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/400x200/e5e7eb/64748b?text=Blog';
                          }}
                        />
                        <Tag
                          color={blog.source === 'platform' ? 'cyan' : 'green'}
                          style={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            borderRadius: 12,
                          }}
                          icon={blog.source === 'platform' ? <GlobalOutlined /> : <BankOutlined />}
                        >
                          {blog.source === 'platform' ? 'Nền tảng' : 'Công ty'}
                        </Tag>
                      </div>
                    ) : (
                      <div
                        style={{
                          height: '200px',
                          background: blog.source === 'platform'
                            ? 'linear-gradient(135deg, #16a34a 0%, #16a34a 100%)'
                            : 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '48px',
                        }}
                      >
                        {blog.source === 'platform' ? '📝' : '🏢'}
                      </div>
                    )
                  }
                  onClick={() => handleBlogClick(blog.id)}
                >
                  <div style={{ marginBottom: '12px' }}>
                    <Tag color={blog.source === 'platform' ? 'cyan' : 'green'}>
                      {blog.category}
                    </Tag>
                  </div>

                  <Card.Meta
                    title={
                      <div style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        marginBottom: '8px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
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
                          {blog.excerpt || blog.content}
                        </p>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: '12px',
                          borderTop: '1px solid #f3f4f6',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Avatar
                              size="small"
                              src={blog.authorAvatar}
                              icon={<UserOutlined />}
                              style={{ background: blog.source === 'platform' ? '#16a34a' : '#f59e0b' }}
                            />
                            <span style={{ fontSize: '13px', color: '#6b7280' }}>
                              {blog.author}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: 12, fontSize: '12px', color: '#9ca3af' }}>
                            <span>
                              <EyeOutlined /> {blog.views || 0}
                            </span>
                          </div>
                        </div>
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#9ca3af' }}>
                          <CalendarOutlined /> {blog.date}
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
