# SK-02: Xem tin nhắn

## Mô tả ngắn
Hiển thị tin nhắn của cuộc trò chuyện đang chọn. Tin nhắn HR bên phải (nền xanh dương), tin nhắn UV bên trái (nền xám). Hỗ trợ hiển thị ảnh.

## Nguồn dữ liệu
- **Store:** `useChatMonitorStore.loadMessages(conversationId)`
- **API:** `chatAdminApi.getMessages(conversationId)` → `GET /chat/messages/{conversationId}`

## Luồng chính

```
User chọn cuộc trò chuyện (conv)
→ handleSelectConversation(conv)
→ selectConversation(conv) → set({ selected: conv })
→ loadMessages(conv.id) → GET /chat/messages/{conversationId}
→ filter 30 ngày → set({ messages, loadingMessages: false })
→ Render tin nhắn
```

## Tác vụ
- [x] Load tin nhắn khi chọn cuộc trò chuyện
- [x] Hiển thị: nội dung, người gửi, thời gian
- [x] Hỗ trợ hiển thị ảnh (URL ảnh)
- [x] Filter chỉ 30 ngày

## Layout hiển thị

```
HR: [bubble xanh dương, căn phải]  ← avatar HR + thời gian
UV: [bubble xám, căn trái]         ← avatar UV + thời gian
```

| Người gửi | Nền bubble | Chữ | Căn |
|-----------|-----------|-----|-----|
| HR | #2563eb (xanh dương) | Trắng | Phải |
| UV | #f3f4f6 (xám) | Đen | Trái |

## Cách sử dụng code trong thư mục

### `scripts/`
- Đoạn code render tin nhắn
- Logic `isImageUrl()` kiểm tra ảnh
- Layout flex: HR → `flex-end`, UV → `flex-start`

### `references/`
- Types: `ChatMessageItem`
- API endpoint: GET /chat/messages/{conversationId}
- Filter 30 ngày

## Ràng buộc
- Ảnh: maxWidth=220px, borderRadius=8
- Border-radius bubble: bo góc đối diện người gửi
- Empty: "Chọn một cuộc trò chuyện..." hoặc "Chưa có tin nhắn trong 30 ngày"
