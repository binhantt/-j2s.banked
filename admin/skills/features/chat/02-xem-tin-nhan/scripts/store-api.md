# Store + API — loadMessages

## Store
```ts
// src/features/chat/store/useChatMonitorStore.ts
loadMessages: async (conversationId: number) => {
  set({ loadingMessages: true, error: null });
  try {
    const data = await chatAdminApi.getMessages(conversationId);
    set({ messages: data, loadingMessages: false });
  } catch (error) {
    set({
      loadingMessages: false,
      error: error instanceof Error ? error.message : 'Không tải được tin nhắn',
    });
    throw error;
  }
},

selectConversation: (conv: ConversationSummary | null) => set({ selected: conv }),
```

## API
```ts
// src/features/chat/api/chatAdminApi.ts
async getMessages(conversationId: number): Promise<ChatMessageItem[]> {
  const data = await httpRequest<ChatMessageItem[]>(`/chat/messages/${conversationId}`);
  return data.filter((msg) => isWithinLastDays(msg.createdAt, DAYS_LIMIT));
},
```

## Component — render tin nhắn
```tsx
// src/features/chat/pages/ChatMonitorPage.tsx
const { messages, selected } = useChatMonitorStore();

const isImageUrl = (url: string) => {
  return url.match(/\.(jpeg|jpg|gif|png|webp)$/i)
    || url.includes('firebasestorage.googleapis.com');
};

{messages.map((msg) => (
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
        <Image src={msg.message} alt="sent image"
          style={{ maxWidth: 220, borderRadius: 8, display: 'block' }} />
      ) : (
        <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap', color: 'inherit' }}>
          {msg.message}
        </Paragraph>
      )}
    </div>
  </div>
))}
```

## Layout tổng hợp

| Người gửi | Avatar | Nền bubble | Chữ | Căn | Border-radius |
|-----------|--------|-------------|-----|-----|--------------|
| HR | #e0f2fe + #0284c7 (HR) | #2563eb (xanh dương) | Trắng | Phải | top-right: 4px |
| UV | #dcfce7 + #166534 (UV) | #f3f4f6 (xám) | Đen | Trái | top-left: 4px |
