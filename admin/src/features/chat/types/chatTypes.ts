export interface UserSummary {
  id: number;
  name: string;
  email?: string;
  avatarUrl?: string | null;
  userType?: string;
  isActive?: boolean;
}

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
  totalMessages?: number;
  unreadMessages?: number;
  // Admin-specific full user info
  user?: UserSummary;
}

export interface ChatMessageItem {
  id: number;
  conversationId: number;
  senderId: number;
  senderType: string;
  message: string;
  createdAt: string;
  isRead?: boolean;
  replyToMessageId?: number | null;
  replyToMessage?: string | null;
  sender?: UserSummary;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

