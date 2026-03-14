import { useEffect } from 'react';
import { Card, Empty, List, Space, Tag, Typography, message } from 'antd';
import { UserOutlined, MessageOutlined } from '@ant-design/icons';
import type { ConversationSummary } from '../types/chatTypes';
import { useChatMonitorStore } from '../store/useChatMonitorStore';

const { Title, Text, Paragraph } = Typography;

export function ChatMonitorPage() {
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
                      borderRadius: 10,
                      marginBottom: 6,
                      paddingInline: 10,
                      background: isSelected ? '#e0f2fe' : undefined,
                    }}
                  >
                    <List.Item.Meta
                      avatar={<UserOutlined />}
                      title={
                        <Space>
                          <Text strong>Conv #{conv.id}</Text>
                          <Tag color="blue">HR #{conv.hrId}</Tag>
                          <Tag color="green">UV #{conv.jobSeekerId}</Tag>
                          {conv.jobPostingId && <Tag>Job #{conv.jobPostingId}</Tag>}
                        </Space>
                      }
                      description={
                        <Text type="secondary">
                          Cập nhật: {new Date(conv.updatedAt).toLocaleString('vi-VN')}
                        </Text>
                      }
                    />
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
                    marginBottom: 12,
                    padding: 10,
                    borderRadius: 10,
                    background:
                      msg.senderType === 'hr'
                        ? 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)'
                        : '#f9fafb',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <Space style={{ marginBottom: 4 }}>
                    <Tag color={msg.senderType === 'hr' ? 'blue' : 'green'}>
                      {msg.senderType === 'hr' ? `HR #${msg.senderId}` : `Ứng viên #${msg.senderId}`}
                    </Tag>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {new Date(msg.createdAt).toLocaleString('vi-VN')}
                    </Text>
                  </Space>
                  <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>{msg.message}</Paragraph>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

