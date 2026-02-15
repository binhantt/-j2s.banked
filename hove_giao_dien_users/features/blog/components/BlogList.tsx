import { useEffect, useState } from 'react';
import { Row, Col, Empty, Spin, message } from 'antd';
import { useBlogStore } from '@/store/useBlogStore';
import { BlogCard } from './BlogCard';
import { api } from '@/lib/api';

export const BlogList = () => {
  const { filteredPosts, setPosts } = useBlogStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/blog/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Load blog posts error:', error);
      message.error('Không thể tải danh sách bài viết');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Spin size="large" />
      </div>
    );
  }

  if (filteredPosts.length === 0) {
    return (
      <div className="flex justify-center items-center py-16">
        <Empty description="Không tìm thấy bài viết" />
      </div>
    );
  }

  return (
    <Row gutter={[24, 24]}>
      {filteredPosts.map((post) => (
        <Col key={post.id} xs={24} sm={12} lg={8}>
          <BlogCard post={post} />
        </Col>
      ))}
    </Row>
  );
};
