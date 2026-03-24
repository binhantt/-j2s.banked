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
  const { user, _hasHydrated } = useAuthStore();
  const { id } = router.query;

  useEffect(() => {
    console.log('[ChatPage] _hasHydrated:', _hasHydrated, '| user:', user, '| user.id:', user?.id);
    if (_hasHydrated && user?.id) {
      console.log('[ChatPage] CALLING loadConversations, user.id =', user.id, 'userType =', user.userType);
      loadConversations();
    }
  }, [_hasHydrated, user?.id]);

  useEffect(() => {
    if (id) {
      const conv = conversations.find((c) => c.id === Number(id));
      if (conv) {
        setSelectedConversation(conv);
        loadMessages(Number(id), true);
      } else if (conversations.length > 0 && Number(id) === 0) {
        // No conversations found, stay on empty state
        setSelectedConversation(null);
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

    console.log('[ChatPage] loadConversations START, user.id =', user.id, 'userType =', user.userType);

    try {
      let data;
      if (user?.userType === 'hr') {
        data = await chatApi.getHRConversations(user.id);
      } else {
        data = await chatApi.getJobSeekerConversations(user.id);
      }
      console.log('[ChatPage] loadConversations RESULT:', data);
      setConversations(data);
    } catch (error) {
      console.error('[ChatPage] Load conversations error:', error);
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
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 64px)' }}>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-10 text-center">
          <h1 style={{ 
            fontSize: 'clamp(24px, 5vw, 40px)', 
            fontWeight: 800, 
            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 12
          }}>
            Hộp thư tin nhắn
          </h1>
          <p style={{ color: '#64748b', fontSize: 16 }}>Trao đổi nhanh với ứng viên và nhà tuyển dụng chuyên nghiệp</p>
        </div>

        <Card
          style={{
            borderRadius: 32,
            border: '1px solid #f1f5f9',
            overflow: 'hidden',
            boxShadow: '0 25px 70px rgba(15, 23, 42, 0.06)',
            background: '#fff',
          }}
          styles={{ body: { padding: 0 } }}
        >
          <div className="grid min-h-[75vh] grid-cols-1 lg:grid-cols-[360px_1fr]">
            {/* Sidebar */}
            <aside style={{ borderRight: '1px solid #f1f5f9', background: '#fff' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ position: 'relative' }}>
                  <Input
                    size="large"
                    placeholder="Tìm cuộc trò chuyện..."
                    prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ 
                      borderRadius: 16, 
                      background: '#f8fafc', 
                      border: '1px solid #e2e8f0',
                      padding: '10px 16px'
                    }}
                  />
                </div>
              </div>

              <div style={{ maxHeight: '65vh', overflowY: 'auto', padding: '12px' }}>
                {filteredConversations.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có cuộc trò chuyện" />
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {filteredConversations.map((conv) => {
                      const isSelected = selectedConversation?.id === conv.id;
                      return (
                        <div
                          key={conv.id}
                          onClick={() => handleSelectConversation(conv)}
                          style={{
                            padding: '14px 16px',
                            borderRadius: 20,
                            background: isSelected ? 'linear-gradient(90deg, #f0fdf4 0%, #f7fee7 100%)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            border: isSelected ? '1px solid #dcfce7' : '1px solid transparent',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14
                          }}
                          className="group"
                        >
                          <Avatar
                            size={48}
                            src={conv.authorAvatar}
                            icon={<UserOutlined />}
                            style={{ 
                              background: isSelected ? '#16a34a' : '#f1f5f9',
                              color: isSelected ? '#fff' : '#64748b',
                              flexShrink: 0,
                              border: isSelected ? '2px solid #fff' : 'none',
                              boxShadow: isSelected ? '0 4px 12px rgba(22, 163, 74, 0.2)' : 'none'
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                              <Text style={{ 
                                fontWeight: isSelected ? 700 : 600, 
                                color: isSelected ? '#166534' : '#0f172a',
                                fontSize: 15
                              }} ellipsis>
                                {getConversationDisplayName(conv)}
                              </Text>
                              <Text style={{ fontSize: 11, color: isSelected ? '#16a34a' : '#94a3b8', fontWeight: isSelected ? 600 : 400 }}>
                                {new Date(conv.updatedAt).toLocaleDateString('vi-VN')}
                              </Text>
                            </div>
                            <Text style={{ 
                              fontSize: 13, 
                              color: isSelected ? '#15803d' : '#64748b',
                              display: 'block'
                            }} ellipsis>
                              {conv.jobPostingId ? `Ứng tuyển: Tin #${conv.jobPostingId}` : 'Cuộc trò chuyện mới'}
                            </Text>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </aside>

            {/* Chat Area */}
            <section style={{ display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
              {!selectedConversation ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, opacity: 0.6 }}>
                  <div style={{ width: 80, height: 80, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                    <SendOutlined style={{ fontSize: 32, color: '#16a34a' }} />
                  </div>
                  <Title level={4} style={{ marginBottom: 8, color: '#1e293b' }}>Chọn một cuộc trò chuyện</Title>
                  <Text style={{ color: '#64748b' }}>Bắt đầu kết nối với nhà tuyển dụng hoặc ứng viên ngay hôm nay</Text>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div style={{ 
                    padding: '20px 32px', 
                    background: '#fff', 
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <Avatar 
                        size={44} 
                        icon={<UserOutlined />} 
                        style={{ background: '#16a34a', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)' }} 
                      />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 18, color: '#0f172a', lineHeight: 1.2 }}>
                          {getConversationDisplayName(selectedConversation)}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          <span style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%' }} />
                          <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>Đang trực tuyến</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages Stream */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {messages.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Empty description={<span style={{ color: '#94a3b8' }}>Chưa có tin nhắn nào trong cuộc hội thoại này</span>} />
                      </div>
                    ) : (
                      messages.map((msg, index) => {
                        const isMe = msg.senderId === user?.id;
                        return (
                          <div
                            key={index}
                            style={{ 
                              display: 'flex', 
                              justifyContent: isMe ? 'flex-end' : 'flex-start',
                              animation: 'fadeIn 0.3s ease-out'
                            }}
                          >
                            <div style={{ maxWidth: '75%' }}>
                              {msg.replyToMessage && (
                                <div style={{ 
                                  padding: '8px 16px', 
                                  background: isMe ? 'rgba(22, 163, 74, 0.1)' : '#f1f5f9',
                                  borderLeft: '4px solid #16a34a',
                                  borderRadius: '12px 12px 0 0',
                                  fontSize: 12,
                                  color: '#64748b',
                                  marginBottom: -4,
                                  marginLeft: isMe ? 20 : 0,
                                  marginRight: isMe ? 0 : 20
                                }}>
                                  <div style={{ fontWeight: 700, color: '#16a34a' }}>Đang trả lời:</div>
                                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.replyToMessage}</div>
                                </div>
                              )}
                              
                              <div style={{
                                padding: '12px 20px',
                                borderRadius: isMe ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
                                background: isMe ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' : '#fff',
                                color: isMe ? '#fff' : '#1e293b',
                                boxShadow: isMe ? '0 10px 20px rgba(22, 163, 74, 0.15)' : '0 4px 15px rgba(0,0,0,0.03)',
                                border: isMe ? 'none' : '1px solid #f1f5f9',
                                position: 'relative'
                              }}>
                                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: 15 }}>
                                  {typeof msg.message === 'string' && msg.message.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i) ? (
                                    <img
                                      src={msg.message}
                                      alt="chat-attachment"
                                      style={{ maxWidth: '100%', borderRadius: 16, display: 'block' }}
                                    />
                                  ) : (
                                    msg.message
                                  )}
                                </div>
                                
                                <div style={{ 
                                  marginTop: 8, 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center',
                                  fontSize: 11,
                                  opacity: isMe ? 0.8 : 0.5
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <ClockCircleOutlined />
                                    {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                  <Button 
                                    type="text" 
                                    size="small" 
                                    onClick={() => setReplyingTo(msg)}
                                    style={{ color: isMe ? '#fff' : '#16a34a', padding: '0 4px', height: 'auto', fontSize: 11, fontWeight: 700 }}
                                  >
                                    Trả lời
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Input Component */}
                  <div style={{ padding: '24px', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
                    {replyingTo && (
                      <div style={{ 
                        marginBottom: 16, padding: '12px 16px', background: '#f0fdf4', borderLeft: '4px solid #16a34a', 
                        borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', display: 'block' }}>Đang trả lời tin nhắn:</span>
                          <span style={{ fontSize: 13, color: '#15803d' }} className="truncate block">{replyingTo.message}</span>
                        </div>
                        <Button type="text" shape="circle" icon={<CloseOutlined />} onClick={() => setReplyingTo(null)} style={{ color: '#16a34a' }} />
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                      <Upload accept="image/*" showUploadList={false} beforeUpload={handleSendImage}>
                        <Button 
                          icon={<PictureOutlined />} 
                          style={{ 
                            height: 48, width: 48, borderRadius: 16, border: '1px solid #e2e8f0', 
                            background: '#f8fafc', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                          }} 
                        />
                      </Upload>
                      <Input.TextArea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        placeholder="Nhập nội dung tin nhắn..."
                        autoSize={{ minRows: 1, maxRows: 4 }}
                        style={{ 
                          borderRadius: 20, padding: '12px 20px', border: '1px solid #e2e8f0', 
                          background: '#f8fafc', fontSize: 15 
                        }}
                      />
                      <Button
                        type="primary"
                        icon={<SendOutlined />}
                        loading={loading}
                        onClick={handleSend}
                        style={{
                          height: 48, minWidth: 100, borderRadius: 16, border: 'none',
                          background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                          fontWeight: 700, boxShadow: '0 8px 20px rgba(22, 163, 74, 0.2)'
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
