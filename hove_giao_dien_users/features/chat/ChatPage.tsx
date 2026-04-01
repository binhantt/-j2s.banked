import { useState, useEffect } from 'react';
import { Input, Button, Avatar, message, Empty, Card, Typography, Tag, Upload } from 'antd';
import type { UploadProps } from 'antd';
import {
  SendOutlined,
  UserOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { chatApi } from '@/lib/chatApi';
import { uploadApi } from '@/lib/uploadApi';
import { useAuthStore } from '@/store/useAuthStore';
import { MainLayout } from '@/components/layout/MainLayout';

const { Text, Title } = Typography;

interface Message {
  id?: number;
  conversationId: number;
  senderId: number;
  senderType: string;
  message: string;
  replyToMessageId?: number;
  replyToMessage?: string;
  createdAt: string;
}

function ChatPageContent() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();
  const { id } = router.query;

  useEffect(() => {
    if (user?.id) loadConversations();
  }, [user?.id]);

  useEffect(() => {
    if (id && conversations.length > 0) {
      const conv = conversations.find((c) => c.id === Number(id));
      if (conv) {
        setSelectedConversation(conv);
        loadMessages(Number(id), true);
      }
    }
  }, [id, conversations]);

  useEffect(() => {
    if (selectedConversation) {
      const interval = setInterval(() => {
        loadMessages(selectedConversation.id);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);


  const loadConversations = async () => {
    if (!user?.id) return;
    
    try {
      const data =
        user?.userType === 'hr'
          ? await chatApi.getHRConversations(user.id)
          : await chatApi.getJobSeekerConversations(user.id);
      setConversations(data);
    } catch (error) {
      console.error('Load conversations error:', error);
    }
  };

  const loadMessages = async (conversationId: number, shouldMarkAsRead = false) => {
    try {
      const data = await chatApi.getMessages(conversationId);
      setMessages(data);
      if (shouldMarkAsRead && user?.id) {
        await chatApi.markAsRead(conversationId, user.id);
      }
    } catch (error) {
      console.error('Load messages error:', error);
    }
  };

  const handleSelectConversation = (conv: any) => {
    setSelectedConversation(conv);
    router.push(`/chat/${conv.id}`, undefined, { shallow: true, scroll: false });
    loadMessages(conv.id, true);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setLoading(true);
    try {
      const messageData: any = {
        conversationId: selectedConversation.id,
        senderId: user?.id,
        senderType: user?.userType,
        message: newMessage,
      };

      if (replyingTo) {
        messageData.replyToMessageId = replyingTo.id;
      }

      await chatApi.sendMessage(messageData);

      setNewMessage('');
      setReplyingTo(null);
      await loadMessages(selectedConversation.id, false);
    } catch {
      message.error('Không thể gửi tin nhắn');
    } finally {
      setLoading(false);
    }
  };

  const handleSendImage = async (file: File) => {
    if (!selectedConversation || !user?.id) return false;

    setUploadingImage(true);
    try {
      const imageUrl = await uploadApi.uploadImage(file);

      const messageData: any = {
        conversationId: selectedConversation.id,
        senderId: user.id,
        senderType: user?.userType,
        message: imageUrl,
      };

      if (replyingTo) {
        messageData.replyToMessageId = replyingTo.id;
      }

      await chatApi.sendMessage(messageData);
      setReplyingTo(null);
      await loadMessages(selectedConversation.id, false);
      message.success('Đã gửi ảnh');
    } catch {
      message.error('Không thể gửi ảnh');
    } finally {
      setUploadingImage(false);
    }

    return false;
  };

  const getConversationDisplayName = (conv: any) => {
    if (user?.userType === 'hr') {
      return conv.jobSeekerName || conv.jobSeekerFullName || `Ứng viên #${conv.jobSeekerId}`;
    }

    return conv.companyName || conv.hrCompanyName || conv.company?.name || `Công ty #${conv.hrId}`;
  };

  const filteredConversations = conversations.filter((conv) => {
    const displayName = getConversationDisplayName(conv);
    return displayName.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-3 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
          Tin nhắn
        </h1>
        <p className="text-base text-gray-600 md:text-lg">Trao đổi nhanh với ứng viên và nhà tuyển dụng</p>
      </div>

      <Card
        style={{
          borderRadius: 20,
          border: '1px solid #e6eef7',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
        }}
        styles={{ body: { padding: 0 } }}
      >
        <div className="grid min-h-[72vh] grid-cols-1 lg:grid-cols-[340px_1fr]">
          <aside className="border-b border-slate-100 bg-white lg:border-b-0 lg:border-r">
            <div className="border-b border-slate-100 p-4">
              <Input
                size="large"
                variant="borderless"
                className="chat-search-input"
                placeholder="Tìm cuộc trò chuyện..."
                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ borderRadius: 12, border: 'none', boxShadow: 'none', background: 'transparent' }}
              />
            </div>

            <div className="max-h-[34vh] overflow-y-auto lg:max-h-[64vh]">
              {filteredConversations.length === 0 ? (
                <div className="p-6">
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có cuộc trò chuyện" />
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = selectedConversation?.id === conv.id;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className="w-full border-0 px-4 py-3 text-left transition-all"
                      style={{
                        background: isSelected ? 'linear-gradient(90deg, #f0fdf4 0%, #f0fdfa 100%)' : '#fff',
                        borderLeft: isSelected ? '3px solid #16a34a' : '3px solid transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          icon={<UserOutlined />}
                          style={{ background: 'linear-gradient(135deg, #16a34a 0%, #14b8a6 100%)' }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="mb-0.5 flex items-start justify-between gap-2">
                            <Text strong ellipsis>
                              {getConversationDisplayName(conv)}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {new Date(conv.updatedAt).toLocaleDateString('vi-VN')}
                            </Text>
                          </div>
                          <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
                            {conv.jobPostingId ? `Tin #${conv.jobPostingId}` : 'Chat chung'}
                          </Text>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <section className="flex min-h-[46vh] flex-col bg-slate-50">
            {!selectedConversation ? (
              <div className="flex flex-1 items-center justify-center p-6">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chọn một cuộc trò chuyện để bắt đầu nhắn tin"
                />
              </div>
            ) : (
              <>
                <div className="border-b border-slate-100 bg-white px-4 py-3 md:px-5">
                  <div className="flex items-center gap-3">
                    <Avatar icon={<UserOutlined />} style={{ background: '#16a34a' }} />
                    <div>
                      <Title level={5} style={{ margin: 0 }}>
                        {getConversationDisplayName(selectedConversation)}
                      </Title>
                      <Tag color="success" style={{ marginTop: 4, borderRadius: 999 }}>
                        Đang hoạt động
                      </Tag>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-5">
                  {messages.length === 0 ? (
                    <Empty description="Chưa có tin nhắn nào" />
                  ) : (
                    messages.map((msg, index) => {
                      const isMe = msg.senderId === user?.id;
                      return (
                        <div
                          key={index}
                          className="mb-3 flex"
                          style={{ justifyContent: isMe ? 'flex-end' : 'flex-start' }}
                        >
                          <div
                            style={{
                              maxWidth: '75%',
                              borderRadius: 14,
                              background: isMe
                                ? 'linear-gradient(135deg, #16a34a 0%, #14b8a6 100%)'
                                : '#ffffff',
                              color: isMe ? '#fff' : '#111827',
                              border: isMe ? 'none' : '1px solid #e7edf4',
                              boxShadow: isMe
                                ? '0 6px 14px rgba(22, 163, 74, 0.15)'
                                : '0 4px 10px rgba(15, 23, 42, 0.04)',
                            }}
                          >
                            {msg.replyToMessage && (
                              <div
                                style={{
                                  padding: '8px 12px',
                                  margin: '10px 10px 0',
                                  borderRadius: 8,
                                  background: isMe ? 'rgba(255,255,255,0.15)' : '#f8fafc',
                                  borderLeft: `3px solid ${isMe ? '#fff' : '#16a34a'}`,
                                  fontSize: 12,
                                  opacity: 0.9,
                                }}
                              >
                                <div style={{ fontWeight: 600, marginBottom: 2 }}>Trả lời:</div>
                                <div style={{ 
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {msg.replyToMessage}
                                </div>
                              </div>
                            )}
                            <div style={{ 
                              padding: '10px 14px',
                              whiteSpace: 'pre-wrap', 
                              lineHeight: 1.45 
                            }}>
                              {typeof msg.message === 'string' && msg.message.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i) ? (
                                <img
                                  src={msg.message}
                                  alt="chat-image"
                                  style={{ maxWidth: 260, borderRadius: 10, display: 'block' }}
                                />
                              ) : (
                                msg.message
                              )}
                            </div>
                            <div
                              style={{
                                padding: '0 14px 10px',
                                fontSize: 11,
                                opacity: isMe ? 0.9 : 0.58,
                                display: 'flex',
                                gap: 8,
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                <ClockCircleOutlined />
                                {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                              <Button
                                type="text"
                                size="small"
                                onClick={() => setReplyingTo(msg)}
                                style={{
                                  color: isMe ? '#fff' : '#16a34a',
                                  padding: '0 4px',
                                  height: 'auto',
                                  fontSize: 11,
                                }}
                              >
                                Trả lời
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="border-t border-slate-100 bg-white p-3 md:p-4">
                  {replyingTo && (
                    <div
                      style={{
                        marginBottom: 12,
                        padding: '10px 12px',
                        background: '#f0fdf4',
                        borderRadius: 8,
                        borderLeft: '3px solid #16a34a',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#16a34a', marginBottom: 4 }}>
                          Đang trả lời:
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: '#64748b',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {replyingTo.message}
                        </div>
                      </div>
                      <Button
                        type="text"
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={() => setReplyingTo(null)}
                        style={{ flexShrink: 0 }}
                      />
                    </div>
                  )}
                  <div className="flex items-end gap-2">
                    <Upload
                      accept="image/*"
                      showUploadList={false}
                      beforeUpload={handleSendImage}
                      disabled={uploadingImage || loading}
                    >
                      <Button
                        icon={<PictureOutlined />}
                        loading={uploadingImage}
                        style={{ height: 42, borderRadius: 12 }}
                      />
                    </Upload>
                    <Input.TextArea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onPressEnter={(e) => {
                        if (!e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Nhập tin nhắn..."
                      autoSize={{ minRows: 1, maxRows: 4 }}
                      style={{ borderRadius: 12 }}
                    />
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      loading={loading}
                      onClick={handleSend}
                      style={{
                        height: 42,
                        borderRadius: 12,
                        border: 'none',
                        background: 'linear-gradient(135deg, #16a34a 0%, #14b8a6 100%)',
                        fontWeight: 600,
                      }}
                    >
                      Gửi
                    </Button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </Card>
    </div>
  );
}

export default function ChatPage() {
  return (
    <MainLayout>
      <ChatPageContent />
    </MainLayout>
  );
}
