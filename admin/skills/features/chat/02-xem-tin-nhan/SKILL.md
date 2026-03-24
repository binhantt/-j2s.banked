# SK-02: Xem tin nhắn (CÓ PHÂN TRANG)

## Mô tả ngắn
Hiển thị tin nhắn của cuộc trò chuyện đang chọn với phân trang. Tin nhắn HR bên phải (nền xanh dương), tin nhắn UV bên trái (nền xám). Hỗ trợ hiển thị ảnh.

## Nguồn dữ liệu
- **Store:** `useChatMonitorStore.loadMessages(conversationId, page, size)`
- **API:** `chatAdminApi.getMessages(conversationId, page, size)` → `GET /chat/messages/{conversationId}?page=0&size=50`

## Luồng chính

```
User chọn cuộc trò chuyện (conv)
→ handleSelectConversation(conv)
→ selectConversation(conv) → set({ selected: conv, messages: [] })
→ loadMessages(conv.id, 0, 50) → GET /chat/messages/{conversationId}?page=0&size=50
→ Response: Page<ChatMessage>
  {
    content: [...],
    totalElements: 234,
    totalPages: 5,
    number: 0,
    size: 50
  }
→ set({ messages: content, totalMessageElements, totalMessagePages, ... })
→ Render tin nhắn
```

## Tác vụ
- [x] Load tin nhắn khi chọn cuộc trò chuyện (có phân trang)
- [x] Hiển thị: nội dung, người gửi, thời gian
- [x] Hỗ trợ hiển thị ảnh (URL ảnh)
- [x] Nút "Xem thêm tin nhắn" để load tin nhắn cũ hơn
- [x] Hiển thị số tin nhắn còn lại

## Layout hiển thị

```
HR: [bubble xanh dương, căn phải]  ← avatar HR + thời gian
UV: [bubble xám, căn trái]         ← avatar UV + thời gian
```

| Người gửi | Nền bubble | Chữ | Căn |
|-----------|-----------|-----|-----|
| HR | #2563eb (xanh dương) | Trắng | Phải |
| UV | #f3f4f6 (xám) | Đen | Trái |

## Nút "Xem thêm tin nhắn"

```
┌─────────────────────────────────┐
│    [ Xem thêm tin nhắn ]        │  ← Button ở trên cùng
│    (150 tin nhắn cũ hơn)        │
├─────────────────────────────────┤
│  ┌─────────────────────────┐    │
│  │ Tin nhắn cũ nhất       │    │
│  └─────────────────────────┘    │
│              ...                 │
│  ┌─────────────────────────┐    │
│  │ Tin nhắn mới nhất       │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

## Cách sử dụng code trong thư mục

### `scripts/`
- Store: `loadMessages(conversationId, page, size)`, `loadMoreMessages()`
- API: `chatAdminApi.getMessages(conversationId, page, size)`
- Component: Button "Xem thêm tin nhắn"

### `references/`
- Types: `ChatMessageItem`, `MessagePageResponse`
- API endpoint: `GET /chat/messages/{conversationId}?page=0&size=50`

## Ràng buộc
- Ảnh: maxWidth=220px, borderRadius=8
- Border-radius bubble: bo góc đối diện người gửi
- Load more: hiển thị ở trên cùng, thêm tin vào cuối mảng
- Empty: "Chọn một cuộc trò chuyện..." hoặc "Chưa có tin nhắn"
- KHÔNG filter 30 ngày ở frontend (backend đã filter ở conversations)
