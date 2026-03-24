# SK-01: Xem danh sách cuộc trò chuyện

## Mô tả ngắn
Lấy và hiển thị danh sách cuộc trò chuyện giữa ứng viên và HR trong 30 ngày gần nhất. Auto-select cuộc trò chuyện đầu tiên khi load xong.

## Nguồn dữ liệu
- **Store:** `useChatMonitorStore.loadConversations()`
- **API:** `chatAdminApi.getConversations()` → `GET /chat/conversations/all`

## Luồng chính

```
Page mount → loadConversations()
→ GET /chat/conversations/all → filter 30 ngày
→ set({ conversations, loadingConversations: false })

→ Auto-select dòng đầu: selected = conversations[0]
→ loadMessages(selected.id) → hiển thị tin nhắn
```

## Tác vụ
- [x] Tải danh sách cuộc trò chuyện (chỉ 30 ngày)
- [x] Auto-select cuộc đầu tiên
- [x] Chọn cuộc trò chuyện → hiển thị tin nhắn bên phải

## Giao diện cột trái
- Card: "Cuộc trò chuyện (30 ngày gần nhất)"
- Mỗi dòng: conv ID, HR name (Avatar HR), Ứng viên name (Avatar UV), Job tag, thời gian update
- Selected state: nền xanh lá nhạt + border xanh

## Cách sử dụng code trong thư mục

### `scripts/`
- Đoạn code gọi store từ component
- Filter 30 ngày trong API

### `references/`
- Types: `ConversationSummary`
- API endpoint: GET /chat/conversations/all
- Filter logic: `isWithinLastDays(conv.updatedAt, 30)`

## Ràng buộc
- Chỉ hiển thị cuộc trò chuyện được update trong 30 ngày
- Auto-select dòng đầu → hiển thị tin nhắn ngay
- Danh sách rỗng → Empty state
