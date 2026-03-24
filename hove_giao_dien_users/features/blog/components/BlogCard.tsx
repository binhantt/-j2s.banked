import { Card, Tag, Avatar } from 'antd';
import { ClockCircleOutlined, EyeOutlined, UserOutlined, RightOutlined } from '@ant-design/icons';
import Link from 'next/link';
import type { BlogPost } from '@/store/useBlogStore';

interface BlogCardProps {
  post: BlogPost;
  size?: 'default' | 'large';
}

export const BlogCard = ({ post, size = 'default' }: BlogCardProps) => {
  const isLarge = size === 'large';
  const imageHeight = isLarge ? 260 : 192;
  const titleSize = isLarge ? 18 : 15;
  const excerptLines = isLarge ? 4 : 3;

  return (
    <Link href={`/blog/${post.id}`} style={{ textDecoration: 'none' }}>
      <Card
        hoverable
        style={{
          height: '100%',
          borderRadius: 16,
          border: '1px solid #e8edf3',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
        styles={{
          body: { padding: 0 }
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = 'translateY(-4px)';
          el.style.boxShadow = '0 12px 32px rgba(22,163,74,0.12)';
          el.style.borderColor = '#16a34a';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = 'translateY(0)';
          el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
          el.style.borderColor = '#e8edf3';
        }}
        cover={
          <div style={{ position: 'relative', height: imageHeight, overflow: 'hidden' }}>
            {/* Gradient overlay khi hover */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: post.image
                ? 'linear-gradient(180deg, transparent 50%, rgba(22,163,74,0.08) 100%)'
                : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              zIndex: 1,
              transition: 'opacity 0.3s',
              opacity: 0,
            }} />

            <img
              src={post.image}
              alt={post.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.4s ease',
              }}
            />

            {/* Category badge */}
            <div style={{
              position: 'absolute',
              top: 14,
              left: 14,
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 100,
              background: 'rgba(22,163,74,0.92)',
              backdropFilter: 'blur(8px)',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', opacity: 0.8 }} />
              {post.category}
            </div>

            {/* Arrow icon on hover */}
            <div style={{
              position: 'absolute',
              bottom: 14,
              right: 14,
              zIndex: 2,
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#fff',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              opacity: 0,
              transform: 'translateX(8px)',
              transition: 'all 0.3s ease',
            }}>
              <RightOutlined style={{ color: '#16a34a', fontSize: 14 }} />
            </div>
          </div>
        }
      >
        <div style={{ padding: isLarge ? 24 : 18 }}>
          {/* Title */}
          <h3 style={{
            fontSize: titleSize,
            fontWeight: 700,
            color: '#0b1220',
            marginBottom: 10,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            transition: 'color 0.2s',
          }}>
            {post.title}
          </h3>

          {/* Excerpt */}
          <p style={{
            fontSize: 13,
            color: '#64748b',
            marginBottom: 16,
            lineHeight: 1.7,
            display: '-webkit-box',
            WebkitLineClamp: excerptLines,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {post.excerpt}
          </p>

          {/* Stats row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontSize: 12,
            color: '#94a3b8',
            marginBottom: 14,
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <ClockCircleOutlined style={{ color: '#16a34a', fontSize: 12 }} />
              {post.readTime}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <EyeOutlined style={{ color: '#16a34a', fontSize: 12 }} />
              {post.views} lượt xem
            </span>
            <span>{post.date}</span>
          </div>

          {/* Author + Tags */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 14,
            borderTop: '1px solid #f0fdf4',
            flexWrap: 'wrap',
            gap: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar
                src={post.authorAvatar}
                icon={<UserOutlined />}
                size={28}
                style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)', flexShrink: 0 }}
              />
              <span style={{ fontSize: 13, color: '#374151', fontWeight: 500, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {post.author}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {post.tags.slice(0, 2).map((tag, index) => (
                <Tag
                  key={index}
                  style={{
                    fontSize: 11,
                    margin: 0,
                    borderRadius: 4,
                    border: '1px solid #dcfce7',
                    color: '#16a34a',
                    background: '#f0fdf4',
                    padding: '0 6px',
                  }}
                >
                  #{tag}
                </Tag>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
