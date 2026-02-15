import React, { useState, useEffect } from 'react';
import { Card, List, Badge, Avatar } from 'antd';
import { MessageOutlined, UserOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { chatApi } from '@/lib/chatApi';
import { useAuthStore } from '@/store/useAuthStore';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.id) {
      loadConversations();
    }
  }, [user?.id]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      let data;
      if (user?.userType === 'hr') {
        data = await chatApi.getHRConversations(user.id);
      } else if (user?.userType === 'admin') {
        data = await chatApi.getAllConversations();
      } else {
        data = await chatApi.getJobSeekerConversations(user.id);
      }
      setConversations(data);
    } catch (error) {
      console.error('Load conversations error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 20px' }}>
      <Card title="Tin nhắn">
        <List
          loading={loading}
          dataSource={conversations}
          renderItem={(conv: any) => (
            <List.Item
              style={{ cursor: 'pointer' }}
              onClick={() => router.push(`/chat/${conv.id}`)}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={`Công việc #${conv.jobPostingId}`}
                description={`Cập nhật: ${new Date(conv.updatedAt).toLocaleString('vi-VN')}`}
              />
              <MessageOutlined style={{ fontSize: 20 }} />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
