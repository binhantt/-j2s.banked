import { httpRequest } from '../../../shared/api/httpClient';
import type { ChatMessageItem, ConversationSummary, PagedResponse } from '../types/chatTypes';

const API_BASE_URL = 'http://localhost:8080/api';

function buildPageParams(page: number, size: number): string {
  return `?page=${page}&size=${size}`;
}

export const chatAdminApi = {
  // 1. Danh sách tất cả cuộc trò chuyện (admin endpoint)
  async getConversations(
    page = 0,
    size = 20,
    sortBy = 'updatedAt',
    sortDir = 'desc',
  ): Promise<PagedResponse<ConversationSummary>> {
    return httpRequest<PagedResponse<ConversationSummary>>(
      `/admin/chat/conversations?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
    );
  },

  // 2. Xem lịch sử tin nhắn của 1 cuộc trò chuyện (admin endpoint)
  async getMessages(conversationId: number, page = 0, size = 50): Promise<PagedResponse<ChatMessageItem>> {
    return httpRequest<PagedResponse<ChatMessageItem>>(
      `/admin/chat/conversations/${conversationId}/messages?page=${page}&size=${size}`
    );
  },

  // 3. Tìm kiếm cuộc trò chuyện theo user (admin endpoint)
  async searchConversations(
    userId: number,
    page = 0,
    size = 20,
  ): Promise<PagedResponse<ConversationSummary>> {
    return httpRequest<PagedResponse<ConversationSummary>>(
      `/admin/chat/conversations/search?userId=${userId}&page=${page}&size=${size}`
    );
  },
};

