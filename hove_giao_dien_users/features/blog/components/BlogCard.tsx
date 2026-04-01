import { Card, Tag, Avatar, Divider } from 'antd';
import { ClockCircleOutlined, EyeOutlined, UserOutlined, RightOutlined } from '@ant-design/icons';
import Link from 'next/link';
import type { BlogPost } from '@/store/useBlogStore';

interface BlogCardProps {
  post: BlogPost;
  size?: 'default' | 'large';
}

export const BlogCard = ({ post, size = 'default' }: BlogCardProps) => {
  const isLarge = size === 'large';
  const imageHeight = isLarge ? 280 : 220;
  const titleSize = isLarge ? 22 : 18;
  const excerptLines = isLarge ? 4 : 3;

  return (
    <Link href={`/blog/${post.id}`} style={{ textDecoration: 'none' }}>
      <Card
        hoverable
        style={{
          height: '100%',
          borderRadius: 32,
          border: '1px solid #f1f5f9',
          overflow: 'hidden',
          transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
          boxShadow: '0 4px 20px rgba(15,23,42,0.02)',
          background: '#fff',
        }}
        styles={{ body: { padding: 0 } }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = 'translateY(-10px)';
          el.style.boxShadow = '0 30px 60px rgba(15,23,42,0.1)';
          el.style.borderColor = '#dcfce7';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = 'translateY(0)';
          el.style.boxShadow = '0 4px 20px rgba(15,23,42,0.02)';
          el.style.borderColor = '#f1f5f9';
        }}
        cover={
          <div style={{ position: 'relative', height: imageHeight, overflow: 'hidden' }}>
            <img
              src={post.image || 'https://via.placeholder.com/600x400/f8fafc/64748b?text=Knowledge Experience'}
              alt={post.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.8s ease',
              }}
            />
            
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(15,23,42,0.4) 0%, transparent 40%)',
              pointerEvents: 'none'
            }} />

            <div style={{
              position: 'absolute',
              top: 20,
              left: 20,
              zIndex: 2,
            }}>
              <Tag style={{
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(8px)',
                color: '#16a34a',
                fontSize: 11,
                fontWeight: 800,
                borderRadius: 100,
                padding: '4px 14px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                {post.category?.toUpperCase()}
              </Tag>
            </div>

            <div style={{
              position: 'absolute',
              bottom: 20,
              right: 20,
              zIndex: 2,
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: '#fff',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 10px 25px rgba(22,163,74,0.2)',
              color: '#16a34a'
            }}>
              <RightOutlined style={{ fontSize: 16 }} />
            </div>
          </div>
        }
      >
        <div style={{ padding: 28, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 12,
            color: '#94a3b8',
            marginBottom: 16,
            fontWeight: 600
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ClockCircleOutlined style={{ color: '#16a34a' }} />
              {post.readTime}
            </span>
            <span style={{ height: 4, width: 4, background: '#cbd5e1', borderRadius: '50%' }} />
            <span>{post.date}</span>
          </div>

          <h3 style={{
            fontSize: titleSize,
            fontWeight: 850,
            color: '#0f172a',
            marginBottom: 14,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            letterSpacing: '-0.01em'
          }}>
            {post.title}
          </h3>

          <p style={{
            fontSize: 14,
            color: '#64748b',
            marginBottom: 24,
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: excerptLines,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {post.excerpt}
          </p>

          <Divider style={{ margin: '0 0 20px' }} />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar
                src={post.authorAvatar}
                icon={<UserOutlined />}
                size={32}
                style={{ background: '#16a34a', border: '2px solid #f0fdf4' }}
              />
              <span style={{ fontSize: 13, color: '#334155', fontWeight: 800 }}>
                {post.author}
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <EyeOutlined style={{ color: '#16a34a' }} /> {post.views}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
