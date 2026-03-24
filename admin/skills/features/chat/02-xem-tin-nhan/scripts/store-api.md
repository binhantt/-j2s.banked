# Store + API — loadMessages (CÓ PHÂN TRANG)

## Store Methods (đã update trong useChatMonitorStore.ts)

```ts
// ========== LOAD MESSAGES (PHÂN TRANG) ==========
loadMessages: async (conversationId: number, page: number = 0, size: number = 50) => {
  set({ loadingMessages: true, error: null });
  try {
    const response = await chatAdminApi.getMessages(conversationId, page, size);

    set({
      messages: response.content,
      totalMessageElements: response.totalElements,
      totalMessagePages: response.totalPages,
      currentMessagePage: response.number,
      loadingMessages: false,
    });
  } catch (error) {
    set({
      loadingMessages: false,
      error: error instanceof Error ? error.message : 'Không tải được tin nhắn',
    });
    throw error;
  }
},

// ========== LOAD THÊM MESSAGES (Load More) ==========
loadMoreMessages: async () => {
  const { selected, currentMessagePage, totalMessagePages, pageSize } = get();

  if (!selected || currentMessagePage >= totalMessagePages - 1) {
    return; // Đã ở trang cuối
  }

  const nextPage = currentMessagePage + 1;
  set({ loadingMessages: true });

  try {
    const response = await chatAdminApi.getMessages(selected.id, nextPage, pageSize);

    // Thêm tin nhắn mới vào cuối (vì backend trả tin cũ trước, ASC)
    set({
      messages: [...get().messages, ...response.content],
      totalMessageElements: response.totalElements,
      totalMessagePages: response.totalPages,
      currentMessagePage: response.number,
      loadingMessages: false,
    });
  } catch (error) {
    set({
      loadingMessages: false,
      error: error instanceof Error ? error.message : 'Không tải được tin nhắn',
    });
  }
},
```

## Component — Tin nhắn với Load More

```tsx
// src/features/chat/pages/ChatMonitorPage.tsx

const MessagePanel = () => {
  const {
    messages,
    totalMessageElements,
    totalMessagePages,
    currentMessagePage,
    loadingMessages,
    loadMoreMessages,
    selected,
  } = useChatMonitorStore();

  // Kiểm tra có thể load thêm
  const canLoadMore = currentMessagePage < totalMessagePages - 1;
  const remainingMessages = totalMessageElements - messages.length;

  // Helper kiểm tra ảnh
  const isImageUrl = (url: string) => {
    return url.match(/\.(jpeg|jpg|gif|png|webp)$/i)
      || url.includes('firebasestorage.googleapis.com');
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <Text strong>
          {selected?.hr?.name} ↔ {selected?.jobSeeker?.name}
        </Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>
          {totalMessageElements} tin nhắn
        </Text>
      </div>

      {/* Nút Load More */}
      {canLoadMore && (
        <div style={{ textAlign: 'center', padding: '12px' }}>
          <Button
            type="link"
            loading={loadingMessages}
            onClick={() => void loadMoreMessages()}
            icon={<DownOutlined />}
          >
            Xem thêm {remainingMessages} tin nhắn cũ hơn
          </Button>
        </div>
      )}

      {/* Danh sách tin nhắn */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {loadingMessages && messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin />
          </div>
        ) : messages.length === 0 ? (
          <Empty description="Chưa có tin nhắn" />
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                marginBottom: 20,
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.senderType === 'hr' ? 'flex-end' : 'flex-start',
              }}
            >
              {/* Header: Avatar + Tên + Thời gian */}
              <div style={{
                marginBottom: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexDirection: msg.senderType === 'hr' ? 'row-reverse' : 'row',
              }}>
                <Avatar size="small"
                  style={{
                    backgroundColor: msg.senderType === 'hr' ? '#e0f2fe' : '#dcfce7',
                    color: msg.senderType === 'hr' ? '#0284c7' : '#166534',
                    fontSize: 11
                  }}>
                  {msg.senderType === 'hr' ? 'HR' : 'UV'}
                </Avatar>
                <Text style={{ fontSize: 13, fontWeight: 500 }}>
                  {msg.senderType === 'hr'
                    ? (selected?.hr?.name || `HR #${msg.senderId}`)
                    : (selected?.jobSeeker?.name || `Ứng viên #${msg.senderId}`)}
                </Text>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {new Date(msg.createdAt).toLocaleString('vi-VN')}
                </Text>
              </div>

              {/* Nội dung tin nhắn */}
              <div style={{
                padding: '10px 14px',
                borderRadius: 18,
                borderTopLeftRadius: msg.senderType !== 'hr' ? 4 : 18,
                borderTopRightRadius: msg.senderType === 'hr' ? 4 : 18,
                background: msg.senderType === 'hr' ? '#2563eb' : '#f3f4f6',
                color: msg.senderType === 'hr' ? '#ffffff' : '#1f2937',
                maxWidth: '85%',
              }}>
                {isImageUrl(msg.message) ? (
                  <Image
                    src={msg.message}
                    alt="sent image"
                    style={{ maxWidth: 220, borderRadius: 8, display: 'block' }}
                  />
                ) : (
                  <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap', color: 'inherit' }}>
                    {msg.message}
                  </Paragraph>
                )}

                {/* Reply indicator */}
                {msg.replyToMessage && (
                  <div style={{
                    fontSize: 12,
                    opacity: 0.8,
                    borderLeft: '2px solid currentColor',
                    paddingLeft: 8,
                    marginBottom: 4,
                  }}>
                    ↩ {msg.replyToMessage}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
```

## Layout tổng hợp

| Người gửi | Avatar | Nền bubble | Chữ | Căn | Border-radius |
|-----------|--------|------------|-----|-----|--------------|
| HR | #e0f2fe + #0284c7 (HR) | #2563eb (xanh dương) | Trắng | Phải | top-right: 4px |
| UV | #dcfce7 + #166534 (UV) | #f3f4f6 (xám) | Đen | Trái | top-left: 4px |

## Lưu ý
- Tin nhắn được sắp xếp ASC (cũ → mới) từ backend
- Load More: thêm tin cũ vào cuối mảng (phía trên giao diện)
- Nút "Xem thêm" hiển thị ở trên cùng, gần tin nhắn cũ nhất
- `remainingMessages = totalMessageElements - messages.length`
