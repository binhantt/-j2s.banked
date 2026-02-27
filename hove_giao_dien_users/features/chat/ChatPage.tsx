import { useState, useEffect, useRef } from 'react';
import { Input, Button, Avatar, message, Badge, Empty, Tooltip } from 'antd';
import {
  SendOutlined,
  UserOutlined,
  MessageOutlined,
  SearchOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { chatApi } from '@/lib/chatApi';
import { useAuthStore } from '@/store/useAuthStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { COLORS } from '@/lib/constants';

function ChatPageContent() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const router = useRouter();
  const { user } = useAuthStore();
  const { id } = router.query;

  useEffect(() => {
    if (user?.id) {
      loadConversations();
    }
  }, [user?.id]);

  useEffect(() => {
    if (id && conversations.length > 0) {
      const conv = conversations.find((c) => c.id === Number(id));
      if (conv) {
        setSelectedConversation(conv);
        loadMessages(Number(id), true); // Mark as read on initial load
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
    try {
      let data;
      if (user?.userType === 'hr') {
        data = await chatApi.getHRConversations(user.id);
      } else {
        data = await chatApi.getJobSeekerConversations(user.id);
      }
      setConversations(data);
    } catch (error) {
      console.error('Load conversations error:', error);
    }
  };

  const loadMessages = async (conversationId: number, shouldMarkAsRead = false) => {
    try {
      const data = await chatApi.getMessages(conversationId);
      setMessages(data);

      // Only mark as read when explicitly requested, not on every poll
      if (shouldMarkAsRead && user?.id) {
        await chatApi.markAsRead(conversationId, user.id);
      }
    } catch (error) {
      console.error('Load messages error:', error);
    }
  };

  const handleSelectConversation = (conv: any, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedConversation(conv);
    router.push(`/chat/${conv.id}`, undefined, { shallow: true, scroll: false });
    loadMessages(conv.id, true); // Mark as read when selecting conversation
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setLoading(true);
    try {
      await chatApi.sendMessage({
        conversationId: selectedConversation.id,
        senderId: user?.id,
        senderType: user?.userType,
        message: newMessage,
      });

      setNewMessage('');
      await loadMessages(selectedConversation.id, false); // Don't mark as read when sending
    } catch (error) {
      message.error('Không thể gửi tin nhắn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        height: 'calc(100vh - 160px)', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        borderRadius: '16px',
        overflow: 'hidden',
        backgroundColor: '#fff'
      }}>
        {/* Left Sidebar - Conversations List */}
        <div style={{ 
          width: '360px', 
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fff'
        }}>
          {/* Header */}
          <div style={{ 
            padding: '20px',
            background: COLORS.gradient,
            flexShrink: 0
          }}>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ 
                fontSize: '20px',
                fontWeight: 'bold',
                color: COLORS.white,
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <MessageOutlined style={{ fontSize: '24px' }} />
                Tin nhắn
              </h2>
            </div>
            <div style={{ position: 'relative' }}>
              <SearchOutlined style={{ 
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '16px'
              }} />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  borderRadius: '24px',
                  border: 'none',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Conversations List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <Empty
                  description={
                    <span style={{ color: COLORS.grayText }}>
                      {user?.userType === 'hr'
                        ? 'Chưa có cuộc trò chuyện nào'
                        : 'Chưa có tin nhắn nào'}
                    </span>
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            ) : (
              conversations.map((conv: any) => {
                const isSelected = selectedConversation?.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? COLORS.hoverBg : 'transparent',
                      borderLeft: isSelected ? `4px solid ${COLORS.primary}` : '4px solid transparent',
                      transition: 'all 0.2s'
                    }}
                    onClick={(e) => handleSelectConversation(conv, e)}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <Badge dot={false}>
                      <Avatar
                        icon={<UserOutlined />}
                        size={48}
                        style={{ 
                          background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #14b8a6 100%)'
                        }}
                      />
                    </Badge>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '4px'
                      }}>
                        <h3 style={{ 
                          fontWeight: 600,
                          color: '#111827',
                          margin: 0,
                          fontSize: '15px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {user?.userType === 'hr'
                            ? `Ứng viên #${conv.jobSeekerId}`
                            : `HR #${conv.hrId}`}
                        </h3>
                        <span style={{ 
                          fontSize: '11px',
                          color: '#9ca3af',
                          flexShrink: 0
                        }}>
                          {new Date(conv.updatedAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p style={{ 
                        fontSize: '13px',
                        color: '#6b7280',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {conv.jobPostingId ? `Tin #${conv.jobPostingId}` : 'Chat chung'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side - Chat Messages */}
        <div style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f9fafb'
        }}>
          {!selectedConversation ? (
            <div style={{ 
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  margin: '0 auto 24px',
                  background: 'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MessageOutlined style={{ fontSize: '56px', color: '#3b82f6' }} />
                </div>
                <h3 style={{ 
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '8px'
                }}>
                  Chào mừng đến với Tin nhắn
                </h3>
                <p style={{ color: '#6b7280', fontSize: '15px' }}>
                  Chọn một cuộc trò chuyện để bắt đầu nhắn tin
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div style={{ 
                padding: '16px 24px',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                flexShrink: 0
              }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Avatar
                      icon={<UserOutlined />}
                      size={44}
                      style={{ 
                        background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #14b8a6 100%)'
                      }}
                    />
                    <div>
                      <h3 style={{ 
                        fontWeight: 'bold',
                        color: '#111827',
                        margin: 0,
                        fontSize: '16px'
                      }}>
                        {user?.userType === 'hr'
                          ? `Ứng viên #${selectedConversation.jobSeekerId}`
                          : `HR #${selectedConversation.hrId}`}
                      </h3>
                      <p style={{ 
                        fontSize: '13px',
                        color: '#10b981',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span style={{ 
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#10b981',
                          borderRadius: '50%',
                          display: 'inline-block'
                        }}></span>
                        Đang hoạt động
                      </p>
                    </div>
                  </div>
                  <Tooltip title="Tùy chọn">
                    <Button type="text" icon={<MoreOutlined />} size="large" />
                  </Tooltip>
                </div>
              </div>

              {/* Messages Area */}
              <div style={{ 
                flex: 1,
                overflowY: 'auto',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                {messages.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center',
                    color: '#9ca3af',
                    marginTop: '80px'
                  }}>
                    <MessageOutlined style={{ fontSize: '48px', marginBottom: '12px' }} />
                    <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
                  </div>
                ) : (
                  messages.map((msg: any, index) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: isMe ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          maxWidth: '70%',
                          flexDirection: isMe ? 'row-reverse' : 'row'
                        }}>
                          {!isMe && (
                            <Avatar
                              icon={<UserOutlined />}
                              size={32}
                              style={{ 
                                background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                                flexShrink: 0
                              }}
                            />
                          )}
                          <div>
                            <div style={{
                              padding: '12px 16px',
                              borderRadius: '16px',
                              background: isMe 
                                ? 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #14b8a6 100%)'
                                : '#fff',
                              color: isMe ? '#fff' : '#111827',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                              borderBottomRightRadius: isMe ? '4px' : '16px',
                              borderBottomLeftRadius: isMe ? '16px' : '4px'
                            }}>
                              <p style={{ 
                                margin: 0,
                                fontSize: '14px',
                                lineHeight: '1.5'
                              }}>
                                {msg.message}
                              </p>
                            </div>
                            <p style={{
                              fontSize: '11px',
                              color: '#9ca3af',
                              margin: '4px 0 0',
                              textAlign: isMe ? 'right' : 'left'
                            }}>
                              {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input Area */}
              <div style={{ 
                padding: '16px 24px',
                backgroundColor: '#fff',
                borderTop: '1px solid #e5e7eb',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <Input.TextArea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onPressEnter={(e) => {
                        if (!e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Nhập tin nhắn... (Shift + Enter để xuống dòng)"
                      autoSize={{ minRows: 1, maxRows: 4 }}
                      style={{
                        borderRadius: '24px',
                        padding: '12px 20px',
                        fontSize: '14px',
                        resize: 'none'
                      }}
                    />
                  </div>
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSend}
                    loading={loading}
                    size="large"
                    style={{
                      height: '48px',
                      padding: '0 24px',
                      borderRadius: '24px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #14b8a6 100%)',
                      border: 'none',
                      fontWeight: 600
                    }}
                  >
                    Gửi
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
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
