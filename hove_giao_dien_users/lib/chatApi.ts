import { api } from './api';

export const chatApi = {
  // Get conversations
  getJobSeekerConversations: async (userId: number) => {
    const response = await api.get(`/api/chat/conversations/job-seeker/${userId}`);
    return response.data;
  },

  getHRConversations: async (userId: number) => {
    const response = await api.get(`/api/chat/conversations/hr/${userId}`);
    return response.data;
  },

  getAllConversations: async () => {
    const response = await api.get('/api/chat/conversations/all');
    return response.data;
  },

  // Create conversation
  createConversation: async (data: any) => {
    const response = await api.post('/api/chat/conversations', data);
    return response.data;
  },

  // Messages
  getMessages: async (conversationId: number) => {
    const response = await api.get(`/api/chat/messages/${conversationId}`);
    return response.data;
  },

  sendMessage: async (data: any) => {
    const response = await api.post('/api/chat/messages', data);
    return response.data;
  },

  markAsRead: async (conversationId: number, userId: number) => {
    await api.put(`/api/chat/messages/read/${conversationId}/${userId}`);
  },

  getUnreadCount: async (conversationId: number, userId: number) => {
    const response = await api.get(`/api/chat/unread/${conversationId}/${userId}`);
    return response.data;
  },
};
