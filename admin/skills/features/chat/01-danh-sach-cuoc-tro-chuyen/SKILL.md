# SK-01: Xem danh sách cuộc trò chuyện (PHÂN TRANG ĐẦY ĐỦ)

## Mô tả ngắn
Lấy và hiển thị danh sách cuộc trò chuyện giữa ứng viên và HR trong 30 ngày gần nhất với phân trang đầy đủ phía giao diện.

## Nguồn dữ liệu
- **Store:** `useChatMonitorStore.loadConversations(page, size)`
- **API:** `chatAdminApi.getConversations(page, size)` → `GET /chat/conversations/all?page=0&size=20&daysLimit=30`

## Luồng chính

```
Page mount → loadConversations(0, 20)
→ GET /chat/conversations/all?page=0&size=20&daysLimit=30
→ Response: Page<ConversationDTO>
  {
    content: [...],
    totalElements: 150,
    totalPages: 8,
    number: 0,
    size: 20
  }
→ set({ conversations: content, totalElements, totalPages, ... })

→ Auto-select dòng đầu: selected = conversations[0]
→ loadMessages(selected.id) → hiển thị tin nhắn
```

## Giao diện phân trang đầy đủ

```
┌────────────────────────────────────────────────────────────────┐
│  🔍 Tìm kiếm: [_______________]  Bộ lọc: [▼ Ngày] [▼ Trạng thái]│
├────────────────────────────────────────────────────────────────┤
│  Cuộc trò chuyện (30 ngày gần nhất)                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🟢 HR: Nguyễn Văn A  ↔  UV: Trần Thị B  |  IT Manager    │  │
│  │    Tin nhắn cuối: "Em đã nhận được email..."             │  │
│  │    ⏰ 2 giờ trước                            [Badge: 3]   │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ 🔵 HR: Lê Thị C       ↔  UV: Phạm Văn D  |  Kế toán      │  │
│  │    Tin nhắn cuối: "Cảm ơn bạn đã quan tâm..."           │  │
│  │    ⏰ 5 giờ trước                            [Badge: 1]  │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ 🟢 HR: Hoàng Văn E    ↔  UV: Ngô Thị F  |  Nhân sự      │  │
│  │    Tin nhắn cuối: "Buổi phỏng vấn vào thứ 2..."         │  │
│  │    ⏰ Hôm qua                                     [Badge: 0]│  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Hiển thị 20 / 150 cuộc trò chuyện                      │  │
│  │  [< 1 2 3 ... 8 >]  |  [20/trang ▼]                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

## Các thành phần Pagination UI

### 1. Header với thông tin & bộ lọc

```tsx
<Card>
  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
    <Title level={4} style={{ margin: 0 }}>
      Cuộc trò chuyện (30 ngày gần nhất)
    </Title>
    <Space>
      <Input.Search
        placeholder="Tìm kiếm..."
        style={{ width: 200 }}
        onSearch={(value) => console.log('Search:', value)}
      />
      <Select placeholder="Sắp xếp" defaultValue="newest" style={{ width: 120 }}>
        <Option value="newest">Mới nhất</Option>
        <Option value="oldest">Cũ nhất</Option>
      </Select>
    </Space>
  </div>
</Card>
```

### 2. Danh sách cuộc trò chuyện

```tsx
<List
  loading={loadingConversations}
  dataSource={conversations}
  locale={{ emptyText: 'Không có cuộc trò chuyện nào' }}
  renderItem={(conv) => (
    <List.Item
      key={conv.id}
      style={{
        cursor: 'pointer',
        padding: '12px 16px',
        backgroundColor: selected?.id === conv.id ? '#f6ffed' : '#fff',
        borderColor: selected?.id === conv.id ? '#52c41a' : '#f0f0f0',
        borderRadius: 8,
        marginBottom: 8,
        transition: 'all 0.2s',
      }}
      onClick={() => handleSelectConversation(conv)}
      hoverable
    >
      <List.Item.Meta
        avatar={
          <Avatar.Group maxCount={2} size="large">
            <Avatar style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
              {conv.hr?.name?.charAt(0) || 'H'}
            </Avatar>
            <Avatar style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
              {conv.jobSeeker?.name?.charAt(0) || 'U'}
            </Avatar>
          </Avatar.Group>
        }
        title={
          <Space>
            <Tag color="blue">{conv.hr?.name || 'HR'}</Tag>
            <SwapRightOutlined />
            <Tag color="green">{conv.jobSeeker?.name || 'Ứng viên'}</Tag>
          </Space>
        }
        description={
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {conv.jobPostingId ? `Job #${conv.jobPostingId}` : 'Không có job'}
            </Text>
            <br />
            <Text style={{ fontSize: 13 }}>
              Cập nhật: {formatRelativeTime(conv.updatedAt)}
            </Text>
          </div>
        }
      />
      <Badge count={0} /> {/* Unread count */}
    </List.Item>
  )}
/>
```

### 3. Pagination controls (Quan trọng!)

```tsx
// Cách 1: Pagination đơn giản
<div style={{ textAlign: 'center', marginTop: 16 }}>
  <Pagination
    current={currentPage + 1}              // Convert: 0-indexed → 1-indexed
    pageSize={pageSize}
    total={totalElements}
    onChange={(page) => handlePageChange(page)}
    showSizeChanger
    pageSizeOptions={['10', '20', '50']}
    onShowSizeChange={(_, size) => handlePageSizeChange(size)}
    showTotal={(total, range) =>
      `Hiển thị ${range[0]}-${range[1]} của ${total} cuộc trò chuyện`
    }
  />
</div>

// Cách 2: Pagination đầy đủ với info
<Card size="small">
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    {/* Thông tin */}
    <Text type="secondary">
      Hiển thị{' '}
      <Text strong>{conversations.length}</Text> /{' '}
      <Text strong>{totalElements}</Text> cuộc trò chuyện
      {totalPages > 1 && ` (Trang ${currentPage + 1}/${totalPages})`}
    </Text>

    {/* Pagination */}
    <Pagination
      current={currentPage + 1}
      pageSize={pageSize}
      total={totalElements}
      onChange={(page) => handlePageChange(page)}
      showSizeChanger
      pageSizeOptions={['10', '20', '50']}
      onShowSizeChange={(_, size) => handlePageSizeChange(size)}
      size="small"
    />
  </div>
</Card>
```

### 4. Handler functions

```tsx
// Xử lý chuyển trang
const handlePageChange = (page: number) => {
  const zeroBasedPage = page - 1; // Convert 1-indexed → 0-indexed
  void loadConversations(zeroBasedPage, pageSize);
  setSelected(null); // Clear selection khi chuyển trang
};

// Xử lý thay đổi page size
const handlePageSizeChange = (current: number, size: number) => {
  void loadConversations(0, size); // Reset về trang 1
};
```

## Tác vụ
- [x] Tải danh sách cuộc trò chuyện (có phân trang)
- [x] Filter 30 ngày ở backend
- [x] Auto-select cuộc đầu tiên (trang 0)
- [x] Chọn cuộc trò chuyện → hiển thị tin nhắn bên phải
- [x] Phân trang với Ant Design Pagination
- [x] Thay đổi page size (10, 20, 50)
- [x] Hiển thị tổng số & phạm vi

## Ràng buộc
- Filter 30 ngày ở backend (KHÔNG cần frontend filter)
- Pagination mặc định: 20 cuộc/trang
- Ant Design Pagination là 1-indexed → convert khi gọi API
- Khi chuyển trang → clear selected conversation
- Khi đổi page size → reset về trang 0
- Danh sách rỗng → Empty state
