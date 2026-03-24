export interface ConversationUserSummary {
  id: number;
  name: string;
  avatarUrl?: string | null;
}

export interface ConversationSummary {
  id: number;
  hrId: number;
  jobSeekerId: number;
  jobPostingId?: number | null;
  createdAt: string;
  updatedAt: string;
  hr?: ConversationUserSummary | null;
  jobSeeker?: ConversationUserSummary | null;
}

export interface ChatMessageItem {
  id: number;
  conversationId: number;
  senderId: number;
  senderType: string;
  message: string;
  createdAt: string;
}

