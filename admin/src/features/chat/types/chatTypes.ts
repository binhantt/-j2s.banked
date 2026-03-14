export interface ConversationSummary {
  id: number;
  hrId: number;
  jobSeekerId: number;
  jobPostingId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageItem {
  id: number;
  conversationId: number;
  senderId: number;
  senderType: string;
  message: string;
  createdAt: string;
}

