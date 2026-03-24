# CH-01: Xem danh sách cuộc trò chuyện (CÓ PHÂN TRANG)

## Mô tả ngắn
Lấy danh sách cuộc trò chuyện HR ↔ Ứng viên với phân trang, kèm thông tin người tham gia (map từ UserRepository).

## Endpoint (MỚI - Có phân trang)
```
GET /api/chat/conversations/all?page=0&size=20&daysLimit=30
```

| Tham số | Kiểu | Mặc định | Mô tả |
|---------|------|----------|-------|
| `page` | int | 0 | Số trang (0-indexed) |
| `size` | int | 20 | Số item/trang |
| `daysLimit` | int | 30 | Số ngày lọc (mặc định 30 ngày) |

## Luồng xử lý

```
GET /api/chat/conversations/all?page=0&size=20
→ Tính startDate = now - daysLimit
→ Pageable: page, size, sort by updatedAt DESC
→ conversationRepository.findByUpdatedAtAfter(startDate, pageable)
  → Page<Conversation>
→ stream → mapToDTO(conv)
  → ConversationDTO.builder()
      .id, .hrId, .jobSeekerId, .jobPostingId
      .createdAt, .updatedAt
  → userRepository.findById(conv.getHrId())
      → .hr(ConversationUserSummaryDTO.of(hr))
  → userRepository.findById(conv.getJobSeekerId())
      → .jobSeeker(ConversationUserSummaryDTO.of(js))
  → builder.build()
→ Page<ConversationDTO> → ResponseEntity.ok()
```

## Response (Page<ConversationDTO>)

```json
{
  "content": [
    {
      "id": 1,
      "hrId": 10,
      "jobSeekerId": 20,
      "jobPostingId": 5,
      "hr": { "id": 10, "name": "Nguyễn Văn A", "avatarUrl": "..." },
      "jobSeeker": { "id": 20, "name": "Trần Thị B", "avatarUrl": "..." },
      "createdAt": "2024-01-15T10:30:00",
      "updatedAt": "2024-02-20T14:25:00"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": { "direction": "DESC", "property": "updatedAt" }
  },
  "totalElements": 150,
  "totalPages": 8,
  "first": true,
  "last": false,
  "size": 20,
  "number": 0,
  "numberOfElements": 20
}
```

## Tác vụ
- [x] Lấy cuộc trò chuyện với phân trang
- [x] Filter theo ngày (mặc định 30 ngày)
- [x] Sắp xếp theo updatedAt DESC (mới nhất trước)
- [x] Map HR info từ UserRepository
- [x] Map UV info từ UserRepository
- [x] Trả về Page<ConversationDTO>

## Endpoint cũ (Legacy - giữ lại tương thích ngược)
```
GET /api/chat/conversations/all/legacy
```
→ Trả về `List<ConversationDTO>` (không phân trang)

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: GET /api/chat/conversations/all với Pageable params
- Repository: `findByUpdatedAtAfter(startDate, pageable)`
- mapToDTO: builder pattern với user lookup

### `references/`
- Entity: Conversation
- DTO: ConversationDTO, ConversationUserSummaryDTO, Page<T>
- Repository: ConversationRepository, UserRepository

## Ràng buộc
- Filter 30 ngày ở backend (KHÔNG cần frontend filter)
- userRepository.findById dùng Optional → nếu user bị xóa → bỏ qua
- Sắp xếp: updatedAt DESC (mới nhất lên đầu)
- Page index: 0-based (page=0 là trang đầu tiên)
