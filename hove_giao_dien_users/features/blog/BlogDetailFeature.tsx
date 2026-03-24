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
        // Platform blog - try to get it, but handle 404/500 gracefully
        try {
          response = await blogApi.getBlogById(postId);
        } catch (error: any) {
          // If platform blog not found, show appropriate message
          if (error.response?.status === 404 || error.response?.status === 500) {
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
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Empty description="Không tìm thấy bài viết" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative w-full h-[50vh] sm:h-[60vh] min-h-[400px]">
        {post.image ? (
          <img src={post.image} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-green-600 to-green-800" />
        )}
        <div className="absolute inset-0 bg-black/60 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
        
        {/* Navigation & Breadcrumb Overlay */}
        <div className="absolute top-0 left-0 w-full pt-6 px-4 sm:px-6 lg:px-8 z-20">
          <div className="max-w-5xl mx-auto">
            {/* Breadcrumb + Back Button Row */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <Breadcrumb
                className="[&_.ant-breadcrumb-link]:!text-white/80 [&_.ant-breadcrumb-link]:hover:!text-white [&_.ant-breadcrumb-separator]:!text-white/50"
                items={[
                  { title: <Link href="/" className="flex items-center gap-1"><HomeOutlined /> Trang chủ</Link> },
                  { title: <Link href="/blog" className="flex items-center gap-1"><GlobalOutlined /> Blog</Link> },
                  { title: <span className="text-white font-medium">{post.title?.substring(0, 40)}{post.title?.length > 40 ? '...' : ''}</span> },
                ]}
              />
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white/90 hover:text-white text-sm font-medium rounded-full transition-all duration-200 hover:scale-105"
              >
                <span className="text-base leading-none">←</span> Quay lại
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Content Overlay */}
        <div className="absolute bottom-0 left-0 w-full px-4 sm:px-6 lg:px-8 pb-20 sm:pb-24 z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-3 mb-6">
              <Tag 
                color={post.source === 'platform' ? 'magenta' : 'green'} 
                className="text-xs sm:text-sm px-4 py-1.5 rounded-full border-0 shadow-lg font-medium tracking-wide bg-white/20 backdrop-blur-md text-white flex items-center"
                icon={post.source === 'platform' ? <GlobalOutlined /> : <BankOutlined />}
              >
                <span className="ml-1">{post.source === 'platform' ? 'Blog nền tảng' : 'Blog công ty'}</span>
              </Tag>
              <Tag className="text-xs sm:text-sm px-4 py-1.5 rounded-full border-0 shadow-lg font-medium tracking-wide bg-white/20 backdrop-blur-md text-white m-0">
                {post.category}
              </Tag>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white mb-6 leading-[1.2] drop-shadow-2xl">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-white/90">
              <div className="flex items-center gap-3">
                <Avatar
                  src={post.authorAvatar}
                  size={52}
                  icon={<UserOutlined />}
                  className="border-2 border-white/30 shadow-lg"
                  style={{ background: post.source === 'platform' ? '#16a34a' : '#f59e0b' }}
                />
                <div>
                  <div className="font-semibold text-white text-base tracking-wide">{post.author}</div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-300 font-light">
                    <CalendarOutlined className="text-xs" />
                    <span>{post.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm font-medium ml-auto">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                  <ClockCircleOutlined className="text-green-300" />
                  <span>{post.readTime}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                  <EyeOutlined className="text-green-300" />
                  <span>{post.views.toLocaleString('vi-VN')} lượt xem</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content Area (Floating Card) */}
        <div className="relative z-20 max-w-4xl mx-auto bg-white rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 sm:p-10 lg:p-14 mb-16 -mt-16 sm:-mt-24">
          {/* Article Meta Header */}
          <div className="flex flex-wrap items-center gap-3 mb-8 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CalendarOutlined className="text-green-600" />
              <span>{post.date}</span>
            </div>
            <span className="text-gray-300">·</span>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <ClockCircleOutlined className="text-green-600" />
              <span>{post.readTime}</span>
            </div>
            <span className="text-gray-300">·</span>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <EyeOutlined className="text-green-600" />
              <span>{post.views.toLocaleString('vi-VN')} lượt xem</span>
            </div>
          </div>

          <div className="prose prose-lg sm:prose-xl max-w-none prose-blue
            prose-headings:font-bold prose-headings:text-gray-900
            prose-p:text-gray-700 prose-p:leading-[1.9]
            prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-2xl prose-img:shadow-lg
            prose-blockquote:border-l-4 prose-blockquote:border-green-600 prose-blockquote:bg-green-50 prose-blockquote:py-2 prose-blockquote:px-5 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-gray-700">
            <div
              className="text-gray-800 leading-[1.9]"
              style={{ whiteSpace: 'pre-line' }}
              dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }}
            />
          </div>

          <Divider className="my-10 lg:my-14" />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-12">
              <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Tag color="blue" className="rounded-full border-0 m-0 w-8 h-8 flex items-center justify-center font-bold text-lg">#</Tag>
                Chủ đề bài viết
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: string, index: number) => (
                  <span 
                    key={index}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Share */}
          <div className="bg-gray-50 p-6 sm:p-8 rounded-2xl border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Chia sẻ bài viết này</h3>
              <p className="text-gray-500 text-sm m-0">Lan tỏa kiến thức đến cộng đồng của bạn</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                shape="circle"
                icon={<FacebookOutlined />}
                size="large"
                className="bg-[#1877f2] text-white hover:opacity-90 hover:text-white border-0 shadow-md hover:scale-110 transition-all flex items-center justify-center"
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')}
              />
              <Button
                shape="circle"
                icon={<TwitterOutlined />}
                size="large"
                className="bg-[#1da1f2] text-white hover:opacity-90 hover:text-white border-0 shadow-md hover:scale-110 transition-all flex items-center justify-center"
                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${window.location.href}&text=${post.title}`, '_blank')}
              />
              <Button
                shape="circle"
                icon={<LinkedinOutlined />}
                size="large"
                className="bg-[#0a66c2] text-white hover:opacity-90 hover:text-white border-0 shadow-md hover:scale-110 transition-all flex items-center justify-center"
                onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`, '_blank')}
              />
              <Button
                shape="circle"
                icon={<HeartOutlined />}
                size="large"
                className="bg-rose-500 text-white hover:opacity-90 hover:text-white border-0 shadow-md hover:scale-110 transition-all flex items-center justify-center"
              />
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mb-20">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                  Bài viết liên quan
                </h2>
                <div className="h-1.5 bg-green-600 w-16 rounded-full mt-3"></div>
              </div>
              <Link
                href="/blog"
                className="hidden sm:inline-flex items-center gap-1.5 text-green-600 hover:text-green-700 font-semibold text-sm transition-colors"
              >
                Xem tất cả <span className="text-base leading-none">→</span>
              </Link>
            </div>
            <Row gutter={[24, 24]}>
              {relatedPosts.map((relatedPost) => (
                <Col key={relatedPost.id} xs={24} sm={12} lg={8}>
                  <Link href={`/blog/${relatedPost.id}`} className="block h-full group">
                    <Card
                      hoverable
                      className="border border-gray-100 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 h-full overflow-hidden"
                      bodyStyle={{ padding: '20px' }}
                      cover={
                        relatedPost.image ? (
                          <div className="h-48 overflow-hidden relative">
                            <img
                              src={relatedPost.image}
                              alt={relatedPost.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute top-3 left-3">
                              <Tag
                                color={relatedPost.source === 'platform' ? 'blue' : 'green'}
                                className="m-0 text-xs rounded-full font-medium border-0 shadow-md"
                              >
                                {relatedPost.source === 'platform' ? 'Nền tảng' : 'Công ty'}
                              </Tag>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                        ) : (
                          <div className="h-48 bg-gray-100 flex items-center justify-center">
                            <BankOutlined className="text-4xl text-gray-300" />
                          </div>
                        )
                      }
                    >
                      <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <CalendarOutlined className="text-xs" />
                          {relatedPost.date}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <ClockCircleOutlined className="text-xs" />
                          {relatedPost.readTime}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 text-base group-hover:text-green-600 transition-colors leading-snug">
                        {relatedPost.title}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                        {relatedPost.excerpt}
                      </p>
                      <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold text-green-600 group-hover:gap-2.5 transition-all">
                        Đọc ngay <span className="text-base leading-none">→</span>
                      </div>
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
