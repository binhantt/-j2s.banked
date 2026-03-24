import { create } from 'zustand';
import { chatAdminApi } from '../api/chatAdminApi';
import type { ChatMessageItem, ConversationSummary } from '../types/chatTypes';

interface ChatMonitorState {
  // Conversations pagination
  conversations: ConversationSummary[];
  convTotalElements: number;
  convTotalPages: number;
  convCurrentPage: number;
  convPageSize: number;
  // Messages pagination
  messages: ChatMessageItem[];
  msgTotalElements: number;
  msgTotalPages: number;
  msgCurrentPage: number;
  msgPageSize: number;
  // Selection
  selected: ConversationSummary | null;
  // Search
  searchUserId: number | null;
  searchLoading: boolean;
  // Loading
  loadingConversations: boolean;
  loadingMessages: boolean;
  error: string | null;
  // Actions
  loadConversations: (page?: number) => Promise<void>;
  loadMessages: (conversationId: number, page?: number) => Promise<void>;
  searchByUser: (userId: number, page?: number) => Promise<void>;
  clearSearch: () => void;
  selectConversation: (conv: ConversationSummary | null) => void;
  setConvPageSize: (size: number) => void;
  setMsgPageSize: (size: number) => void;
}

export const useChatMonitorStore = create<ChatMonitorState>((set, get) => ({
  conversations: [],
  convTotalElements: 0,
  convTotalPages: 0,
  convCurrentPage: 0,
  convPageSize: 20,
  messages: [],
  msgTotalElements: 0,
  msgTotalPages: 0,
  msgCurrentPage: 0,
  msgPageSize: 50,
  selected: null,
  searchUserId: null,
  searchLoading: false,
  loadingConversations: false,
  loadingMessages: false,
  error: null,

  loadConversations: async (page = 0) => {
    set({ loadingConversations: true, error: null, searchUserId: null });
    try {
      const { convPageSize } = get();
      const data = await chatAdminApi.getConversations(page, convPageSize);
      set({
        conversations: data.content,
        convTotalElements: data.totalElements,
        convTotalPages: data.totalPages,
        convCurrentPage: data.page,
        convPageSize: data.size,
        loadingConversations: false,
      });

      const { selected } = get();
      if (!selected || !data.content.find((c) => c.id === selected.id)) {
        set({ selected: data.content[0] ?? null });
        if (data.content[0]) {
          await get().loadMessages(data.content[0].id, 0);
        } else {
          set({ messages: [], msgTotalElements: 0, msgTotalPages: 0, msgCurrentPage: 0 });
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

  loadMessages: async (conversationId: number, page = 0) => {
    set({ loadingMessages: true, error: null });
    try {
      const { msgPageSize } = get();
      const data = await chatAdminApi.getMessages(conversationId, page, msgPageSize);
      set({
        messages: data.content,
        msgTotalElements: data.totalElements,
        msgTotalPages: data.totalPages,
        msgCurrentPage: data.page,
        msgPageSize: data.size,
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

  searchByUser: async (userId: number, page = 0) => {
    set({ searchLoading: true, error: null, searchUserId: userId });
    try {
      const { convPageSize } = get();
      const data = await chatAdminApi.searchConversations(userId, page, convPageSize);
      set({
        conversations: data.content,
        convTotalElements: data.totalElements,
        convTotalPages: data.totalPages,
        convCurrentPage: data.page,
        convPageSize: data.size,
        selected: data.content[0] ?? null,
        searchLoading: false,
      });
      if (data.content[0]) {
        await get().loadMessages(data.content[0].id, 0);
      } else {
        set({ messages: [], msgTotalElements: 0, msgTotalPages: 0, msgCurrentPage: 0 });
      }
    } catch (error) {
      set({
        searchLoading: false,
        error: error instanceof Error ? error.message : 'Tìm kiếm thất bại',
      });
      throw error;
    }
  },

  clearSearch: () => {
    set({ searchUserId: null });
    void get().loadConversations(0);
  },

  selectConversation: (conv) => set({ selected: conv }),

  setConvPageSize: (size) => set({ convPageSize: size }),

  setMsgPageSize: (size) => set({ msgPageSize: size }),
}));

