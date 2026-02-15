import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { chatApi } from '@/lib/chatApi';
import { useAuthStore } from '@/store/useAuthStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { Spin } from 'antd';

function ChatListPageContent() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.id) {
      loadAndRedirect();
    }
  }, [user?.id]);

  const loadAndRedirect = async () => {
    try {
      let data;
      if (user?.userType === 'hr') {
        data = await chatApi.getHRConversations(user.id);
      } else {
        data = await chatApi.getJobSeekerConversations(user.id);
      }
      
      if (data && data.length > 0) {
        // Redirect to first conversation
        router.replace(`/chat/${data[0].id}`);
      } else {
        // No conversations, stay on /chat page
        router.replace('/chat/0');
      }
    } catch (error) {
      console.error('Load conversations error:', error);
      router.replace('/chat/0');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: 'calc(100vh - 64px)' 
    }}>
      <Spin size="large" tip="Đang tải tin nhắn..." />
    </div>
  );
}

export default function ChatListPage() {
  return (
    <MainLayout>
      <ChatListPageContent />
    </MainLayout>
  );
}
