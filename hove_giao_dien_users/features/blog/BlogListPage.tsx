import { useState, useEffect } from 'react';
import { Row, Col, Spin, Empty, Tag, Avatar, Button, Input, Divider } from 'antd';
import { 
  SearchOutlined, 
  ArrowRightOutlined, 
  UserOutlined, 
  EyeOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FireOutlined,
  BookOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { blogApi } from '@/lib/blogApi';
import { companyBlogApi } from '@/lib/companyBlogApi';

const BlogListPage = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategories, setActiveCategories] = useState<{value: string, label: string}[]>([]);
  
  useEffect(() => {
    loadCategories();
    loadAllPosts();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await companyBlogApi.getCategories();
      const dynamicCategories = data.map((cat: any) => ({
        value: cat.name,
        label: cat.name
      }));
      setActiveCategories([{ value: 'all', label: 'Tất cả' }, ...dynamicCategories]);
    } catch (error) {
      console.error('Failed to load categories:', error);
      // Fallback to static if request fails
      setActiveCategories([
        { value: 'all', label: 'Tất cả' },
        { value: 'Kỹ năng', label: 'Kỹ năng' },
        { value: 'Nghề nghiệp', label: 'Nghề nghiệp' },
        { value: 'Công nghệ', label: 'Công nghệ' },
        { value: 'Phỏng vấn', label: 'Phỏng vấn' },
      ]);
    }
  };

  const loadAllPosts = async () => {
    setLoading(true);
    try {
      const [platformPosts, companyPosts] = await Promise.all([
        blogApi.getAllBlogs().catch(() => []),
        companyBlogApi.getAllBlogs().catch(() => [])
      ]);

      const transformedCompanyPosts = companyPosts.map((post: any) => ({
        id: `company_${post.id}`,
        title: post.title,
        excerpt: post.content?.substring(0, 160) + '...',
        author: post.authorName,
        authorAvatar: null,
        category: post.category || 'Công ty',
        image: post.imageUrl,
        date: post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : '',
        readTime: '5 phút đọc',
        views: post.views || 0,
        source: 'company',
        tags: []
      }));

      const allPosts = [...platformPosts, ...transformedCompanyPosts];
      setPosts(allPosts.sort((a, b) => {
        const dateA = a.date ? new Date(a.date.split('/').reverse().join('-')).getTime() : 0;
        const dateB = b.date ? new Date(b.date.split('/').reverse().join('-')).getTime() : 0;
        return dateB - dateA;
      }));
    } catch (error) {
      console.error('Failed to load blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 100 }}>
      {/* Premium Hero Section with Modern Aesthetics */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0b1220 0%, #166534 100%)', 
        padding: '100px 24px 140px',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center'
      }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '-5%',
          width: '40%', height: '80%',
          background: 'radial-gradient(circle, rgba(22,163,74,0.15) 0%, transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none'
        }} />
        
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <span style={{ 
              background: 'rgba(255,255,255,0.1)', 
              backdropFilter: 'blur(8px)',
              padding: '8px 24px', 
              borderRadius: 100, 
              color: '#dcfce7', 
              fontSize: 14, 
              fontWeight: 700,
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <BookOutlined /> Hove Premium Knowledge Base
            </span>
          </div>

          <h1 style={{ 
            fontSize: 'clamp(36px, 6vw, 72px)', 
            fontWeight: 900, 
            color: '#fff', 
            marginBottom: 24,
            letterSpacing: '-0.03em',
            lineHeight: 1.1
          }}>
            Blog & Cẩm nang <span style={{ color: '#4ade80' }}>Sự nghiệp</span>
          </h1>
          
          <p style={{ 
            fontSize: 20, 
            color: 'rgba(255,255,255,0.8)', 
            maxWidth: 750, 
            margin: '0 auto 48px',
            lineHeight: 1.7
          }}>
            Đón đầu xu hướng, làm chủ kỹ năng và bứt phá giới hạn sự nghiệp cùng hàng nghìn bài viết từ các chuyên gia đầu ngành.
          </p>
          
          <div style={{ 
            maxWidth: 600, 
            margin: '0 auto 48px',
            background: 'rgba(255,255,255,0.05)',
            padding: 8,
            borderRadius: 20,
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Input
              size="large"
              placeholder="Tìm kiếm bài viết, kiến thức, mẹo hay..."
              prefix={<SearchOutlined style={{ color: '#4ade80', fontSize: 20 }} />}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                height: 56, 
                borderRadius: 16, 
                border: 'none', 
                background: 'rgba(255,255,255,0.95)',
                fontSize: 16
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            {activeCategories.map((cat: any) => (
              <Button
                key={cat.value}
                type="text"
                onClick={() => setSelectedCategory(cat.value)}
                style={{ 
                  borderRadius: 12, 
                  height: 48, 
                  padding: '0 28px',
                  background: selectedCategory === cat.value ? '#16a34a' : 'transparent',
                  color: selectedCategory === cat.value ? '#fff' : 'rgba(255,255,255,0.9)',
                  fontWeight: 700,
                  fontSize: 15,
                  transition: 'all 0.3s ease'
                }}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '-70px auto 0', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '120px 0', 
            background: '#fff', 
            borderRadius: 40, 
            boxShadow: '0 40px 100px rgba(15,23,42,0.12)',
            border: '1px solid #f1f5f9'
          }}>
            <Spin size="large" tip="Đang tuyển tập những kiến thức hay nhất cho bạn..." />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div style={{ 
            background: '#fff', 
            borderRadius: 40, 
            padding: 100, 
            textAlign: 'center', 
            boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
            border: '1px solid #f1f5f9'
          }}>
            <Empty description="Rất tiếc, chưa tìm thấy bài viết nào phù hợp với yêu cầu của bạn" />
            <Button 
              type="primary" 
              size="large" 
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              style={{ marginTop: 24, borderRadius: 12, background: '#16a34a' }}
            >
              Xem tất cả bài viết
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
            {/* Featured Post - Premium Showcase */}
            {filteredPosts[0] && selectedCategory === 'all' && searchQuery === '' && (
              <div 
                onClick={() => router.push(`/blog/${filteredPosts[0].id}`)}
                style={{ 
                  background: '#fff', 
                  borderRadius: 40, 
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'row',
                  boxShadow: '0 50px 100px rgba(15,23,42,0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
                  border: '1px solid #f1f5f9',
                  minHeight: 520
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-12px) scale(1.01)';
                  e.currentTarget.style.boxShadow = '0 60px 120px rgba(15,23,42,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 50px 100px rgba(15,23,42,0.15)';
                }}
              >
                <div style={{ flex: 1.4, position: 'relative', overflow: 'hidden' }}>
                  <img 
                    src={filteredPosts[0].image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1000'} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.8s ease' }} 
                  />
                  <div style={{ 
                    position: 'absolute', inset: 0, 
                    background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 40%)' 
                  }} />
                  <div style={{ position: 'absolute', top: 32, left: 32 }}>
                    <span style={{ 
                      background: '#16a34a', color: '#fff', 
                      padding: '8px 20px', borderRadius: 100, 
                      fontSize: 12, fontWeight: 800, textTransform: 'uppercase',
                      letterSpacing: '0.1em', boxShadow: '0 10px 20px rgba(22,163,74,0.3)'
                    }}>
                      <FireOutlined /> Editor's Choice
                    </span>
                  </div>
                </div>
                <div style={{ flex: 1, padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                    <Tag style={{ background: '#f0fdf4', color: '#16a34a', border: 'none', borderRadius: 100, padding: '4px 16px', fontWeight: 700, fontSize: 13 }}>
                      {filteredPosts[0].category}
                    </Tag>
                    <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CalendarOutlined /> {filteredPosts[0].date}
                    </span>
                  </div>
                  <h2 style={{ fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 900, color: '#0f172a', marginBottom: 24, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                    {filteredPosts[0].title}
                  </h2>
                  <p style={{ fontSize: 18, color: '#64748b', lineHeight: 1.8, marginBottom: 40 }}>
                    {filteredPosts[0].excerpt}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <Avatar size={56} src={filteredPosts[0].authorAvatar} icon={<UserOutlined />} style={{ background: '#16a34a', border: '3px solid #f0fdf4' }} />
                      <div>
                        <div style={{ fontWeight: 800, color: '#1e293b', fontSize: 16 }}>{filteredPosts[0].author}</div>
                        <div style={{ fontSize: 13, color: '#94a3b8' }}>Chuyên gia nội dung</div>
                      </div>
                    </div>
                    <Button 
                      type="primary" 
                      shape="circle" 
                      icon={<ArrowRightOutlined />} 
                      style={{ 
                        width: 56, height: 56, 
                        background: '#16a34a', 
                        display: 'grid', 
                        placeItems: 'center', 
                        fontSize: 20 ,
                        boxShadow: '0 10px 20px rgba(22,163,74,0.2)'
                      }} 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Standard Grid with Premium Cards */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
                <div>
                  <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>
                    {selectedCategory === 'all' ? 'Tất cả bài viết' : `Chuyên mục ${selectedCategory}`}
                  </h2>
                  <div style={{ height: 4, width: 60, background: '#16a34a', borderRadius: 100 }} />
                </div>
                <div style={{ fontSize: 15, color: '#94a3b8', fontWeight: 600 }}>
                  <span style={{ color: '#16a34a' }}>{filteredPosts.length}</span> bài viết được tìm thấy
                </div>
              </div>

              <Row gutter={[32, 40]}>
                {filteredPosts.map((post, index) => {
                  // Skip the first post only if we are in 'all' category and no search
                  if (index === 0 && selectedCategory === 'all' && searchQuery === '') return null;
                  
                  return (
                    <Col key={post.id} xs={24} md={12} lg={8}>
                      <div 
                        onClick={() => router.push(`/blog/${post.id}`)}
                        style={{ 
                          background: '#fff', borderRadius: 32, overflow: 'hidden', 
                          height: '100%', border: '1px solid #f1f5f9', cursor: 'pointer',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
                          boxShadow: '0 4px 20px rgba(15,23,42,0.02)',
                          display: 'flex', flexDirection: 'column'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-10px)';
                          e.currentTarget.style.boxShadow = '0 30px 60px rgba(15,23,42,0.08)';
                          e.currentTarget.style.borderColor = '#dcfce7';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 20px rgba(15,23,42,0.02)';
                          e.currentTarget.style.borderColor = '#f1f5f9';
                        }}
                      >
                        <div style={{ height: 260, overflow: 'hidden', position: 'relative' }}>
                          <img 
                            src={post.image || 'https://via.placeholder.com/600x400/f8fafc/64748b?text=Discovery'} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s' }} 
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          />
                          <div style={{ 
                            position: 'absolute', top: 20, left: 20, zIndex: 2 
                          }}>
                            <Tag style={{ 
                              background: 'rgba(255,255,255,0.9)', 
                              backdropFilter: 'blur(8px)',
                              color: '#16a34a', border: 'none', 
                              borderRadius: 100, padding: '4px 16px', fontWeight: 800, fontSize: 11
                            }}>
                              {post.category}
                            </Tag>
                          </div>
                          <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 100%)',
                            pointerEvents: 'none'
                          }} />
                        </div>
                        <div style={{ padding: 32, display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <CalendarOutlined /> {post.date}
                            </span>
                            <span style={{ height: 4, width: 4, background: '#cbd5e1', borderRadius: '50%' }} />
                            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <ClockCircleOutlined /> {post.readTime}
                            </span>
                          </div>
                          
                          <h3 style={{ 
                            fontSize: 22, fontWeight: 800, color: '#0f172a', 
                            lineHeight: 1.3, marginBottom: 16, flex: 1,
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                            transition: 'color 0.3s'
                          }}
                          className="post-title"
                          >
                            {post.title}
                          </h3>
                          
                          <p style={{ 
                            fontSize: 15, color: '#64748b', lineHeight: 1.7, marginBottom: 24,
                            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                          }}>
                            {post.excerpt}
                          </p>
                          
                          <Divider style={{ margin: '0 0 20px' }} />
                          
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <Avatar size={36} src={post.authorAvatar} icon={<UserOutlined />} style={{ background: '#16a34a', border: '2px solid #f0fdf4' }} />
                              <span style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>{post.author}</span>
                            </div>
                            <div style={{ fontSize: 13, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                              <EyeOutlined style={{ color: '#16a34a' }} /> {post.views.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .post-title:hover {
          color: #16a34a !important;
        }
      `}</style>
    </div>
  );
};

export default BlogListPage;
