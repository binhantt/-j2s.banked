import { create } from 'zustand';
import { chatAdminApi } from '../api/chatAdminApi';
import type { ChatMessageItem, ConversationSummary } from '../types/chatTypes';

interface ChatMonitorState {
  conversations: ConversationSummary[];
  messages: ChatMessageItem[];
  selected: ConversationSummary | null;
  loadingConversations: boolean;
  loadingMessages: boolean;
  error: string | null;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: number) => Promise<void>;
  selectConversation: (conv: ConversationSummary | null) => void;
}

export const useChatMonitorStore = create<ChatMonitorState>((set, get) => ({
  conversations: [],
  messages: [],
  selected: null,
  loadingConversations: false,
  loadingMessages: false,
  error: null,

  loadConversations: async () => {
    set({ loadingConversations: true, error: null });
    try {
      const data = await chatAdminApi.getConversations();
      set({ conversations: data, loadingConversations: false });

      // Nếu chưa có selected hoặc selected không còn trong list, chọn phần tử đầu tiên
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
        error: error instanceof Error ? error.message : 'Không tải được danh sách cuộc trò chuyện',
      });
      throw error;
    }
  },

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

  selectConversation: (conv) => set({ selected: conv }),
}));

