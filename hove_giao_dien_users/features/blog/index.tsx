import { useState } from 'react';
import { Input, Select, Row, Col, Spin, Empty } from 'antd';
import { SearchOutlined, BookOutlined, FireOutlined, MessageOutlined, GlobalOutlined } from '@ant-design/icons';
import { useBlogStore } from '@/store/useBlogStore';
import { BlogCard } from './components/BlogCard';
import { CompanyBlogSection } from './components/CompanyBlogSection';
import { api } from '@/lib/api';

const categories = [
  { value: 'all', label: 'Tất cả' },
  { value: 'Kỹ năng', label: 'Kỹ năng' },
  { value: 'Nghề nghiệp', label: 'Nghề nghiệp' },
  { value: 'Công nghệ', label: 'Công nghệ' },
  { value: 'Phỏng vấn', label: 'Phỏng vấn' },
  { value: 'Lối sống', label: 'Lối sống' },
  { value: 'Lương thưởng', label: 'Lương thưởng' },
];

const trendingTopics = [
  { label: 'React Developer', icon: '⚛️' },
  { label: 'Remote Work', icon: '🏠' },
  { label: 'AI & ChatGPT', icon: '🤖' },
  { label: 'Salary Review', icon: '💰' },
  { label: 'Interview Tips', icon: '🎯' },
  { label: 'Freelance', icon: '💻' },
];

export const BlogFeature = () => {
  const { searchQuery, selectedCategory, setSearchQuery, setSelectedCategory } = useBlogStore();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <div style={{ background: '#f3f6fb', minHeight: '100vh' }}>
      {/* ============ HERO BANNER ============ */}
      <div style={{
        background: 'linear-gradient(135deg, #0b1220 0%, #0f1a0f 40%, #14532d 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative glows */}
        <div style={{
          position: 'absolute', top: '-80px', left: '-80px',
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(22,163,74,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', right: '10%',
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(22,163,74,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '64px 24px 56px',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Breadcrumb */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 20,
            fontSize: 13,
            color: '#64748b',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <BookOutlined style={{ color: '#16a34a' }} />
              Trang chủ
            </span>
            <span>/</span>
            <span style={{ color: '#16a34a', fontWeight: 600 }}>Blog</span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 800,
            color: '#ffffff',
            marginBottom: 16,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
          }}>
            Blog & Cẩm nang nghề nghiệp
          </h1>
          <p style={{
            fontSize: 16,
            color: '#94a3b8',
            marginBottom: 36,
            maxWidth: 560,
            lineHeight: 1.7,
          }}>
            Cập nhật xu hướng việc làm, mẹo phỏng vấn và câu chuyện thành công từ các chuyên gia hàng đầu.
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginBottom: 32 }}>
            {[
              { number: '200+', label: 'Bài viết', icon: <BookOutlined /> },
              { number: '50K+', label: 'Lượt đọc', icon: <FireOutlined /> },
              { number: '30+', label: 'Chủ đề', icon: <GlobalOutlined /> },
            ].map((stat) => (
              <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 40, height: 40,
                  borderRadius: 10,
                  background: 'rgba(22,163,74,0.15)',
                  border: '1px solid rgba(22,163,74,0.25)',
                  display: 'grid',
                  placeItems: 'center',
                }}>
                  <span style={{ color: '#16a34a', fontSize: 18 }}>{stat.icon}</span>
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{stat.number}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============ MAIN CONTENT ============ */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
        <Row gutter={[32, 40]}>
          {/* ============ LEFT SIDEBAR ============ */}
          <Col xs={24} lg={6}>
            {/* Search */}
            <div style={{
              background: '#fff',
              borderRadius: 16,
              padding: 24,
              border: '1px solid #e8edf3',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              marginBottom: 20,
            }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#0b1220', marginBottom: 14 }}>
                Tìm kiếm
              </div>
              <Input
                size="large"
                placeholder="Từ khóa bài viết..."
                prefix={<SearchOutlined style={{ color: '#16a34a' }} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ borderRadius: 10 }}
              />
            </div>

            {/* Categories */}
            <div style={{
              background: '#fff',
              borderRadius: 16,
              padding: 24,
              border: '1px solid #e8edf3',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              marginBottom: 20,
            }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#0b1220', marginBottom: 16 }}>
                Danh mục
              </div>
              <Select
                size="large"
                value={selectedCategory}
                onChange={setSelectedCategory}
                options={categories}
                style={{ width: '100%', borderRadius: 10 }}
              />
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {categories.filter(c => c.value !== 'all').map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: selectedCategory === cat.value
                        ? '1.5px solid #16a34a'
                        : '1.5px solid #e8edf3',
                      background: selectedCategory === cat.value ? '#f0fdf4' : '#fff',
                      cursor: 'pointer',
                      fontSize: 14,
                      color: selectedCategory === cat.value ? '#16a34a' : '#374151',
                      fontWeight: selectedCategory === cat.value ? 600 : 400,
                      transition: 'all 0.2s',
                      textAlign: 'left',
                    }}
                  >
                    {cat.label}
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>→</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Trending Topics */}
            <div style={{
              background: 'linear-gradient(135deg, #0b1220, #0f1a0f)',
              borderRadius: 16,
              padding: 24,
              border: '1px solid rgba(22,163,74,0.2)',
              marginBottom: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <FireOutlined style={{ color: '#16a34a', fontSize: 18 }} />
                <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>
                  Chủ đề thịnh hành
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {trendingTopics.map((topic) => (
                  <button
                    key={topic.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      borderRadius: 100,
                      border: '1px solid rgba(22,163,74,0.3)',
                      background: 'rgba(22,163,74,0.08)',
                      cursor: 'pointer',
                      fontSize: 13,
                      color: '#86efac',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = 'rgba(22,163,74,0.18)';
                      el.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = 'rgba(22,163,74,0.08)';
                      el.style.color = '#86efac';
                    }}
                  >
                    <span>{topic.icon}</span>
                    {topic.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div style={{
              background: 'linear-gradient(135deg, #16a34a, #22c55e)',
              borderRadius: 16,
              padding: 24,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📬</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 8 }}>
                Nhận bài viết mới
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 16, lineHeight: 1.6 }}>
                Đăng ký để nhận tin mới nhất mỗi tuần
              </div>
              <button style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: 10,
                border: 'none',
                background: '#fff',
                color: '#16a34a',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
                Đăng ký ngay
              </button>
            </div>
          </Col>

          {/* ============ RIGHT CONTENT ============ */}
          <Col xs={24} lg={18}>
            {/* Section header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 8, height: 32,
                  borderRadius: 4,
                  background: 'linear-gradient(180deg, #16a34a, #22c55e)',
                }} />
                <h2 style={{
                  fontSize: 22, fontWeight: 800, color: '#0b1220', margin: 0,
                }}>
                  Bài viết mới nhất
                </h2>
              </div>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>
                Sắp xếp: <span style={{ color: '#16a34a', fontWeight: 600 }}>Mới nhất</span>
              </span>
            </div>

            {/* Blog Grid */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <Spin size="large" />
              </div>
            ) : posts.length === 0 ? (
              <div style={{
                background: '#fff',
                borderRadius: 16,
                padding: 60,
                textAlign: 'center',
                border: '1px solid #e8edf3',
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Chưa có bài viết nào
                </div>
                <div style={{ fontSize: 14, color: '#94a3b8' }}>
                  Hãy là người đầu tiên đăng bài viết!
                </div>
              </div>
            ) : (
              <Row gutter={[20, 20]}>
                {posts.slice(0, 3).map((post) => (
                  <Col xs={24} md={12} xl={8} key={post.id}>
                    <BlogCard post={post} size="large" />
                  </Col>
                ))}
                {posts.slice(3).map((post) => (
                  <Col xs={24} sm={12} lg={8} key={post.id}>
                    <BlogCard post={post} />
                  </Col>
                ))}
              </Row>
            )}

            {/* Blog nhà tuyển dụng */}
            <div style={{ marginTop: 56 }}>
              <CompanyBlogSection />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};
