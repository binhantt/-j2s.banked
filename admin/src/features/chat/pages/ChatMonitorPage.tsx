import { useEffect } from 'react';
import { Card, Empty, List, Space, Tag, Typography, message, Image, Avatar, Pagination, Select, Tooltip } from 'antd';
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
    convCurrentPage,
    convPageSize,
    convTotalElements,
    convTotalPages,
    msgCurrentPage,
    msgPageSize,
    msgTotalElements,
    msgTotalPages,
    loadConversations,
    loadMessages,
    selectConversation,
  } = useChatMonitorStore();

  useEffect(() => {
    void loadConversations(0);
  }, []);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleSelectConversation = async (conv: ConversationSummary) => {
    selectConversation(conv);
    await loadMessages(conv.id, 0).catch(() => {
      message.error('Không tải được tin nhắn');
    });
  };

  const handleConvPageChange = (page: number) => {
    void loadConversations(page - 1);
  };

  const handleMsgPageChange = (page: number) => {
    if (selected) {
      void loadMessages(selected.id, page - 1);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 8, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Giám sát hội thoại
        </Title>
        <Text style={{ color: '#64748b', fontSize: 15 }}>
          Giám sát và quản lý lịch sử trò chuyện giữa ứng viên và nhà tuyển dụng.
        </Text>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16, alignItems: 'stretch' }}>
        {/* LEFT: Conversations list */}
        <Card
          title={<Text strong style={{ color: '#0f172a' }}>Cuộc trò chuyện</Text>}
          loading={loadingConversations}
          style={{ borderRadius: 20, height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}
          extra={
            <Space direction="vertical" size={4} style={{ textAlign: 'right' }}>
              <Text style={{ fontSize: 11, color: '#64748b' }}>
                {convTotalElements > 0
                  ? `${convCurrentPage * convPageSize + 1}–${Math.min((convCurrentPage + 1) * convPageSize, convTotalElements)} / ${convTotalElements}`
                  : '0 cuộc trò chuyện'}
              </Text>
              <Select
                size="small"
                value={convPageSize}
                onChange={(size) => {
                  const store = useChatMonitorStore.getState();
                  store.setConvPageSize(size);
                  void loadConversations(0);
                }}
                options={[
                  { value: 10, label: '10 / trang' },
                  { value: 20, label: '20 / trang' },
                  { value: 50, label: '50 / trang' },
                ]}
                style={{ width: 90 }}
              />
            </Space>
          }
        >
          {conversations.length === 0 ? (
            <Empty description="Không có cuộc trò chuyện nào" />
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
                        #{conv.id}
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

                    <Tooltip title={new Date(conv.updatedAt).toLocaleString('vi-VN')}>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {new Date(conv.updatedAt).toLocaleString('vi-VN')}
                      </Text>
                    </Tooltip>
                  </List.Item>
                );
              }}
            />
          )}

          {convTotalPages > 1 && (
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <Pagination
                size="small"
                current={convCurrentPage + 1}
                pageSize={convPageSize}
                total={convTotalElements}
                onChange={handleConvPageChange}
                showSizeChanger={false}
              />
            </div>
          )}
        </Card>

        {/* RIGHT: Messages */}
        <Card
          title={
            <Space>
              <MessageOutlined />
              <span>Nội dung tin nhắn</span>
              {selected && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  — #{selected.id} ({selected.hr?.name || `HR#${selected.hrId}`} ↔ {selected.jobSeeker?.name || `UV#${selected.jobSeekerId}`})
                </Text>
              )}
            </Space>
          }
          loading={loadingMessages}
          style={{ borderRadius: 14, height: '100%', minHeight: 420 }}
          extra={
            <Space direction="vertical" size={4} style={{ textAlign: 'right' }}>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {msgTotalElements > 0
                  ? `${msgCurrentPage * msgPageSize + 1}–${Math.min((msgCurrentPage + 1) * msgPageSize, msgTotalElements)} / ${msgTotalElements}`
                  : '0 tin nhắn'}
              </Text>
              <Select
                size="small"
                value={msgPageSize}
                onChange={(size) => {
                  const store = useChatMonitorStore.getState();
                  store.setMsgPageSize(size);
                  if (selected) {
                    void loadMessages(selected.id, 0);
                  }
                }}
                options={[
                  { value: 20, label: '20 / trang' },
                  { value: 50, label: '50 / trang' },
                  { value: 100, label: '100 / trang' },
                ]}
                style={{ width: 95 }}
              />
            </Space>
          }
        >
          {!selected ? (
            <Empty description="Chọn một cuộc trò chuyện để xem chi tiết" />
          ) : messages.length === 0 ? (
            <Empty description="Chưa có tin nhắn" />
          ) : (
            <>
              <div style={{ maxHeight: 440, overflowY: 'auto', paddingRight: 4 }}>
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
                        background: msg.senderType === 'hr' ? 'linear-gradient(135deg, #16a34a, #22c55e)' : '#f1f5f9',
                        color: msg.senderType === 'hr' ? '#ffffff' : '#1e293b',
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

              {msgTotalPages > 1 && (
                <div style={{ marginTop: 12, textAlign: 'center' }}>
                  <Pagination
                    size="small"
                    current={msgCurrentPage + 1}
                    pageSize={msgPageSize}
                    total={msgTotalElements}
                    onChange={handleMsgPageChange}
                    showSizeChanger={false}
                  />
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
