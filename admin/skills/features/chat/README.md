# Features/Chat — Giám sát chat

## Tổng quan
Trang giám sát chat giữa ứng viên và HR. Chỉ hiển thị cuộc trò chuyện và tin nhắn trong **30 ngày gần nhất**.

Giao diện chia 2 cột:
- **Cột trái (320px):** Danh sách cuộc trò chuyện
- **Cột phải (1fr):** Chi tiết tin nhắn

## Nguồn files
```
src/features/chat/
├── types/chatTypes.ts           ← ChatMessageItem, ConversationSummary
├── api/chatAdminApi.ts          ← API calls
├── store/useChatMonitorStore.ts  ← Zustand store
└── pages/ChatMonitorPage.tsx    ← Giao diện
```

## Danh sách Skills

| # | Skill | Thư mục |
|---|-------|---------|
| 01 | Xem danh sách cuộc trò chuyện | `01-danh-sach-cuoc-tro-chuyen/` |
| 02 | Xem tin nhắn | `02-xem-tin-nhan/` |
