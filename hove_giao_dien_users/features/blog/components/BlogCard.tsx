import { Card, Tag, Avatar } from 'antd';
import { ClockCircleOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import Link from 'next/link';
import type { BlogPost } from '@/store/useBlogStore';

interface BlogCardProps {
  post: BlogPost;
}

export const BlogCard = ({ post }: BlogCardProps) => {
  return (
    <Link href={`/blog/${post.id}`}>
      <Card
        hoverable
        className="h-full border border-gray-200 rounded-xl overflow-hidden"
        bodyStyle={{ padding: 0 }}
        cover={
          <div className="relative h-48 overflow-hidden">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            />
            <Tag
              color="blue"
              className="absolute top-4 left-4 text-sm px-3 py-1"
            >
              {post.category}
            </Tag>
          </div>
        }
      >
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-indigo-600 transition-colors">
            {post.title}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <ClockCircleOutlined className="mr-1" />
                <span>{post.readTime}</span>
              </div>
              <div className="flex items-center">
                <EyeOutlined className="mr-1" />
                <span>{post.views}</span>
              </div>
            </div>
            <span>{post.date}</span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Avatar
                src={post.authorAvatar}
                icon={<UserOutlined />}
                size="small"
              />
              <span className="text-sm text-gray-700 font-medium">
                {post.author}
              </span>
            </div>
            <div className="flex gap-1">
              {post.tags.slice(0, 2).map((tag, index) => (
                <Tag key={index} className="text-xs m-0">
                  {tag}
                </Tag>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
