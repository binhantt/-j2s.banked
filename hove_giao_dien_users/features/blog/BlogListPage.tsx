import { useState, useEffect } from 'react';
import { Input, Tag, Card, Row, Col, Spin, Avatar } from 'antd';
import { SearchOutlined, EyeOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { companyBlogApi, CompanyBlog } from '@/lib/companyBlogApi';

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
  const [blogs, setBlogs] = useState<CompanyBlog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<CompanyBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    loadBlogs();
  }, []);

  useEffect(() => {
    filterBlogs();
  }, [searchText, selectedCategory, blogs]);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const response = await companyBlogApi.getAllBlogs();
      // Only show published blogs
      const published = response.filter((blog: CompanyBlog) => blog.status === 'published');
      setBlogs(published);
      setFilteredBlogs(published);
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
        blog.content?.toLowerCase().includes(searchLower)
      );
    }

    if (selectedCategory) {
      // Filter by category if you have category field
      // filtered = filtered.filter(blog => blog.category === selectedCategory);
    }

    setFilteredBlogs(filtered);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Hôm nay';
    if (days === 1) return '1 ngày trước';
    if (days < 30) return `${days} ngày trước`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} tháng trước`;
    return `${Math.floor(months / 12)} năm trước`;
  };

  return (
    <div style={{ background: '#f7f8fa', minHeight: '100vh' }}>
      <div 
        style={{
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
          padding: '60px 0',
          marginBottom: 32,
          width: '100%',
          height : "100%"
        }}
      >
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', padding: '0 24px' }}>
          <div style={{ 
            display: 'inline-block',
            background: '#fef3c7',
            color: '#92400e',
            padding: '6px 16px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            marginBottom: 20,
            letterSpacing: '0.5px',
          }}>
            📚 KHÁM PHÁ KIẾN THỨC MỚI
          </div>
          
          <h1 style={{
            fontSize: 40,
            fontWeight: 700,
            color: '#fff',
            marginBottom: 16,
            lineHeight: 1.2,
          }}>
            Blog & Cẩm nang <span style={{ 
              color: '#22d3ee',
              fontWeight: 800,
            }}>nghề nghiệp</span>
          </h1>
          
          <p style={{
            fontSize: 15,
            color: '#cbd5e1',
            marginBottom: 36,
            lineHeight: 1.6,
          }}>
            Chia sẻ kinh nghiệm, kiến thức chuyên môn và cập nhật xu hướng mới nhất trong thế giới công việc
          </p>
          
          <Search
            placeholder="Tìm kiếm bài viết, chủ đề bạn quan tâm..."
            allowClear
            enterButton="Tìm kiếm"
            size="large"
            onSearch={handleSearch}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 550, width: '100%' }}
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
          />
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 48px' }}>
        {/* Category Filter */}
        <div 
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: '24px 28px',
            border: '1px solid #e5e7eb',
            marginBottom: 32,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 16, letterSpacing: '0.5px' }}>
            CHỦ ĐỀ
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {CATEGORIES.map((cat) => (
              <Tag
                key={cat.value}
                onClick={() => handleCategoryClick(cat.value)}
                style={{
                  cursor: 'pointer',
                  padding: '8px 20px',
                  fontSize: 14,
                  borderRadius: 24,
                  border: selectedCategory === cat.value ? '2px solid #22d3ee' : '1px solid #e5e7eb',
                  background: selectedCategory === cat.value ? '#ecfeff' : '#fff',
                  color: selectedCategory === cat.value ? '#0e7490' : '#64748b',
                  fontWeight: selectedCategory === cat.value ? 600 : 500,
                  transition: 'all 0.2s',
                }}
              >
                {cat.label}
              </Tag>
            ))}
          </div>
        </div>

        {/* Blog List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111827', marginBottom: 4 }}>
                Bài viết mới nhất
              </h2>
              <p style={{ fontSize: 14, color: '#6b7280' }}>
                Tìm thấy {filteredBlogs.length} bài viết
              </p>
            </div>

            {filteredBlogs.length === 0 ? (
              <div 
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  padding: 60,
                  textAlign: 'center',
                  border: '1px solid #e5e7eb',
                }}
              >
                <div style={{ fontSize: 56, marginBottom: 16 }}>📝</div>
                <h3 style={{ fontSize: 20, marginBottom: 8, fontWeight: 600, color: '#111827' }}>
                  Không tìm thấy bài viết
                </h3>
                <p style={{ color: '#6b7280' }}>
                  Thử thay đổi từ khóa tìm kiếm hoặc chủ đề.
                </p>
              </div>
            ) : (
              <Row gutter={[20, 20]}>
                {filteredBlogs.map((blog) => (
                  <Col key={blog.id} xs={24} sm={12} lg={8}>
                    <Card
                      hoverable
                      onClick={() => router.push(`/blogs/${blog.id}`)}
                      cover={
                        blog.imageUrl ? (
                          <div style={{ 
                            height: 200, 
                            overflow: 'hidden',
                            background: '#f3f4f6',
                          }}>
                            <img
                              alt={blog.title}
                              src={blog.imageUrl}
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover',
                              }}
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/400x200/e5e7eb/64748b?text=Blog';
                              }}
                            />
                          </div>
                        ) : (
                          <div style={{ 
                            height: 200, 
                            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 48,
                          }}>
                            📝
                          </div>
                        )
                      }
                      style={{
                        borderRadius: 12,
                        border: '1px solid #e5e7eb',
                        overflow: 'hidden',
                      }}
                      styles={{ body: { padding: 20 } }}
                    >
                      <h3 style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: '#111827',
                        marginBottom: 12,
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {blog.title}
                      </h3>

                      <p style={{
                        fontSize: 14,
                        color: '#6b7280',
                        marginBottom: 16,
                        lineHeight: 1.6,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {blog.content}
                      </p>

                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        paddingTop: 16,
                        borderTop: '1px solid #f3f4f6',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Avatar 
                            size="small" 
                            icon={<UserOutlined />}
                            style={{ background: '#06b6d4' }}
                          />
                          <span style={{ fontSize: 13, color: '#6b7280' }}>
                            {blog.authorName || 'Admin'}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#9ca3af' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <EyeOutlined /> {blog.views || 0}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CalendarOutlined /> {blog.createdAt ? getTimeAgo(blog.createdAt) : 'Mới'}
                          </span>
                        </div>
                      </div>
                    </Card>
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
