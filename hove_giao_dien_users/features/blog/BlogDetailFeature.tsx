import { useState, useEffect } from 'react';
import { Card, Tag, Avatar, Button, Divider, Row, Col, Spin, Empty, message } from 'antd';
import {
  ClockCircleOutlined,
  EyeOutlined,
  UserOutlined,
  HeartOutlined,
  ShareAltOutlined,
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { api } from '@/lib/api';

interface BlogDetailFeatureProps {
  postId: string;
}

export const BlogDetailFeature = ({ postId }: BlogDetailFeatureProps) => {
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
      const response = await api.get(`/api/blog/posts/${postId}`);
      setPost(response.data);
    } catch (error) {
      console.error('Load blog post error:', error);
      message.error('Không thể tải bài viết');
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedPosts = async () => {
    try {
      const response = await api.get('/api/blog/posts');
      // Get 3 random posts excluding current post
      const filtered = response.data.filter((p: any) => p.id !== postId);
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
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Empty description="Không tìm thấy bài viết" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/blog" className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-2 transition-colors">
            <span>←</span> Quay lại danh sách bài viết
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10">
          <Tag color="blue" className="text-sm px-4 py-1.5 mb-4 rounded-full border-0">
            {post.category}
          </Tag>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Avatar 
                src={post.authorAvatar} 
                size={56} 
                icon={<UserOutlined />}
                className="border-2 border-blue-100"
              />
              <div>
                <div className="font-semibold text-gray-900 text-base">{post.author}</div>
                <div className="text-sm text-gray-500">{post.date}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 ml-auto">
              <div className="flex items-center gap-1.5">
                <ClockCircleOutlined className="text-blue-500" />
                <span>{post.readTime}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <EyeOutlined className="text-cyan-500" />
                <span>{post.views} lượt xem</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {post.image && (
          <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-64 sm:h-96 lg:h-[500px] object-cover"
            />
          </div>
        )}

        {/* Content */}
        <Card className="border-0 shadow-lg rounded-2xl mb-12 overflow-hidden">
          <div className="prose prose-lg max-w-none">
            <div
              className="text-gray-700 leading-relaxed text-base sm:text-lg"
              style={{ whiteSpace: 'pre-line' }}
              dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }}
            />
          </div>

          <Divider className="my-10" />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-10">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-600">#</span> Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: string, index: number) => (
                  <Tag 
                    key={index} 
                    color="blue" 
                    className="text-sm px-4 py-1.5 rounded-full border-0"
                  >
                    {tag}
                  </Tag>
                ))}
              </div>
            </div>
          )}

          <Divider className="my-10" />

          {/* Share */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-5">
              Chia sẻ bài viết
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button
                icon={<HeartOutlined />}
                size="large"
                className="rounded-lg hover:scale-105 transition-transform"
              >
                Thích
              </Button>
              <Button
                icon={<FacebookOutlined />}
                size="large"
                className="bg-blue-600 text-white hover:bg-blue-700 border-0 rounded-lg hover:scale-105 transition-transform"
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')}
              >
                Facebook
              </Button>
              <Button
                icon={<TwitterOutlined />}
                size="large"
                className="bg-sky-500 text-white hover:bg-sky-600 border-0 rounded-lg hover:scale-105 transition-transform"
                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${window.location.href}&text=${post.title}`, '_blank')}
              >
                Twitter
              </Button>
              <Button
                icon={<LinkedinOutlined />}
                size="large"
                className="bg-blue-700 text-white hover:bg-blue-800 border-0 rounded-lg hover:scale-105 transition-transform"
                onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`, '_blank')}
              >
                LinkedIn
              </Button>
            </div>
          </div>
        </Card>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
              Bài viết liên quan
            </h2>
            <Row gutter={[24, 24]}>
              {relatedPosts.map((relatedPost) => (
                <Col key={relatedPost.id} xs={24} sm={12} lg={8}>
                  <Link href={`/blog/${relatedPost.id}`}>
                    <Card
                      hoverable
                      cover={
                        relatedPost.image && (
                          <div className="h-48 overflow-hidden">
                            <img
                              src={relatedPost.image}
                              alt={relatedPost.title}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            />
                          </div>
                        )
                      }
                      className="border border-gray-200 rounded-xl shadow-md hover:shadow-xl transition-shadow h-full"
                    >
                      <Tag color="blue" className="mb-2 text-xs rounded-full">
                        {relatedPost.category}
                      </Tag>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-base">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-gray-600">{relatedPost.date}</p>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </div>
    </div>
  );
};
