import { useEffect, useState } from 'react';
import { Row, Col, Card, Empty, Spin, message } from 'antd';
import { EyeOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { companyBlogApi, type CompanyBlog } from '@/lib/companyBlogApi';
import { useRouter } from 'next/router';

export const CompanyBlogSection = () => {
  const [blogs, setBlogs] = useState<CompanyBlog[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      // Lấy tất cả blog và lọc theo trạng thái đã xuất bản
      const data = await companyBlogApi.getAllBlogs();
      const published = (data || []).filter(
        (blog: CompanyBlog) => blog.status === 'published'
      );
      setBlogs(published);
    } catch (error) {
      console.error('Load company blogs error:', error);
      message.error('Không thể tải blog nhà tuyển dụng');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Spin size="large" />
      </div>
    );
  }

  if (!blogs.length) {
    return (
      <div className="flex justify-center items-center py-10">
        <Empty description="Chưa có blog nhà tuyển dụng" />
      </div>
    );
  }

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Blog nhà tuyển dụng
        </h2>
        <button
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          onClick={() => router.push('/blogs')}
        >
          Xem tất cả
        </button>
      </div>

      <Row gutter={[24, 24]}>
        {blogs.slice(0, 6).map((blog) => (
          <Col xs={24} sm={12} lg={8} key={blog.id}>
            <Card
              hoverable
              onClick={() => router.push(`/blogs/${blog.id}`)}
              cover={
                blog.imageUrl ? (
                  <img
                    src={blog.imageUrl}
                    alt={blog.title}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="h-48 w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl">
                    📝
                  </div>
                )
              }
              className="h-full border border-gray-200 rounded-xl overflow-hidden"
            >
              <Card.Meta
                title={
                  <div className="font-semibold text-gray-900 mb-1 line-clamp-2">
                    {blog.title}
                  </div>
                }
                description={
                  <div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                      {blog.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        <UserOutlined /> {blog.authorName}
                      </span>
                      <span>
                        <EyeOutlined /> {blog.views || 0}
                      </span>
                    </div>
                    {blog.createdAt && (
                      <div className="mt-1 text-xs text-gray-400">
                        <CalendarOutlined />{' '}
                        {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    )}
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

