import { api } from './api';
import { companyApi } from './companyApi';
import { userApi } from './userApi';

const enrichConversation = async (conversation: any) => {
  const enriched = { ...conversation };

  const [companyResult, jobSeekerResult] = await Promise.allSettled([
    conversation?.hrId ? companyApi.getCompanyBasicInfoByHrId(conversation.hrId) : Promise.resolve(null),
    conversation?.jobSeekerId ? userApi.getUser(conversation.jobSeekerId) : Promise.resolve(null),
  ]);

  if (companyResult.status === 'fulfilled' && companyResult.value) {
    enriched.companyName = companyResult.value.name;
    enriched.hrCompanyName = companyResult.value.name;
  }

  if (jobSeekerResult.status === 'fulfilled' && jobSeekerResult.value) {
    enriched.jobSeekerName =
      jobSeekerResult.value.fullName ||
      jobSeekerResult.value.name ||
      jobSeekerResult.value.username ||
      conversation.jobSeekerName;
    enriched.jobSeekerFullName = enriched.jobSeekerName;
  }

  return enriched;
};

const enrichConversations = async (conversations: any[]) => {
  if (!Array.isArray(conversations)) {
    console.warn('enrichConversations: conversations is not an array', conversations);
    return [];
  }
  return Promise.all(conversations.map((conversation) => enrichConversation(conversation)));
};

export const chatApi = {
  // Get conversations
  getJobSeekerConversations: async (userId: number) => {
    const response = await api.get(`/api/chat/conversations/job-seeker/${userId}`);
    // Backend returns PagedResponse: { content: [...], totalElements, ... }
    const page = response.data;
    return enrichConversations(Array.isArray(page) ? page : (page?.content ?? []));
  },

  getHRConversations: async (userId: number) => {
    const response = await api.get(`/api/chat/conversations/hr/${userId}`);
    // Backend returns PagedResponse: { content: [...], totalElements, ... }
    const page = response.data;
    return enrichConversations(Array.isArray(page) ? page : (page?.content ?? []));
  },

  getAllConversations: async () => {
    const response = await api.get('/api/chat/conversations/all');
    // Backend returns PagedResponse: { content: [...], totalElements, ... }
    const page = response.data;
    return enrichConversations(Array.isArray(page) ? page : (page?.content ?? []));
  },

  // Create conversation
  createConversation: async (data: any) => {
    const response = await api.post('/api/chat/conversations', data);
    return response.data;
  },

  // Messages
  getMessages: async (conversationId: number) => {
    const response = await api.get(`/api/chat/messages/${conversationId}`);
    // Backend returns PagedResponse: { content: [...], totalElements, ... }
    const page = response.data;
    return Array.isArray(page) ? page : (page?.content ?? []);
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
