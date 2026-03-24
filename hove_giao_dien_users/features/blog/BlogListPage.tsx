import { useState, useEffect } from 'react';
import { Input, Tag, Card, Row, Col, Spin, Avatar, Tabs, Flex } from 'antd';
import { SearchOutlined, EyeOutlined, CalendarOutlined, UserOutlined, GlobalOutlined, BankOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { blogApi, PlatformBlog } from '@/lib/blogApi';
import { companyBlogApi } from '@/lib/companyBlogApi';
const { Search } = Input;

export default function BlogListPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<PlatformBlog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<PlatformBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'platform' | 'company'>('all');

  useEffect(() => {
    loadBlogs();
  }, [activeTab]);

  useEffect(() => {
    filterBlogs();
  }, [searchText, blogs]);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      let allBlogs: PlatformBlog[] = [];

      if (activeTab === 'all' || activeTab === 'platform') {
        try {
          const platformBlogs = await blogApi.getAllBlogs('platform');
          allBlogs = [...allBlogs, ...platformBlogs];
        } catch (error) {
          console.error('Error loading platform blogs:', error);
        }
      }

      if (activeTab === 'all' || activeTab === 'company') {
        try {
          const companyBlogsResponse = await companyBlogApi.getAllBlogs();
          const companyBlogs = Array.isArray(companyBlogsResponse)
            ? companyBlogsResponse
            : (companyBlogsResponse?.data || companyBlogsResponse?.content || []);

          const transformedCompanyBlogs: PlatformBlog[] = companyBlogs
            .filter((blog: any) => blog && blog.id)
            .map((blog: any) => ({
              id: `company_${blog.id}`,
              title: blog.title || 'Bài viết công ty',
              excerpt: blog.content ? `${blog.content.substring(0, 150)}...` : 'Đang cập nhật nội dung...',
              content: blog.content || '',
              author: blog.authorName || blog.companyName || 'Công ty',
              authorAvatar: null,
              category: 'Công ty',
              image: blog.imageUrl,
              date: blog.createdAt || blog.publishedAt || blog.updatedAt || new Date().toISOString(),
              readTime: '5 phút đọc',
              views: blog.views || 0,
              source: 'company' as const,
              tags: [],
            }));

          allBlogs = [...allBlogs, ...transformedCompanyBlogs];
        } catch (error) {
          console.error('Error loading company blogs:', error);
        }
      }

      allBlogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setBlogs(allBlogs);
      setFilteredBlogs(allBlogs);
    } catch (error) {
      console.error('Error loading blogs:', error);
      setBlogs([]);
      setFilteredBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filterBlogs = () => {
    let filtered = [...blogs];

    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(blog =>
        blog.title?.toLowerCase().includes(searchLower) ||
        blog.content?.toLowerCase().includes(searchLower) ||
        blog.excerpt?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredBlogs(filtered);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  return (
    <div style={{ background: '#f3f6fb', minHeight: '100vh' }}>
      {/* Hero Section — matches site design system */}
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{
          background: 'linear-gradient(135deg, #0b1220 0%, #1e3a5f 100%)',
          borderRadius: '0 0 24px 24px',
          padding: '48px 40px 56px',
          marginBottom: 28,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative dots */}
        <div style={{
          position: 'absolute', top: 16, right: 24,
          width: 80, height: 80,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',

          background: 'rgba(22,163,74,0.12)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: 10, right: 60,
          width: 40, height: 40,
          background: 'rgba(22,163,74,0.08)',
          borderRadius: '50%',

        }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(22,163,74,0.15)',
            color: '#4ade80',
            padding: '4px 14px', borderRadius: 100,
            fontSize: 12, fontWeight: 600,
            marginBottom: 16, border: '1px solid rgba(22,163,74,0.25)',
          }}>
            <span>📚</span> Cẩm nang nghề nghiệp
          </div>

          <h1 style={{
            fontSize: 32, fontWeight: 800,
            color: '#f8fafc', lineHeight: 1.2, marginBottom: 12,
          }}>
            Khám phá kiến thức & <span style={{ color: '#4ade80' }}>Xu hướng mới</span>
          </h1>

          <p style={{
            fontSize: 15, color: '#94a3b8',
            marginBottom: 28, maxWidth: 560,
          }}>
            Chia sẻ kinh nghiệm quý báu, kiến thức chuyên môn và cập nhật những xu hướng chuyển dịch việc làm.
          </p>

          <Search
            placeholder="Tìm kiếm bài viết, kỹ năng, xu hướng..."
            allowClear
            enterButton={<span>Tìm kiếm</span>}
            size="large"
            onSearch={handleSearch}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 520 }}
          />
        </div>
      </div>

      {/* Content wrapper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tabs — consistent with site style */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '16px 20px',
          marginBottom: 28, border: '1px solid #e5e7eb',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as 'all' | 'platform' | 'company')}
          className="blog-tabs"
          tabBarStyle={{ marginBottom: 0, borderBottom: 'none' }}
          items={[
            {
              key: 'all',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 4px', fontWeight: 500 }}>
                  Tất cả
                </span>
              ),
            },
            {
              key: 'platform',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 4px', fontWeight: 500 }}>
                  <GlobalOutlined style={{ color: '#16a34a' }} /> Blog Nền Tảng
                </span>
              ),
            },
            {
              key: 'company',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 4px', fontWeight: 500 }}>
                  <BankOutlined style={{ color: '#f59e0b' }} /> Blog Công Ty
                </span>
              ),
            },
          ]}
        />
      </div>

      {/* Results header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20, paddingBottom: 16,
        borderBottom: '1px solid #e5e7eb',
      }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 2 }}>
            Bài viết mới nhất
          </h2>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
            Tìm thấy {filteredBlogs.length} bài viết
          </p>
        </div>
      </div>

      {/* Blog grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : filteredBlogs.length === 0 ? (
        <Card
          style={{ textAlign: 'center', padding: 60, borderRadius: 16, border: '1px solid #e5e7eb' }}
          styles={{ body: { padding: 60 } }}
        >
          <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 8 }}>
            Không tìm thấy bài viết nào
          </h3>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác.
          </p>
        </Card>
      ) : (
        <Row gutter={[20, 20]}>
          {filteredBlogs.map((blog) => (
            <Col key={blog.id} xs={24} sm={12} lg={8}>
              <Card
                hoverable
                onClick={() => router.push(`/blog/${blog.id}`)}
                style={{
                  borderRadius: 16, border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  transition: 'all 0.25s ease',
                  overflow: 'hidden',
                  height: '100%',
                }}
                styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column' } }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                {/* Cover image */}
                <div style={{ height: 200, overflow: 'hidden', position: 'relative', background: '#f3f4f6' }}>
                  {blog.image ? (
                    <img
                      alt={blog.title}
                      src={blog.image}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: blog.source === 'platform'
                        ? 'linear-gradient(135deg, #16a34a, #22c55e)'
                        : 'linear-gradient(135deg, #f59e0b, #ef4444)',
                    }}>
                      <span style={{ fontSize: 40, opacity: 0.9 }}>
                        {blog.source === 'platform' ? '📝' : '🏢'}
                      </span>
                    </div>
                  )}

                  {/* Source badge */}
                  <div style={{ position: 'absolute', top: 12, right: 12 }}>
                    <Tag
                      style={{
                        borderRadius: 100, border: 0, fontSize: 11, fontWeight: 600,
                        padding: '2px 10px',
                        background: 'rgba(255,255,255,0.95)',
                        color: blog.source === 'platform' ? '#16a34a' : '#f59e0b',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                      }}
                    >
                      {blog.source === 'platform' ? 'Nền tảng' : 'Công ty'}
                    </Tag>
                  </div>
                </div>

                {/* Card body */}
                <div style={{ padding: '18px 20px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Tag
                    style={{
                      borderRadius: 100, border: 0,
                      background: '#f0fdf4', color: '#16a34a',
                      fontSize: 11, fontWeight: 600, padding: '1px 10px',
                      marginBottom: 10, alignSelf: 'flex-start',
                    }}
                  >
                    {blog.category}
                  </Tag>

                  <h3 style={{
                    fontSize: 15, fontWeight: 700, color: '#111827',
                    marginBottom: 8, lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {blog.title}
                  </h3>

                  <p style={{
                    fontSize: 13, color: '#6b7280', lineHeight: 1.6,
                    flex: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {blog.excerpt || blog.content}
                  </p>

                  {/* Footer */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginTop: 14, paddingTop: 14,
                    borderTop: '1px solid #f3f4f6',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar
                        size={28}
                        src={blog.authorAvatar}
                        icon={<UserOutlined />}
                        style={{
                          background: blog.source === 'platform' ? '#16a34a' : '#f59e0b',
                          border: '1px solid #e5e7eb',
                        }}
                      />
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#374151', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {blog.author}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#9ca3af' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <EyeOutlined /> {blog.views || 0}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CalendarOutlined />
                        {new Date(blog.date).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      </div>
    </div>
  );
}
