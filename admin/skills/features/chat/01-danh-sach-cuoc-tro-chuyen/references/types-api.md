# Types + API endpoints (CÓ PHÂN TRANG)

## Types

```ts
// src/features/chat/types/chatTypes.ts

// --- Conversation ---
export interface ConversationSummary {
  id: number;
  hrId: number;
  jobSeekerId: number;
  jobPostingId?: number;
  hr?: { id: number; name: string };
  jobSeeker?: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
}

// Response phân trang cho danh sách cuộc trò chuyện
export interface ConversationPageResponse {
  content: ConversationSummary[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      direction: 'ASC' | 'DESC';
      property: string;
    };
  };
  totalElements: number;  // Tổng số cuộc trò chuyện
  totalPages: number;     // Tổng số trang
  first: boolean;
  last: boolean;
  size: number;
  number: number;
  numberOfElements: number;
}

// Params cho API phân trang
export interface ConversationPaginationParams {
  page?: number;       // Mặc định: 0
  size?: number;       // Mặc định: 20
  daysLimit?: number;  // Mặc định: 30
}

// Store state cho conversations
export interface ConversationState {
  conversations: ConversationSummary[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  loadingConversations: boolean;
  selected: ConversationSummary | null;
  error: string | null;
}

// --- Messages ---
export interface ChatMessageItem {
  id: number;
  conversationId: number;
  senderId: number;
  senderType: 'hr' | 'job_seeker';
  message: string;
  isRead: boolean;
  replyToMessageId?: number;
  replyToMessage?: string;
  createdAt: string;
}

// Response phân trang cho tin nhắn
export interface MessagePageResponse {
  content: ChatMessageItem[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      direction: 'ASC' | 'DESC';
      property: string;
    };
  };
  totalElements: number;  // Tổng số tin nhắn
  totalPages: number;     // Tổng số trang
  first: boolean;
  last: boolean;
  size: number;
  number: number;
  numberOfElements: number;
}

// Store state cho messages
export interface MessageState {
  messages: ChatMessageItem[];
  totalMessageElements: number;
  totalMessagePages: number;
  currentMessagePage: number;
  pageSize: number;
  loadingMessages: boolean;
  error: string | null;
}
```

## API endpoints (CÓ PHÂN TRANG)

| Hành động | Method | Endpoint | Params |
|-----------|--------|----------|--------|
| Lấy danh sách cuộc trò chuyện (phân trang) | GET | `/chat/conversations/all` | `?page=0&size=20&daysLimit=30` |
| Lấy danh sách cuộc trò chuyện (legacy) | GET | `/chat/conversations/all/legacy` | - |
| Lấy tin nhắn (phân trang) | GET | `/chat/messages/{conversationId}` | `?page=0&size=50` |
| Lấy tin nhắn (legacy) | GET | `/chat/messages/{conversationId}/legacy` | - |

## Ví dụ Response

### Danh sách cuộc trò chuyện (Page 0, Size 20)
```json
{
  "content": [
    {
      "id": 1,
      "hrId": 10,
      "jobSeekerId": 20,
      "jobPostingId": 5,
      "hr": { "id": 10, "name": "Nguyễn Văn A", "avatarUrl": null },
      "jobSeeker": { "id": 20, "name": "Trần Thị B", "avatarUrl": null },
      "createdAt": "2024-01-15T10:30:00",
      "updatedAt": "2024-02-20T14:25:00"
    }
  ],
  "pageable": { "pageNumber": 0, "pageSize": 20 },
  "totalElements": 150,
  "totalPages": 8,
  "first": true,
  "last": false
}
```

### Tin nhắn (Page 0, Size 50)
```json
{
  "content": [
    {
      "id": 1,
      "conversationId": 10,
      "senderId": 5,
      "senderType": "hr",
      "message": "Xin chào",
      "isRead": true,
      "createdAt": "2024-02-15T09:30:00"
    }
  ],
  "pageable": { "pageNumber": 0, "pageSize": 50 },
  "totalElements": 234,
  "totalPages": 5,
  "first": true,
  "last": false
}
```
