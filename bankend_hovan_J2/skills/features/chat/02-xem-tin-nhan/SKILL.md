# CH-02: Xem tin nhắn

## Mô tả ngắn
Lấy danh sách tin nhắn của một cuộc trò chuyện, sắp xếp theo thời gian.

## Endpoint
```
GET /api/chat/messages/{conversationId}
```

## Luồng xử lý

```
GET /api/chat/messages/{conversationId}
→ messageRepository.findByConversationId(conversationId)
  → (JPA query: findByConversationIdOrderByCreatedAtAsc)
→ List<ChatMessage> (Entity trực tiếp, không map DTO)
→ ResponseEntity.ok(list)
```

## Tác vụ
- [x] Lấy tin nhắn theo conversationId
- [x] Sắp xếp theo createdAt ASC
- [x] Trả về List<ChatMessage> (Entity, không cần map)

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: GET /api/chat/messages/{conversationId}
- Repository: ChatMessageRepository.findByConversationId()

### `references/`
- Entity: ChatMessage
- Repository: ChatMessageRepository
- Fields: id, conversationId, senderId, senderType, message, isRead, replyToMessageId, replyToMessage, createdAt

## Ràng buộc
- Trả về Entity trực tiếp, không map sang DTO
- Không filter 30 ngày ở backend — frontend tự filter
