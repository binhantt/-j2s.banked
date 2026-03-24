import { Card, Button, List, Modal, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { companyBlogApi, CompanyBlog } from '@/lib/companyBlogApi';
import { useRouter } from 'next/router';

export const BlogManagementSection = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  const [blogs, setBlogs] = useState<CompanyBlog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadBlogs();
    }
  }, [user?.id]);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const data = await companyBlogApi.getBlogsByHR(user!.id);
      setBlogs(data);
    } catch (error) {
      console.error('Load blogs error:', error);
      message.error('Không thể tải danh sách blog!');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa blog',
      content: 'Bạn có chắc chắn muốn xóa blog này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await companyBlogApi.deleteBlog(id);
          await loadBlogs();
          message.success('Đã xóa blog!');
        } catch (error) {
          message.error('Xóa thất bại!');
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">{blogs.length}</div>
          <div className="text-gray-600 mt-2">Tổng số blog</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {blogs.filter((b) => b.status === 'published').length}
          </div>
          <div className="text-gray-600 mt-2">Đã xuất bản</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {blogs.filter((b) => b.status === 'draft').length}
          </div>
          <div className="text-gray-600 mt-2">Bản nháp</div>
        </Card>
      </div>

      <Button
        type="primary"
        size="large"
        icon={<PlusOutlined />}
        block
        className="h-14 text-lg"
        onClick={() => router.push('/company/blogs/create')}
      >
        Tạo blog mới
      </Button>

      {loading ? (
        <Card className="text-center py-8">
          <div>Đang tải...</div>
        </Card>
      ) : blogs.length === 0 ? (
        <Card className="text-center py-8">
          <div className="text-gray-500">Chưa có blog nào</div>
        </Card>
      ) : (
        <List
          dataSource={blogs}
          renderItem={(blog) => (
            <Card className="mb-4 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{blog.title}</h3>
                    <Tag color={blog.status === 'published' ? 'green' : 'green'}>
                      {blog.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                    </Tag>
                  </div>
                  <div className="text-gray-600 text-sm">
                    {blog.content?.substring(0, 100) || 'Không có mô tả'}...
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button icon={<EyeOutlined />} onClick={() => router.push(`/blog/${blog.id}`)}>
                    Xem
                  </Button>
                  <Button icon={<EditOutlined />} onClick={() => router.push(`/company/blogs/edit/${blog.id}`)}>
                    Sửa
                  </Button>
                  <Button danger icon={<DeleteOutlined />} onClick={() => blog.id && handleDelete(blog.id)}>
                    Xóa
                  </Button>
                </div>
              </div>
            </Card>
          )}
        />
      )}
    </div>
  );
};
