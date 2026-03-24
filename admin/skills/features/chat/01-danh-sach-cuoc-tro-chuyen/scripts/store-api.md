# Store + API + Giao diện — loadConversations (PHÂN TRANG ĐẦY ĐỦ)

## Store (Zustand)

```ts
// src/features/chat/store/useChatMonitorStore.ts

interface ChatMonitorState {
  // Conversations state
  conversations: ConversationSummary[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  loadingConversations: boolean;

  // Messages state
  messages: ChatMessageItem[];
  totalMessageElements: number;
  totalMessagePages: number;
  currentMessagePage: number;
  loadingMessages: boolean;

  // Selected
  selected: ConversationSummary | null;
  error: string | null;
}

export const useChatMonitorStore = create<ChatMonitorState>()(
  devtools(
    (set, get) => ({
      // ========== STATE BAN ĐẦU ==========
      conversations: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 20,
      messages: [],
      totalMessageElements: 0,
      totalMessagePages: 0,
      currentMessagePage: 0,
      loadingConversations: false,
      loadingMessages: false,
      selected: null,
      error: null,

      // ========== LOAD CONVERSATIONS (PHÂN TRANG) ==========
      loadConversations: async (page: number = 0, size: number = 20) => {
        set({ loadingConversations: true, error: null });
        try {
          const response = await chatAdminApi.getConversations(page, size);

          set({
            conversations: response.content,
            totalElements: response.totalElements,
            totalPages: response.totalPages,
            currentPage: response.number,
            pageSize: response.size,
            loadingConversations: false,
          });

          // Auto-select cuộc trò chuyện đầu tiên nếu chưa có
          const { selected } = get();
          if (!selected && response.content.length > 0) {
            const firstConv = response.content[0];
            set({ selected: firstConv });
            await get().loadMessages(firstConv.id);
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

      // ========== CHUYỂN TRANG ==========
      setPage: async (page: number) => {
        const { pageSize } = get();
        await get().loadConversations(page, pageSize);
        set({ selected: null }); // Clear selection
      },

      // ========== ĐỔI PAGE SIZE ==========
      setPageSize: async (size: number) => {
        await get().loadConversations(0, size); // Reset về trang 0
        set({ selected: null }); // Clear selection
      },

      // ========== SELECT CONVERSATION ==========
      selectConversation: async (conv: ConversationSummary | null) => {
        set({ selected: conv, messages: [], currentMessagePage: 0 });

        if (conv) {
          await get().loadMessages(conv.id);
        }
      },

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

      // ========== LOAD THÊM MESSAGES ==========
      loadMoreMessages: async () => {
        const { selected, currentMessagePage, totalMessagePages, pageSize } = get();

        if (!selected || currentMessagePage >= totalMessagePages - 1) {
          return;
        }

        const nextPage = currentMessagePage + 1;
        set({ loadingMessages: true });

        try {
          const response = await chatAdminApi.getMessages(selected.id, nextPage, pageSize);

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
    }),
    { name: 'ChatMonitorStore' }
  )
);
```

## API

```ts
// src/features/chat/api/chatAdminApi.ts

export const chatAdminApi = {
  async getConversations(
    page: number = 0,
    size: number = 20,
    daysLimit: number = 30
  ): Promise<ConversationPageResponse> {
    return httpRequest<ConversationPageResponse>(
      `/chat/conversations/all?page=${page}&size=${size}&daysLimit=${daysLimit}`
    );
  },

  async getMessages(
    conversationId: number,
    page: number = 0,
    size: number = 50
  ): Promise<MessagePageResponse> {
    return httpRequest<MessagePageResponse>(
      `/chat/messages/${conversationId}?page=${page}&size=${size}`
    );
  },
};
```

## Giao diện đầy đủ - Page Component

```tsx
// src/features/chat/pages/ChatMonitorPage.tsx

import { useEffect } from 'react';
import {
  Card,
  List,
  Avatar,
  Badge,
  Tag,
  Typography,
  Space,
  Pagination,
  Input,
  Select,
  Spin,
  Empty,
} from 'antd';
import {
  SwapRightOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useChatMonitorStore } from '../store/useChatMonitorStore';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Helper format thời gian tương đối
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

const ChatMonitorPage = () => {
  const {
    conversations,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    loadingConversations,
    selected,
    loadConversations,
    selectConversation,
    setPage,
    setPageSize,
  } = useChatMonitorStore();

  // Load data khi mount
  useEffect(() => {
    void loadConversations(0, 20);
  }, [loadConversations]);

  // Xử lý chuyển trang
  const handlePageChange = (page: number) => {
    const zeroBasedPage = page - 1; // Ant Design: 1-indexed
    void setPage(zeroBasedPage);
  };

  // Xử lý đổi page size
  const handlePageSizeChange = (current: number, size: number) => {
    void setPageSize(size);
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <Card
        title={
          <Space>
            <Title level={4} style={{ margin: 0 }}>
              💬 Giám sát Chat
            </Title>
            <Badge count={totalElements} style={{ backgroundColor: '#1890ff' }} />
          </Space>
        }
        extra={
          <Space>
            <Input
              placeholder="Tìm kiếm HR/Ứng viên..."
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
              allowClear
            />
            <Select defaultValue="newest" style={{ width: 120 }}>
              <Option value="newest">Mới nhất</Option>
              <Option value="oldest">Cũ nhất</Option>
            </Select>
          </Space>
        }
      >
        {/* Danh sách cuộc trò chuyện */}
        <List
          loading={loadingConversations}
          dataSource={conversations}
          locale={{
            emptyText: loadingConversations ? (
              <div style={{ padding: 40 }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>Đang tải cuộc trò chuyện...</div>
              </div>
            ) : (
              <Empty description="Không có cuộc trò chuyện nào trong 30 ngày gần nhất" />
            ),
          }}
          renderItem={(conv) => (
            <List.Item
              key={conv.id}
              style={{
                cursor: 'pointer',
                padding: '16px',
                backgroundColor: selected?.id === conv.id ? '#f6ffed' : '#fff',
                borderColor: selected?.id === conv.id ? '#52c41a' : '#e8e8e8',
                borderRadius: 8,
                marginBottom: 8,
                border: selected?.id === conv.id ? '2px solid #52c41a' : '1px solid #e8e8e8',
                transition: 'all 0.2s ease',
              }}
              onClick={() => void selectConversation(conv)}
            >
              <List.Item.Meta
                avatar={
                  <Avatar.Group maxCount={2} size={48}>
                    <Avatar
                      style={{
                        backgroundColor: '#e0f2fe',
                        color: '#0284c7',
                        border: '2px solid #fff',
                      }}
                    >
                      {conv.hr?.name?.charAt(0)?.toUpperCase() || 'H'}
                    </Avatar>
                    <Avatar
                      style={{
                        backgroundColor: '#dcfce7',
                        color: '#166534',
                        border: '2px solid #fff',
                      }}
                    >
                      {conv.jobSeeker?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Avatar>
                  </Avatar.Group>
                }
                title={
                  <Space size="small">
                    <Tag color="blue" icon={<span>👔</span>}>
                      {conv.hr?.name || `HR #${conv.hrId}`}
                    </Tag>
                    <SwapRightOutlined style={{ color: '#999' }} />
                    <Tag color="green" icon={<span>👤</span>}>
                      {conv.jobSeeker?.name || `UV #${conv.jobSeekerId}`}
                    </Tag>
                    {conv.jobPostingId && (
                      <Tag color="purple">Job #{conv.jobPostingId}</Tag>
                    )}
                  </Space>
                }
                description={
                  <div>
                    <Text
                      type="secondary"
                      style={{ fontSize: 12 }}
                    >
                      Cập nhật: {formatRelativeTime(conv.updatedAt)}
                    </Text>
                    <div style={{ marginTop: 4 }}>
                      <Text style={{ fontSize: 13 }}>
                        {conv.createdAt !== conv.updatedAt
                          ? '💬 Đã có tin nhắn'
                          : '🆕 Cuộc trò chuyện mới'}
                      </Text>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />

        {/* Pagination */}
        {totalElements > 0 && (
          <div
            style={{
              marginTop: 16,
              padding: '12px 16px',
              backgroundColor: '#fafafa',
              borderRadius: 8,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* Thông tin */}
            <Text type="secondary" style={{ fontSize: 13 }}>
              Hiển thị{' '}
              <Text strong style={{ color: '#1890ff' }}>
                {Math.min((currentPage) * pageSize + 1, totalElements)} -{' '}
                {Math.min((currentPage + 1) * pageSize, totalElements)}
              </Text>{' '}
              của{' '}
              <Text strong style={{ color: '#1890ff' }}>
                {totalElements}
              </Text>{' '}
              cuộc trò chuyện
              {totalPages > 1 && (
                <Tag color="blue" style={{ marginLeft: 8 }}>
                  Trang {currentPage + 1} / {totalPages}
                </Tag>
              )}
            </Text>

            {/* Controls */}
            <Pagination
              current={currentPage + 1}
              pageSize={pageSize}
              total={totalElements}
              onChange={handlePageChange}
              showSizeChanger
              pageSizeOptions={['10', '20', '50', '100']}
              onShowSizeChange={handlePageSizeChange}
              showQuickJumper
              size="small"
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default ChatMonitorPage;
```

## Pagination UI chi tiết

```
┌──────────────────────────────────────────────────────────────────┐
│  💬 Giám sát Chat                               [🔍 Tìm kiếm]   │
│  [Badge: 150]                               [Mới nhất ▼]        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ [👤 HR] ↔ [👤 UV]   [Job #5]                              │ │
│  │ Cập nhật: 2 giờ trước                                     │ │
│  │ 💬 Đã có tin nhắn                                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ [👤 HR] ↔ [👤 UV]   [Job #3]                              │ │
│  │ Cập nhật: Hôm qua                                         │ │
│  │ 🆕 Cuộc trò chuyện mới                                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Hiển thị 1-20 của 150 cuộc trò chuyện   [Trang 1/8]      │ │
│  │                [< 1 2 3 ... 8 >]  [20/trang ▼]  [⟩]       │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

## Lưu ý
- Pagination mặc định: 20 cuộc/trang
- Options: 10, 20, 50, 100
- Ant Design dùng 1-indexed → convert: `currentPage + 1`
- Backend dùng 0-indexed → `page = current - 1`
- Chuyển trang → clear selected conversation
- Đổi page size → reset về trang 0
