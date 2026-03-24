import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { chatApi } from '@/lib/chatApi';
import { useAuthStore } from '@/store/useAuthStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { Spin } from 'antd';

function ChatListPageContent() {
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();

  useEffect(() => {
    console.log('[ChatListPage] _hasHydrated:', _hasHydrated, '| user:', user, '| user.id:', user?.id);
    if (_hasHydrated && user?.id) {
      loadAndRedirect();
    }
  }, [_hasHydrated, user?.id]);

  const loadAndRedirect = async () => {
    if (!user?.id) return;
    
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
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: 'calc(100vh - 64px)',
      background: '#f8fafc'
    }}>
      <div style={{ 
        background: '#fff', 
        padding: '40px 60px', 
        borderRadius: 24, 
        boxShadow: '0 20px 50px rgba(15,23,42,0.05)',
        textAlign: 'center'
      }}>
        <Spin 
          size="large" 
          tip={<span style={{ color: '#16a34a', fontWeight: 600, marginTop: 16, display: 'block' }}>Đang kết nối tin nhắn...</span>} 
        />
        <p style={{ color: '#64748b', marginTop: 24 }}>Vui lòng đợi trong giây lát</p>
      </div>
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
