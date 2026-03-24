import { useEffect } from 'react';
import { Button, Card, Modal, Space, Table, Tag, Typography, App } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { BlogPostSummary } from '../types/blogTypes';
import { useBlogStore } from '../store/useBlogStore';

const { Title, Text, Paragraph } = Typography;

export function BlogManagementPage() {
  const { posts, loading, error, detail, detailVisible, loadPosts, loadDetail, closeDetail, removePostById } =
    useBlogStore();
  const { message } = App.useApp();

  useEffect(() => {
    void loadPosts().catch(() => {
      message.error('Không tải được danh sách blog');
    });
  }, [loadPosts, message]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleViewDetail = async (id: string) => {
    await loadDetail(id).catch(() => {
      message.error('Không tải được chi tiết bài viết');
    });
  };

  const handleDelete = async (id: string) => {
    try {
      // Gọi trực tiếp API xóa, sau đó cập nhật store
      // Không đặt trong store để tránh phụ thuộc vòng giữa store và UI.
      const { blogApi } = await import('../api/blogApi');
      await blogApi.deletePost(id);
      message.success('Đã xóa bài viết');
      removePostById(id);
    } catch {
      message.error('Không thể xóa bài viết');
    }
  };

  const columns: ColumnsType<BlogPostSummary> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (value: string) => <Text strong>{value}</Text>,
    },
    {
      title: 'Tác giả',
      dataIndex: 'author',
      key: 'author',
      width: 160,
    },
    {
      title: 'Nguồn',
      dataIndex: 'source',
      key: 'source',
      width: 120,
      render: (source: BlogPostSummary['source']) =>
        source === 'platform' ? <Tag color="blue">Nền tảng</Tag> : <Tag color="green">Công ty</Tag>,
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: 140,
      render: (value: string) => <Tag>{value}</Tag>,
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      width: 120,
    },
    {
      title: 'Lượt xem',
      dataIndex: 'views',
      key: 'views',
      width: 110,
    },
    {
      title: 'Thời gian đọc',
      dataIndex: 'readTime',
      key: 'readTime',
      width: 130,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 170,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => void handleViewDetail(String(record.id))}>
            Xem
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => void handleDelete(String(record.id))}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 8, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Quản lý Blog
        </Title>
        <Text style={{ color: '#64748b', fontSize: 15 }}>
          Quản lý bài viết blog từ nền tảng và đối tác
        </Text>
      </div>

      <Card
        style={{ marginBottom: 24, borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}
        extra={
          <Space size={12}>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => void loadPosts()}
              style={{ borderRadius: 12, height: 40 }}
            >
              Làm mới
            </Button>
          </Space>
        }
      >
        <Table rowKey="id" loading={loading} dataSource={posts} columns={columns} pagination={{ pageSize: 5 }} />
      </Card>

      <Modal
        title={detail?.title}
        open={detailVisible}
        onCancel={closeDetail}
        footer={null}
        width={900}
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
      >
        {detail && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Space>
              <Tag color="blue">{detail.category}</Tag>
              <Tag>{detail.source === 'platform' ? 'Nền tảng' : 'Công ty'}</Tag>
              <Tag>{detail.readTime}</Tag>
            </Space>
            <Text type="secondary">
              {detail.author} • {detail.date} • {detail.views} lượt xem
            </Text>
            {detail.tags?.length ? (
              <Space wrap>
                {detail.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Space>
            ) : null}
            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{detail.content}</Paragraph>
          </Space>
        )}
      </Modal>
    </div>
  );
}

