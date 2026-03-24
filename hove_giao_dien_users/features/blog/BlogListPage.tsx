import { useState, useEffect } from 'react';
import { Input, Tag, Card, Row, Col, Spin, Avatar, Tabs, Button } from 'antd';
import { SearchOutlined, EyeOutlined, CalendarOutlined, UserOutlined, GlobalOutlined, BankOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { blogApi, PlatformBlog } from '@/lib/blogApi';
import { companyBlogApi } from '@/lib/companyBlogApi';

const { Search } = Input;

const CATEGORIES = [
  { label: 'Tất cả', value: '' },
  { label: 'Kỹ năng', value: 'skill' },
  { label: 'Xu hướng', value: 'trend' },
  { label: 'Kinh nghiệm', value: 'experience' },
  { label: 'Công nghệ', value: 'tech' },
];

export default function BlogListPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<PlatformBlog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<PlatformBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'platform' | 'company'>('all');

  useEffect(() => {
    loadBlogs();
  }, [activeTab]);

  useEffect(() => {
    filterBlogs();
  }, [searchText, selectedCategory, blogs]);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      let allBlogs: PlatformBlog[] = [];
      
      if (activeTab === 'all' || activeTab === 'platform') {
        // Load platform blogs
        try {
          const platformBlogs = await blogApi.getAllBlogs('platform');
          allBlogs = [...allBlogs, ...platformBlogs];
        } catch (error) {
          console.error('Error loading platform blogs:', error);
        }
      }
      
      if (activeTab === 'all' || activeTab === 'company') {
        // Load company blogs
        try {
          const companyBlogsResponse = await companyBlogApi.getAllBlogs();
          const companyBlogs = Array.isArray(companyBlogsResponse)
            ? companyBlogsResponse
            : (companyBlogsResponse?.data || companyBlogsResponse?.content || []);

          // Transform company blogs to match platform blog format
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

      // Sort by date (newest first)
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

    if (selectedCategory) {
      filtered = filtered.filter(blog => blog.category === selectedCategory);
    }

    setFilteredBlogs(filtered);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Premium Hero Section */}
      <div 
        style={{
          background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)',
          padding: '80px 0 64px',
          marginBottom: 32,
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid #dcfce7'
        }}
      >
        {/* Decorative elements */}
        <div style={{
          position: 'absolute', top: -100, right: -100, width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(22,163,74,0.08) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: -150, left: -50, width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(22,163,74,0.05) 0%, transparent 70%)',
        }} />

        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', padding: '0 24px', position: 'relative' }}>
          <div style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#f0fdf4',
            color: '#16a34a',
            padding: '8px 20px',
            borderRadius: 100,
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 24,
            border: '1px solid #dcfce7',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            📚 KHÁM PHÁ KIẾN THỨC MỚI
          </div>
          
          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: 20,
            lineHeight: 1.1,
          }}>
            Blog & Cẩm nang <span style={{ color: '#16a34a' }}>nghề nghiệp</span>
          </h1>
          
          <p style={{
            fontSize: 18,
            color: '#64748b',
            marginBottom: 40,
            lineHeight: 1.6,
            maxWidth: 600,
            marginInline: 'auto'
          }}>
            Chia sẻ kinh nghiệm, kiến thức chuyên môn và cập nhật xu hướng mới nhất trong thế giới công việc
          </p>
          
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <Search
              placeholder="Tìm kiếm bài viết, chủ đề bạn quan tâm..."
              allowClear
              enterButton={
                <Button style={{ 
                  background: 'linear-gradient(135deg, #16a34a, #22c55e)', 
                  border: 'none', color: '#fff', height: 54, paddingInline: 32,
                  fontWeight: 700, borderRadius: '0 12px 12px 0'
                }}>
                  Tìm kiếm
                </Button>
              }
              size="large"
              onSearch={handleSearch}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%', height: 54 }}
              className="premium-search-bar"
            />
            <style dangerouslySetInnerHTML={{__html: `
              .premium-search-bar .ant-input-affix-wrapper {
                height: 54px;
                border: 1px solid #dcfce7 !important;
                border-radius: 12px 0 0 12px !important;
                box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05) !important;
                padding-left: 20px;
              }
              .premium-search-bar .ant-input-group-addon {
                background: transparent !important;
              }
              .premium-search-bar .ant-btn-primary {
                height: 54px !important;
                border-radius: 0 12px 12px 0 !important;
              }
            `}} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 80px' }}>
        {/* Tabs for filtering by source */}
        <div 
          style={{
            background: '#fff',
            borderRadius: 20,
            padding: '8px 8px',
            border: '1px solid #f1f5f9',
            marginBottom: 40,
            boxShadow: '0 4px 20px -5px rgba(0,0,0,0.03)',
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as 'all' | 'platform' | 'company')}
            centered
            className="premium-blog-tabs"
            items={[
              {
                key: 'all',
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 16, fontWeight: 600, padding: '0 20px' }}>
                    <SearchOutlined /> Tất cả bài viết
                  </span>
                ),
              },
              {
                key: 'platform',
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 16, fontWeight: 600, padding: '0 20px' }}>
                    <GlobalOutlined /> Blog hệ thống
                  </span>
                ),
              },
              {
                key: 'company',
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 16, fontWeight: 600, padding: '0 20px' }}>
                    <BankOutlined /> Blog từ công ty
                  </span>
                ),
              },
            ]}
          />
          <style dangerouslySetInnerHTML={{__html: `
            .premium-blog-tabs .ant-tabs-nav::before { display: none !important; }
            .premium-blog-tabs .ant-tabs-tab { 
              padding: 16px 0 !important; 
              margin: 0 4px !important;
              border-radius: 12px;
              transition: all 0.2s ease;
            }
            .premium-blog-tabs .ant-tabs-tab:hover { color: #16a34a !important; background: #f0fdf4 !important; }
            .premium-blog-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { color: #16a34a !important; }
            .premium-blog-tabs .ant-tabs-ink-bar { background: #16a34a !important; height: 3px !important; border-radius: 4px; }
          `}} />
        </div>


        {/* Blog List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" />
            <p style={{ color: '#64748b', marginTop: 16 }}>Đang tải cảm nang nghề nghiệp...</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
                  Bài viết mới nhất
                </h2>
                <div style={{ height: 4, width: 48, background: '#16a34a', borderRadius: 4 }}></div>
              </div>
              <p style={{ fontSize: 15, color: '#64748b', margin: 0 }}>
                Tìm thấy <span style={{ fontWeight: 700, color: '#0f172a' }}>{filteredBlogs.length}</span> bài viết
              </p>
            </div>

            {filteredBlogs.length === 0 ? (
              <div 
                style={{
                  background: '#fff',
                  borderRadius: 24,
                  padding: 80,
                  textAlign: 'center',
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 10px 30px -10px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ fontSize: 64, marginBottom: 24 }}>📝</div>
                <h3 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
                  Không tìm thấy bài viết
                </h3>
                <p style={{ color: '#64748b', fontSize: 16, maxWidth: 400, margin: '0 auto' }}>
                  Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục bài viết khác.
                </p>
              </div>
            ) : (
              <Row gutter={[28, 28]}>
                {filteredBlogs.map((blog) => (
                  <Col key={blog.id} xs={24} sm={12} lg={8}>
                    <div
                      style={{
                        background: '#fff',
                        borderRadius: 24,
                        border: '1px solid #f1f5f9',
                        overflow: 'hidden',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px)';
                        e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(22,163,74,0.1)';
                        e.currentTarget.style.borderColor = '#dcfce7';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.02)';
                        e.currentTarget.style.borderColor = '#f1f5f9';
                      }}
                      onClick={() => router.push(`/blog/${blog.id}`)}
                    >
                      <div style={{ 
                        height: 220, 
                        overflow: 'hidden',
                        position: 'relative',
                        background: '#f8fafc'
                      }}>
                        <img
                          alt={blog.title}
                          src={blog.image || 'https://via.placeholder.com/600x400/f8fafc/64748b?text=Knowledge+Hub'}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            transition: 'transform 0.5s ease'
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          top: 16,
                          left: 16,
                          background: blog.source === 'platform' ? '#16a34a' : '#f59e0b',
                          color: '#fff',
                          padding: '6px 14px',
                          borderRadius: 100,
                          fontSize: 11,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          backdropFilter: 'blur(4px)'
                        }}>
                          {blog.source === 'platform' ? <GlobalOutlined /> : <BankOutlined />}
                          {blog.category}
                        </div>
                      </div>

                      <div style={{ padding: 24, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: '#0f172a',
                          marginBottom: 12,
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          height: '2.8em'
                        }}>
                          {blog.title}
                        </h3>

                        <p style={{
                          fontSize: 14,
                          color: '#64748b',
                          marginBottom: 24,
                          lineHeight: 1.6,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          flexGrow: 1
                        }}>
                          {blog.excerpt || blog.content}
                        </p>

                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          paddingTop: 16,
                          borderTop: '1px solid #f1f5f9',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar 
                              size={32} 
                              src={blog.authorAvatar}
                              icon={<UserOutlined />}
                              style={{ 
                                background: blog.source === 'platform' ? '#f0fdf4' : '#fff7ed',
                                color: blog.source === 'platform' ? '#16a34a' : '#f59e0b',
                                border: `1px solid ${blog.source === 'platform' ? '#dcfce7' : '#ffedd5'}`
                              }}
                            />
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
                              {blog.author}
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#94a3b8' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <EyeOutlined /> {blog.views || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            )}
          </>
        )}
      </div>
    </div>
  );
}
