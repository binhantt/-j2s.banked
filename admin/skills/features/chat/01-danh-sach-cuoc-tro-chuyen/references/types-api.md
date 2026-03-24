# Types + API endpoints

## Types
```ts
// src/features/chat/types/chatTypes.ts
export interface ConversationSummary {
  id: number;
  hrId: number;
  jobSeekerId: number;
  jobPostingId?: number;
  hr?: { id: number; name: string };
  jobSeeker?: { id: number; name: string };
  updatedAt: string;
}

export interface ChatMessageItem {
  id: number;
  conversationId: number;
  senderId: number;
  senderType: 'hr' | 'job_seeker';
  message: string;
  createdAt: string;
}
```

## API endpoints

| Hành động | Method | Endpoint |
|-----------|--------|---------|
| Lấy danh sách cuộc trò chuyện | GET | `/chat/conversations/all` |
| Lấy tin nhắn | GET | `/chat/messages/{conversationId}` |
