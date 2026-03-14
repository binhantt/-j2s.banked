import { httpRequest } from '../../../shared/api/httpClient';
import type { ChatMessageItem, ConversationSummary } from '../types/chatTypes';

const DAYS_LIMIT = 30;

function isWithinLastDays(dateString: string | null | undefined, days: number): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= days;
}

export const chatAdminApi = {
  async getConversations(): Promise<ConversationSummary[]> {
    const data = await httpRequest<ConversationSummary[]>('/chat/conversations/all');
    return data.filter((conv) => isWithinLastDays(conv.updatedAt, DAYS_LIMIT));
  },

  async getMessages(conversationId: number): Promise<ChatMessageItem[]> {
    const data = await httpRequest<ChatMessageItem[]>(`/chat/messages/${conversationId}`);
    return data.filter((msg) => isWithinLastDays(msg.createdAt, DAYS_LIMIT));
  },
};

