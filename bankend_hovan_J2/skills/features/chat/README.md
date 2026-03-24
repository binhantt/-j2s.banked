# Features/Chat — Giám sát chat

## Tổng quan
Controller quản lý chat giữa ứng viên và HR. Endpoints tại `/api/chat/**`.

## Nguồn files
```
presentation/chat/
├── ChatController.java              ← Controller
└── dto/
    ├── ConversationDTO.java
    └── ConversationUserSummaryDTO.java

application/chat/
├── CreateConversationUseCase.java
└── SendMessageUseCase.java

domain/chat/
├── entity/ChatMessage.java         ← Entity
├── entity/Conversation.java        ← Entity
└── repository/
    ├── ChatMessageRepository.java
    └── ConversationRepository.java
```

## Nguồn endpoint

| Endpoint | Method | Mô tả |
|----------|--------|--------|
| `/api/chat/conversations` | POST | Tạo cuộc trò chuyện |
| `/api/chat/conversations/hr/{hrId}` | GET | Lấy cuộc trò chuyện theo HR |
| `/api/chat/conversations/job-seeker/{jobSeekerId}` | GET | Lấy cuộc trò chuyện theo UV |
| `/api/chat/conversations/all` | GET | Lấy tất cả cuộc trò chuyện |
| `/api/chat/messages/{conversationId}` | GET | Lấy tin nhắn |
| `/api/chat/messages` | POST | Gửi tin nhắn |
| `/api/chat/messages/read/{conversationId}/{userId}` | PUT | Đánh dấu đã đọc |
| `/api/chat/unread/{conversationId}/{userId}` | GET | Đếm tin chưa đọc |

## Danh sách Skills

| # | Skill | Thư mục |
|---|-------|---------|
| 01 | Xem danh sách cuộc trò chuyện | `01-danh-sach-cuoc-tro-chuyen/` |
| 02 | Xem tin nhắn | `02-xem-tin-nhan/` |
