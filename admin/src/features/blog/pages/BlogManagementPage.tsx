import { useEffect } from 'react';
import { Button, Card, Modal, Space, Table, Tag, Typography, App, Avatar, Divider } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  EyeOutlined, 
  DeleteOutlined, 
  ReloadOutlined, 
  PlusOutlined,
  FacebookOutlined,
  InstagramOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons';
import type { BlogPostSummary } from '../types/blogTypes';
import { useBlogStore } from '../store/useBlogStore';

const { Title, Text } = Typography;

interface BlogManagementPageProps {
  onAdd: () => void;
}

export function BlogManagementPage({ onAdd }: BlogManagementPageProps) {
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
      const { blogApi } = await import('../api/blogApi');
      await blogApi.deletePost(id);
      message.success('Đã xóa bài viết');
      removePostById(id);
    } catch {
      message.error('Không thể xóa bài viết');
    }
  };

  const columns: ColumnsType<BlogPostSummary> = [
    {
      title: 'Bài viết',
      dataIndex: 'title',
      key: 'title',
      render: (value: string, record) => (
        <Space size="middle">
          <Avatar 
            shape="square" 
            size={48} 
            src={(record as any).image} 
            style={{ borderRadius: 8, background: '#f0fdf4' }}
            icon={<GlobalOutlined style={{ color: '#16a34a' }} />}
          />
          <div>
            <Text strong style={{ display: 'block', fontSize: 15 }}>{value}</Text>
            <Text type="secondary" style={{ fontSize: 13 }}>ID: {record.id}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Tác giả',
      dataIndex: 'author',
      key: 'author',
      width: 160,
      render: (author: string) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} style={{ background: '#16a34a' }} />
          <Text>{author}</Text>
        </Space>
      )
    },
    {
      title: 'Thông tin nội dung',
      key: 'content_info',
      width: 280,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Space>
            <Tag color={record.source === 'platform' ? 'blue' : 'green'} style={{ borderRadius: 4 }}>
              {record.source === 'platform' ? 'Nền tảng' : 'Công ty'}
            </Tag>
            <Tag style={{ borderRadius: 4 }}>{record.category}</Tag>
          </Space>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            <CalendarOutlined /> {record.date} • <ClockCircleOutlined /> {record.readTime}
          </div>
        </Space>
      ),
    },
    {
      title: 'Chỉ số',
      key: 'stats',
      width: 120,
      render: (_, record) => (
        <div>
          <EyeOutlined style={{ color: '#94a3b8' }} /> <Text strong>{record.views.toLocaleString()}</Text>
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Space>
          <Button 
            type="text" 
            icon={<EyeOutlined style={{ color: '#16a34a' }} />} 
            onClick={() => void handleViewDetail(String(record.id))}
            style={{ borderRadius: 8 }}
          />
          <PopconfirmDelete onConfirm={() => void handleDelete(String(record.id))} />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '0 24px' }}>
      <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <Title level={2} style={{ marginBottom: 8, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Danh sách Blog
          </Title>
          <Text style={{ color: '#64748b', fontSize: 16 }}>
            Quản lý nội dung bài viết và tin tức trên toàn hệ thống
          </Text>
        </div>
        <Space size={12}>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => void loadPosts()}
            style={{ borderRadius: 12, height: 44, fontWeight: 600 }}
          >
            Làm mới
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={onAdd}
            style={{ 
              borderRadius: 12, 
              height: 44, 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #16a34a, #22c55e)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)'
            }}
          >
            Tạo bài viết mới
          </Button>
        </Space>
      </div>

      <Card
        style={{ 
          borderRadius: 24, 
          boxShadow: '0 10px 40px rgba(0,0,0,0.03)', 
          border: '1px solid #f1f5f9',
          overflow: 'hidden'
        }}
        styles={{ body: { padding: 0 } }}
      >
        <Table 
          rowKey="id" 
          loading={loading} 
          dataSource={posts} 
          columns={columns} 
          pagination={{ 
            pageSize: 10,
            style: { paddingRight: 24 }
          }} 
          className="premium-table"
        />
      </Card>

      <Modal
        title={null}
        open={detailVisible}
        onCancel={closeDetail}
        footer={null}
        width={1000}
        styles={{ body: { padding: 0 } }}
        centered
        destroyOnClose
      >
        {detail && (
          <div>
             <div style={{ height: 300, position: 'relative', overflow: 'hidden', borderRadius: '8px 8px 0 0' }}>
                <img 
                  src={(detail as any).image || 'https://via.placeholder.com/1000x300'} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
                <div style={{ position: 'absolute', bottom: 24, left: 32, right: 32 }}>
                  <Tag color="#16a34a" style={{ marginBottom: 12, borderRadius: 100, border: 'none', fontWeight: 700 }}>{detail.category}</Tag>
                  <h2 style={{ color: '#fff', fontSize: 32, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>{detail.title}</h2>
                </div>
             </div>

             <div style={{ padding: '32px 40px', maxHeight: '60vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                  <Space size="middle">
                    <Avatar size="large" icon={<UserOutlined />} style={{ background: '#16a34a' }} />
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{detail.author}</div>
                      <Text type="secondary" style={{ fontSize: 13 }}>{detail.date} • {detail.readTime}</Text>
                    </div>
                  </Space>
                  
                  <Space size={12}>
                    {(detail as any).facebookLink && (
                      <Button shape="circle" icon={<FacebookOutlined />} href={(detail as any).facebookLink} target="_blank" />
                    )}
                    {(detail as any).instagramLink && (
                      <Button shape="circle" icon={<InstagramOutlined />} href={(detail as any).instagramLink} target="_blank" />
                    )}
                    {(detail as any).zaloLink && (
                      <Button shape="circle" style={{ fontWeight: 800, fontSize: 10 }} href={(detail as any).zaloLink} target="_blank">ZALO</Button>
                    )}
                  </Space>
                </div>

                <div 
                  className="admin-preview-content"
                  style={{ fontSize: 16, lineHeight: 1.8, color: '#334155', whiteSpace: 'pre-wrap' }}
                  dangerouslySetInnerHTML={{ __html: detail.content.replace(/\n/g, '<br/>') }}
                />

                {detail.tags && (
                  <div style={{ marginTop: 40 }}>
                    <Divider orientation="left"><Text type="secondary" style={{ fontSize: 12, fontWeight: 700 }}>TAGS</Text></Divider>
                    <Space wrap>
                      {(Array.isArray(detail.tags) ? detail.tags : (detail.tags as string).split(',')).map((tag) => (
                        <Tag key={tag.trim()} style={{ borderRadius: 100, padding: '4px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600 }}>
                          #{tag.trim()}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                )}
             </div>
          </div>
        )}
      </Modal>

      <style>{`
        .premium-table .ant-table-thead > tr > th {
          background: #f8fafc !important;
          color: #64748b !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          font-size: 11px !important;
          letter-spacing: 0.05em !important;
          padding: 16px 24px !important;
        }
        .premium-table .ant-table-tbody > tr > td {
          padding: 16px 24px !important;
        }
        .admin-preview-content b, .admin-preview-content strong { font-weight: 800; color: #0f172a; }
        .admin-preview-content code { background: #f0fdf4; color: #16a34a; padding: 2px 6px; borderRadius: 4px; font-family: monospace; }
        .admin-preview-content pre { background: #f8fafc; padding: 16px; borderRadius: 12px; border: 1px solid #e2e8f0; overflowX: auto; }
      `}</style>
    </div>
  );
}

function PopconfirmDelete({ onConfirm }: { onConfirm: () => void }) {
  return (
    <Button 
      type="text" 
      danger 
      icon={<DeleteOutlined />} 
      onClick={(e) => {
        e.stopPropagation();
        Modal.confirm({
          title: 'Xóa bài viết?',
          content: 'Hành động này không thể hoàn tác.',
          okText: 'Xóa bài',
          okType: 'danger',
          cancelText: 'Hủy',
          onOk: onConfirm,
          centered: true,
          icon: <DeleteOutlined style={{ color: '#ef4444' }} />
        });
      }}
      style={{ borderRadius: 8 }}
    />
  );
}
