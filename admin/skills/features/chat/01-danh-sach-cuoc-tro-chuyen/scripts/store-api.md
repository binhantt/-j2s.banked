# Store + API — loadConversations

## Store
```ts
// src/features/chat/store/useChatMonitorStore.ts
loadConversations: async () => {
  set({ loadingConversations: true, error: null });
  try {
    const data = await chatAdminApi.getConversations();
    set({ conversations: data, loadingConversations: false });

    const { selected } = get();
    if (!selected || !data.find((c) => c.id === selected.id)) {
      set({ selected: data[0] ?? null });
      if (data[0]) {
        await get().loadMessages(data[0].id);
      } else {
        set({ messages: [] });
      }
    }
  } catch (error) {
    set({
      loadingConversations: false,
      error: error instanceof Error
        ? error.message
        : 'Không tải được danh sách cuộc trò chuyện',
    });
    throw error;
  }
},
```

## API — filter 30 ngày
```ts
// src/features/chat/api/chatAdminApi.ts
const DAYS_LIMIT = 30;

function isWithinLastDays(dateString: string | null | undefined, days: number): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= days;
}

export const chatAdminApi = {
  async getConversations(): Promise<ConversationSummary[]> {
    const data = await httpRequest<ConversationSummary[]>('/chat/conversations/all');
    return data.filter((conv) => isWithinLastDays(conv.updatedAt, DAYS_LIMIT));
  },
};
```

## Component
```tsx
// src/features/chat/pages/ChatMonitorPage.tsx
const { conversations, selected, loadConversations, selectConversation, loadMessages } = useChatMonitorStore();

useEffect(() => {
  void loadConversations().catch(() => {
    message.error('Không tải được danh sách cuộc trò chuyện');
  });
}, [loadConversations]);

const handleSelectConversation = async (conv: ConversationSummary) => {
  selectConversation(conv);
  await loadMessages(conv.id).catch(() => {
    message.error('Không tải được tin nhắn');
  });
};
```
