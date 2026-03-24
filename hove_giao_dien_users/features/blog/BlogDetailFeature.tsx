import { useState, useEffect } from 'react';
import { Card, Tag, Avatar, Button, Divider, Row, Col, Spin, Empty, message, Breadcrumb } from 'antd';
import {
  ClockCircleOutlined,
  EyeOutlined,
  UserOutlined,
  HeartOutlined,
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  GlobalOutlined,
  BankOutlined,
  HomeOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { blogApi } from '@/lib/blogApi';
import { companyBlogApi } from '@/lib/companyBlogApi';

interface BlogDetailFeatureProps {
  postId: string;
}

// Finalized premium design
export const BlogDetailFeature = ({ postId }: BlogDetailFeatureProps) => {
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPost();
    loadRelatedPosts();
  }, [postId]);

  const loadPost = async () => {
    setLoading(true);
    try {
      let response;
      
      // Check if this is a company blog (starts with "company_")
      if (postId.startsWith('company_')) {
        const companyBlogId = parseInt(postId.replace('company_', ''));
        const companyBlog = await companyBlogApi.getBlog(companyBlogId);
        
        // Transform company blog to match platform blog format
        response = {
          id: `company_${companyBlog.id}`,
          title: companyBlog.title,
          content: companyBlog.content,
          author: companyBlog.authorName,
          authorAvatar: null,
          category: 'Công ty',
          image: companyBlog.imageUrl,
          date: companyBlog.createdAt ? new Date(companyBlog.createdAt).toLocaleDateString('vi-VN') : '',
          readTime: '5 phút đọc',
          views: companyBlog.views || 0,
          source: 'company',
          tags: [],
        };
      } else {
        // Platform blog - ensure ID is numeric to avoid 400 error from backend (Long expected)
        const numericId = postId.trim();
        if (!/^\d+$/.test(numericId)) {
          console.warn('Invalid platform blog ID format:', numericId);
          message.error('Mã bài viết không đúng định dạng');
          setPost(null);
          setLoading(false);
          return;
        }

        try {
          response = await blogApi.getBlogById(numericId);
        } catch (error: any) {
          // If platform blog not found, show appropriate message
          if (error.response?.status === 404 || error.response?.status === 500 || error.response?.status === 400) {
            message.error('Bài viết không tồn tại hoặc đã bị xóa');
            setPost(null);
            setLoading(false);
            return;
          }
          throw error;
        }
      }
      
      setPost(response);
    } catch (error: any) {
      console.error('Load blog post error:', error);
      if (error.response?.status === 404) {
        message.error('Không tìm thấy bài viết');
      } else {
        message.error('Không thể tải bài viết');
      }
      setPost(null);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedPosts = async () => {
    try {
      // Get both platform blogs and company blogs
      const [platformBlogs, companyBlogs] = await Promise.all([
        blogApi.getAllBlogs().catch(() => []),
        companyBlogApi.getAllBlogs().catch(() => [])
      ]);
      
      // Transform company blogs to match platform blog format
      const transformedCompanyBlogs = companyBlogs.map((blog: any) => ({
        id: `company_${blog.id}`,
        title: blog.title,
        excerpt: blog.content?.substring(0, 150) + '...',
        content: blog.content,
        author: blog.authorName,
        authorAvatar: null,
        category: 'Công ty',
        image: blog.imageUrl,
        date: blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('vi-VN') : '',
        readTime: '5 phút đọc',
        views: blog.views || 0,
        source: 'company',
        tags: [],
      }));
      
      // Combine all blogs
      const allBlogs = [...platformBlogs, ...transformedCompanyBlogs];
      
      // Filter out current post and get random related posts
      const filtered = allBlogs.filter((p: any) => p.id !== postId);
      const shuffled = filtered.sort(() => 0.5 - Math.random());
      setRelatedPosts(shuffled.slice(0, 3));
    } catch (error) {
      console.error('Load related posts error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Spin size="large" />
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <Empty description="Không tìm thấy bài viết" />
        <Button onClick={() => router.push('/blog')} style={{ marginTop: 24 }}>
          Quay lại Blog
        </Button>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Premium Hero Section */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: '60vh', 
        minHeight: '400px',
        overflow: 'hidden'
      }}>
        {post.image ? (
          <img 
            src={post.image} 
            alt={post.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        ) : (
          <div style={{ 
            width: '100%', height: '100%', 
            background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)' 
          }} />
        )}
        
        {/* Modern Overlay */}
        <div style={{ 
          position: 'absolute', inset: 0, 
          background: 'linear-gradient(to top, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.4) 50%, transparent 100%)' 
        }} />
        
        {/* Navigation Overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', padding: '32px 24px 0', zIndex: 20 }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Breadcrumb
              items={[
                { title: <Link href="/" style={{ color: 'rgba(255,255,255,0.8)' }}><HomeOutlined /> Trang chủ</Link> },
                { title: <Link href="/blog" style={{ color: 'rgba(255,255,255,0.8)' }}><GlobalOutlined /> Blog</Link> },
                { title: <span style={{ color: '#fff', fontWeight: 600 }}>Chi tiết</span> },
              ]}
            />
            <Button
              type="text"
              onClick={() => router.push('/blog')}
              style={{ color: '#fff', background: 'rgba(255,255,255,0.1)', borderRadius: 100, backdropFilter: 'blur(8px)' }}
            >
              ← Quay lại Blog
            </Button>
          </div>
        </div>

        {/* Hero Title Container */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '0 24px 100px', zIndex: 10 }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <Tag 
                style={{ 
                  background: '#16a34a', color: '#fff', border: 'none', 
                  borderRadius: 100, padding: '4px 16px', fontWeight: 700 
                }}
              >
                {post.category}
              </Tag>
              <Tag 
                style={{ 
                  background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', 
                  borderRadius: 100, padding: '4px 16px', backdropFilter: 'blur(4px)' 
                }}
              >
                {post.source === 'platform' ? 'Hệ thống' : 'Công ty'}
              </Tag>
            </div>
            
            <h1 style={{ 
              fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, color: '#fff', 
              lineHeight: 1.2, marginBottom: 24, textShadow: '0 4px 20px rgba(0,0,0,0.3)' 
            }}>
              {post.title}
            </h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Avatar 
                size={48} 
                src={post.authorAvatar} 
                icon={<UserOutlined />} 
                style={{ border: '2px solid rgba(255,255,255,0.4)', background: '#16a34a' }}
              />
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{post.author}</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CalendarOutlined style={{ fontSize: 12 }} />
                  {post.date}
                  <span style={{ margin: '0 4px' }}>·</span>
                  <EyeOutlined style={{ fontSize: 12 }} />
                  {post.views.toLocaleString()} lượt xem
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
        {/* Main Content Card */}
        <div style={{ 
          background: '#fff', borderRadius: 32, padding: '48px', 
          marginTop: -60, position: 'relative', zIndex: 30,
          boxShadow: '0 20px 50px rgba(15,23,42,0.08)',
          border: '1px solid #f1f5f9'
        }}>
          {/* Article Reading Time & Progress Marker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, color: '#64748b', fontSize: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ClockCircleOutlined style={{ color: '#16a34a' }} />
              <span>{post.readTime || '5 phút đọc'}</span>
            </div>
            <div style={{ height: 4, width: 4, background: '#cbd5e1', borderRadius: '50%' }} />
            <div style={{ color: '#16a34a', fontWeight: 600 }}>Kiến thức & Kinh nghiệm</div>
          </div>

          <div 
            style={{ 
              fontSize: 18, lineHeight: 1.8, color: '#334155', 
              whiteSpace: 'pre-line' 
            }}
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }}
          />

          <Divider style={{ margin: '48px 0' }} />

          {/* Tags Section */}
          {post.tags && post.tags.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Chủ đề liên quan
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {post.tags.map((tag: string, index: number) => (
                  <span 
                    key={index}
                    style={{ 
                      padding: '8px 20px', background: '#f8fafc', borderRadius: 12, 
                      fontSize: 14, color: '#475569', fontWeight: 600, border: '1px solid #f1f5f9',
                      cursor: 'pointer', transition: 'all 0.2s ease'
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Shared Action Section */}
          <div style={{ 
            background: '#f0fdf4', borderRadius: 24, padding: '32px', 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            border: '1px solid #dcfce7'
          }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#166534', marginBottom: 4 }}>Chia sẻ bài viết</div>
              <p style={{ color: '#15803d', margin: 0 }}>Giúp bạn bè và đồng nghiệp cùng cập nhật kiến thức mới.</p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Button shape="circle" icon={<FacebookOutlined />} size="large" style={{ background: '#1877f2', color: '#fff', border: 'none' }} />
              <Button shape="circle" icon={<TwitterOutlined />} size="large" style={{ background: '#1da1f2', color: '#fff', border: 'none' }} />
              <Button shape="circle" icon={<LinkedinOutlined />} size="large" style={{ background: '#0a66c2', color: '#fff', border: 'none' }} />
            </div>
          </div>
        </div>

        {/* Related articles section */}
        {relatedPosts.length > 0 && (
          <div style={{ marginTop: 80, paddingBottom: 100 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
                  Bài viết liên quan
                </h2>
                <div style={{ height: 4, width: 48, background: '#16a34a', borderRadius: 4 }}></div>
              </div>
              <Link href="/blog" style={{ color: '#16a34a', fontWeight: 700, fontSize: 15 }}>
                Xem tất cả →
              </Link>
            </div>

            <Row gutter={[24, 24]}>
              {relatedPosts.map((relatedPost) => (
                <Col key={relatedPost.id} xs={24} md={8}>
                  <div
                    onClick={() => router.push(`/blog/${relatedPost.id}`)}
                    style={{ 
                      background: '#fff', borderRadius: 24, overflow: 'hidden', 
                      height: '100%', border: '1px solid #f1f5f9', cursor: 'pointer',
                      transition: 'all 0.3s ease', boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ height: 180, overflow: 'hidden' }}>
                      <img 
                        src={relatedPost.image || 'https://via.placeholder.com/400x200/f8fafc/64748b?text=Knowledge'} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </div>
                    <div style={{ padding: 20 }}>
                      <Tag style={{ background: '#f0fdf4', color: '#16a34a', border: 'none', borderRadius: 100, marginBottom: 12, fontSize: 10 }}>
                        {relatedPost.category}
                      </Tag>
                      <h3 style={{ 
                        fontSize: 16, fontWeight: 700, color: '#0f172a', 
                        lineHeight: 1.4, marginBottom: 8,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                      }}>
                        {relatedPost.title}
                      </h3>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{relatedPost.date}</div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </div>
    </div>
  );
};
