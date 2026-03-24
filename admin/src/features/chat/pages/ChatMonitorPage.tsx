import { useEffect } from 'react';
import { Card, Empty, List, Space, Tag, Typography, message, Image, Avatar } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import type { ConversationSummary } from '../types/chatTypes';
import { useChatMonitorStore } from '../store/useChatMonitorStore';

const { Title, Text, Paragraph } = Typography;

export function ChatMonitorPage() {
  const isImageUrl = (url: string) => {
    return url.match(/\.(jpeg|jpg|gif|png|webp)$/i) || url.includes('firebasestorage.googleapis.com');
  };
  const {
    conversations,
    messages,
    selected,
    loadingConversations,
    loadingMessages,
    error,
    loadConversations,
    loadMessages,
    selectConversation,
  } = useChatMonitorStore();

  useEffect(() => {
    void loadConversations().catch(() => {
      message.error('Không tải được danh sách cuộc trò chuyện');
    });
  }, [loadConversations]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleSelectConversation = async (conv: ConversationSummary) => {
    selectConversation(conv);
    await loadMessages(conv.id).catch(() => {
      message.error('Không tải được tin nhắn');
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ marginBottom: 4, color: '#0b1220' }}>
          Giám sát chat ứng viên & nhà tuyển dụng
        </Title>
        <Text type="secondary">
          Xem lịch sử trò chuyện giữa ứng viên và nhà tuyển dụng trong 30 ngày gần nhất.
        </Text>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, alignItems: 'stretch' }}>
        <Card
          title="Cuộc trò chuyện (30 ngày gần nhất)"
          loading={loadingConversations}
          style={{ borderRadius: 14, height: '100%' }}
        >
          {conversations.length === 0 ? (
            <Empty description="Không có cuộc trò chuyện nào trong 30 ngày gần đây" />
          ) : (
            <List
              dataSource={conversations}
              renderItem={(conv) => {
                const isSelected = selected?.id === conv.id;
                return (
                  <List.Item
                    onClick={() => void handleSelectConversation(conv)}
                    style={{
                      cursor: 'pointer',
                      borderRadius: 12,
                      marginBottom: 10,
                      padding: 14,
                      background: isSelected ? '#f0fdf4' : '#ffffff',
                      border: `1px solid ${isSelected ? '#bbf7d0' : '#f0f0f0'}`,
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 2px 8px rgba(34, 197, 94, 0.1)' : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong style={{ color: isSelected ? '#166534' : '#1f2937' }}>
                        Trò chuyện #{conv.id}
                      </Text>
                      {conv.jobPostingId && (
                        <Tag color="purple" style={{ margin: 0, border: 'none' }}>Job #{conv.jobPostingId}</Tag>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <Space size={8}>
                        <Avatar size="small" style={{ backgroundColor: '#e0f2fe', color: '#0284c7', fontSize: 12 }}>HR</Avatar>
                        <Text style={{ fontSize: 13 }}>
                          {conv.hr?.name || `HR #${conv.hrId}`}
                        </Text>
                      </Space>
                      <Space size={8}>
                        <Avatar size="small" style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: 12 }}>UV</Avatar>
                        <Text style={{ fontSize: 13 }}>
                          {conv.jobSeeker?.name || `Ứng viên #${conv.jobSeekerId}`}
                        </Text>
                      </Space>
                    </div>

                    <div style={{ marginTop: 2 }}>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        Cập nhật: {new Date(conv.updatedAt).toLocaleString('vi-VN')}
                      </Text>
                    </div>
                  </List.Item>
                );
              }}
            />
          )}
        </Card>

        <Card
          title={
            <Space>
              <MessageOutlined />
              <span>Nội dung tin nhắn</span>
            </Space>
          }
          loading={loadingMessages}
          style={{ borderRadius: 14, height: '100%', minHeight: 420 }}
        >
          {!selected ? (
            <Empty description="Chọn một cuộc trò chuyện để xem chi tiết" />
          ) : messages.length === 0 ? (
            <Empty description="Chưa có tin nhắn trong 30 ngày gần đây" />
          ) : (
            <div style={{ maxHeight: 520, overflowY: 'auto', paddingRight: 4 }}>
              {messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      marginBottom: 20,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.senderType === 'hr' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8, flexDirection: msg.senderType === 'hr' ? 'row-reverse' : 'row' }}>
                      <Avatar size="small" style={{ backgroundColor: msg.senderType === 'hr' ? '#e0f2fe' : '#dcfce7', color: msg.senderType === 'hr' ? '#0284c7' : '#166534', fontSize: 11 }}>
                        {msg.senderType === 'hr' ? 'HR' : 'UV'}
                      </Avatar>
                      <Text style={{ fontSize: 13, fontWeight: 500 }}>
                        {msg.senderType === 'hr' ? (selected?.hr?.name || `HR #${msg.senderId}`) : (selected?.jobSeeker?.name || `Ứng viên #${msg.senderId}`)}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {new Date(msg.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </Text>
                    </div>
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: 18,
                        borderTopLeftRadius: msg.senderType !== 'hr' ? 4 : 18,
                        borderTopRightRadius: msg.senderType === 'hr' ? 4 : 18,
                        background: msg.senderType === 'hr' ? '#2563eb' : '#f3f4f6',
                        color: msg.senderType === 'hr' ? '#ffffff' : '#1f2937',
                        maxWidth: '85%',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      }}
                    >
                      {isImageUrl(msg.message) ? (
                        <Image src={msg.message} alt="sent image" style={{ maxWidth: 220, borderRadius: 8, display: 'block' }} />
                      ) : (
                        <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap', color: 'inherit' }}>
                          {msg.message}
                        </Paragraph>
                      )}
                    </div>
                  </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}