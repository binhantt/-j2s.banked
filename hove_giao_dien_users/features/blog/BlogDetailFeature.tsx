import { useState, useEffect } from 'react';
import { Card, Tag, Avatar, Button, Divider, Row, Col, Spin, Empty, message, Breadcrumb } from 'antd';
import {
  ClockCircleOutlined,
  EyeOutlined,
  UserOutlined,
  FacebookOutlined,
  InstagramOutlined,
  GlobalOutlined,
  HomeOutlined,
  CalendarOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { blogApi } from '@/lib/blogApi';
import { companyBlogApi } from '@/lib/companyBlogApi';

interface BlogDetailFeatureProps {
  postId: string;
}

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
      if (postId.startsWith('company_')) {
        // Use new endpoint that handles company_X format
        const companyBlog = await companyBlogApi.getBlogByRef(postId);
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
          facebookLink: companyBlog.facebookLink,
          instagramLink: companyBlog.instagramLink,
          zaloLink: companyBlog.zaloLink
        };
      } else {
        const numericId = postId.trim();
        if (!/^\d+$/.test(numericId)) {
          message.error('Mã bài viết không đúng định dạng');
          setPost(null);
          setLoading(false);
          return;
        }
        response = await blogApi.getBlogById(numericId);
      }
      setPost(response);
    } catch (error: any) {
      console.error('Load blog post error:', error);
      message.error('Không thể tải bài viết');
      setPost(null);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedPosts = async () => {
    try {
      const [platformBlogs, companyBlogs] = await Promise.all([
        blogApi.getAllBlogs().catch(() => []),
        companyBlogApi.getAllBlogs().catch(() => [])
      ]);
      const transformedCompanyBlogs = companyBlogs.map((blog: any) => ({
        id: `company_${blog.id}`,
        title: blog.title,
        excerpt: blog.content?.substring(0, 150) + '...',
        author: blog.authorName,
        category: 'Công ty',
        image: blog.imageUrl,
        date: blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('vi-VN') : '',
        readTime: '5 phút đọc',
        views: blog.views || 0,
        source: 'company',
      }));
      const allBlogs = [...platformBlogs, ...transformedCompanyBlogs];
      const filtered = allBlogs.filter((p: any) => p.id !== postId);
      setRelatedPosts(filtered.sort(() => 0.5 - Math.random()).slice(0, 3));
    } catch (error) {
      console.error('Load related posts error:', error);
    }
  };

  if (loading) return <div style={{ padding: 100, textAlign: 'center' }}><Spin size="large" /></div>;
  if (!post) return <div style={{ padding: 100, textAlign: 'center' }}><Empty description="Không tìm thấy bài viết" /><Button onClick={() => router.push('/blog')}>Quay lại Blog</Button></div>;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 100 }}>
      {/* Premium Hero with Parallax-like effect */}
      <div style={{ position: 'relative', height: '70vh', minHeight: 500, overflow: 'hidden' }}>
        <img 
          src={post.image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=2000'} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.95), rgba(15,23,42,0.4), transparent)' }} />
        
        <div style={{ position: 'absolute', top: 40, left: 0, width: '100%', zIndex: 10 }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between' }}>
            <Breadcrumb items={[
              { title: <Link href="/" style={{ color: 'rgba(255,255,255,0.7)' }}><HomeOutlined /> Trang chủ</Link> },
              { title: <Link href="/blog" style={{ color: 'rgba(255,255,255,0.7)' }}>Blog</Link> },
              { title: <span style={{ color: '#fff', fontWeight: 700 }}>Bài viết</span> },
            ]} />
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => router.push('/blog')}
              style={{ color: '#fff', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: 100 }}
            >
              Quay lại danh sách
            </Button>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 60, left: 0, width: '100%', zIndex: 5 }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
            <Tag color="#16a34a" style={{ borderRadius: 100, padding: '4px 20px', fontWeight: 700, marginBottom: 24, border: 'none' }}>
              {post.category}
            </Tag>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 900, color: '#fff', marginBottom: 32, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              {post.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <Avatar size={64} src={post.authorAvatar} icon={<UserOutlined />} style={{ background: '#16a34a', border: '3px solid rgba(255,255,255,0.3)' }} />
              <div>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>{post.author}</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, display: 'flex', gap: 12 }}>
                  <span><CalendarOutlined /> {post.date}</span>
                  <span><ClockCircleOutlined /> {post.readTime}</span>
                  <span><EyeOutlined /> {post.views.toLocaleString()} lượt xem</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '-60px auto 0', padding: '0 24px', position: 'relative', zIndex: 20 }}>
        <div style={{ background: '#fff', borderRadius: 40, padding: '60px', boxShadow: '0 40px 100px rgba(15,23,42,0.1)', border: '1px solid #f1f5f9' }}>
          
          <div 
            className="premium-blog-content"
            style={{ fontSize: 18, lineHeight: 1.9, color: '#334155', whiteSpace: 'pre-line' }}
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }}
          />

          <Divider style={{ margin: '60px 0' }} />

          {/* Combined Social & Author Profile Premium Section */}
          <div style={{ 
            background: '#f0fdf4', borderRadius: 32, padding: '48px', 
            border: '1px solid #dcfce7', textAlign: 'center'
          }}>
            <h3 style={{ fontSize: 24, fontWeight: 900, color: '#166534', marginBottom: 12 }}>
              Bạn thấy bài viết này hữu ích?
            </h3>
            <p style={{ fontSize: 16, color: '#15803d', marginBottom: 32, maxWidth: 600, margin: '0 auto 32px' }}>
              Đừng quên theo dõi {post.author} trên các mạng xã hội để không bỏ lỡ những kiến thức chuyên sâu và cập nhật mới nhất.
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
              {post.facebookLink && (
                <Button 
                  size="large" icon={<FacebookOutlined />} 
                  href={post.facebookLink} target="_blank"
                  style={{ background: '#1877f2', color: '#fff', border: 'none', borderRadius: 12, height: 48, padding: '0 24px', fontWeight: 700 }}
                >
                  Facebook
                </Button>
              )}
              {post.instagramLink && (
                <Button 
                  size="large" icon={<InstagramOutlined />} 
                  href={post.instagramLink} target="_blank"
                  style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#fff', border: 'none', borderRadius: 12, height: 48, padding: '0 24px', fontWeight: 700 }}
                >
                  Instagram
                </Button>
              )}
              {post.zaloLink && (
                <Button 
                  size="large"
                  href={post.zaloLink} target="_blank"
                  style={{ background: '#0068ff', color: '#fff', border: 'none', borderRadius: 12, height: 48, padding: '0 24px', fontWeight: 700 }}
                >
                  Zalo Connect
                </Button>
              )}
              {!post.facebookLink && !post.instagramLink && !post.zaloLink && (
                <Button 
                  size="large" icon={<FacebookOutlined />}
                  style={{ background: '#1877f2', color: '#fff', border: 'none', borderRadius: 12, height: 48, padding: '0 24px', fontWeight: 700 }}
                >
                  Chia sẻ Facebook
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div style={{ marginTop: 80 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
              <div>
                <h2 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>Bài viết tương tự</h2>
                <div style={{ height: 4, width: 60, background: '#16a34a', borderRadius: 100 }} />
              </div>
              <Link href="/blog" style={{ color: '#16a34a', fontWeight: 800, fontSize: 16 }}>Xem thêm chuyên mục →</Link>
            </div>
            <Row gutter={[32, 32]}>
              {relatedPosts.map(p => (
                <Col key={p.id} xs={24} md={8}>
                  <div 
                    onClick={() => router.push(`/blog/${p.id}`)}
                    style={{ background: '#fff', borderRadius: 24, overflow: 'hidden', height: '100%', border: '1px solid #f1f5f9', cursor: 'pointer', transition: 'all 0.3s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.borderColor = '#16a34a'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
                  >
                    <div style={{ height: 200, overflow: 'hidden' }}>
                      <img src={p.image || 'https://via.placeholder.com/400x200'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: 24 }}>
                      <Tag color="#f0fdf4" style={{ color: '#16a34a', border: 'none', fontWeight: 700, marginBottom: 12 }}>{p.category}</Tag>
                      <h4 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', lineHeight: 1.4, marginBottom: 12 }}>{p.title}</h4>
                      <div style={{ fontSize: 13, color: '#94a3b8' }}>{p.date} · <EyeOutlined /> {p.views}</div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </div>

      <style jsx global>{`
        .premium-blog-content b, .premium-blog-content strong {
          font-weight: 800;
          color: #0f172a;
        }
        .premium-blog-content i, .premium-blog-content em {
          font-style: italic;
          color: #475569;
        }
        .premium-blog-content a {
          color: #16a34a;
          text-decoration: underline;
          font-weight: 700;
        }
        .premium-blog-content h1, .premium-blog-content h2, .premium-blog-content h3 {
          color: #0f172a;
          font-weight: 900;
          margin-top: 40px;
          margin-bottom: 20px;
          line-height: 1.2;
        }
        .premium-blog-content blockquote {
          border-left: 5px solid #16a34a;
          padding-left: 24px;
          margin: 32px 0;
          font-style: italic;
          color: #475569;
          font-size: 20px;
          background: #f0fdf4;
          padding: 32px 40px;
          border-radius: 0 24px 24px 0;
        }
        .premium-blog-content code {
          background: #f0fdf4;
          color: #16a34a;
          padding: 4px 10px;
          border-radius: 8px;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 0.9em;
          font-weight: 600;
        }
        .premium-blog-content pre {
          background: #0f172a;
          padding: 32px;
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          overflow-x: auto;
          margin: 32px 0;
        }
        .premium-blog-content pre code {
          background: transparent;
          color: #e2e8f0;
          padding: 0;
          font-weight: 400;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
};
