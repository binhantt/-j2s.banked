# CH-02: Xem tin nhắn (CÓ PHÂN TRANG)

## Mô tả ngắn
Lấy danh sách tin nhắn của một cuộc trò chuyện với phân trang, sắp xếp theo thời gian.

## Endpoint (MỚI - Có phân trang)
```
GET /api/chat/messages/{conversationId}?page=0&size=50
```

| Tham số | Kiểu | Mặc định | Mô tả |
|---------|------|----------|-------|
| `page` | int | 0 | Số trang (0-indexed) |
| `size` | int | 50 | Số tin nhắn/trang |

## Luồng xử lý

```
GET /api/chat/messages/{conversationId}?page=0&size=50
→ Pageable: page, size, sort by createdAt ASC
→ messageRepository.findByConversationId(conversationId, pageable)
  → Page<ChatMessage>
→ ResponseEntity.ok(page)
```

## Response (Page<ChatMessage>)

```json
{
  "content": [
    {
      "id": 1,
      "conversationId": 10,
      "senderId": 5,
      "senderType": "hr",
      "message": "Xin chào, bạn đã apply vào vị trí IT Manager",
      "isRead": true,
      "replyToMessageId": null,
      "replyToMessage": null,
      "createdAt": "2024-02-15T09:30:00"
    },
    {
      "id": 2,
      "conversationId": 10,
      "senderId": 8,
      "senderType": "job_seeker",
      "message": "Dạ vâng, em đã nhận được thông báo",
      "isRead": true,
      "replyToMessageId": 1,
      "replyToMessage": "Xin chào, bạn đã apply...",
      "createdAt": "2024-02-15T09:35:00"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 50,
    "sort": { "direction": "ASC", "property": "createdAt" }
  },
  "totalElements": 234,
  "totalPages": 5,
  "first": true,
  "last": false,
  "size": 50,
  "number": 0,
  "numberOfElements": 50
}
```

## Tác vụ
- [x] Lấy tin nhắn theo conversationId với phân trang
- [x] Sắp xếp theo createdAt ASC (cũ nhất trước)
- [x] Trả về Page<ChatMessage>

## Endpoint cũ (Legacy - giữ lại tương thích ngược)
```
GET /api/chat/messages/{conversationId}/legacy
```
→ Trả về `List<ChatMessage>` (không phân trang)

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: GET /api/chat/messages/{conversationId} với Pageable params
- Repository: `findByConversationId(conversationId, pageable)`

### `references/`
- Entity: ChatMessage
- Repository: ChatMessageRepository
- Fields: id, conversationId, senderId, senderType, message, isRead, replyToMessageId, replyToMessage, createdAt

## Ràng buộc
- Trả về Entity trực tiếp, không map sang DTO
- Sắp xếp: createdAt ASC (cũ nhất lên đầu - phù hợp chat thông thường)
- Page index: 0-based (page=0 là trang đầu tiên)
- KHÔNG filter 30 ngày ở backend
