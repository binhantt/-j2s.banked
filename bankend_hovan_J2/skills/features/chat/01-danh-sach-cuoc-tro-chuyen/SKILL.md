# CH-01: Xem danh sách cuộc trò chuyện

## Mô tả ngắn
Lấy danh sách tất cả cuộc trò chuyện HR ↔ Ứng viên, kèm thông tin người tham gia (map từ UserRepository).

## Endpoint
```
GET /api/chat/conversations/all
```

## Luồng xử lý

```
GET /api/chat/conversations/all
→ conversationRepository.findAll()
→ stream → mapToDTO(conv)
  → ConversationDTO.builder()
      .id, .hrId, .jobSeekerId, .jobPostingId
      .createdAt, .updatedAt
  → userRepository.findById(conv.getHrId())
      → .hr(ConversationUserSummaryDTO.of(hr))
  → userRepository.findById(conv.getJobSeekerId())
      → .jobSeeker(ConversationUserSummaryDTO.of(js))
  → builder.build()
→ collect → List<ConversationDTO>
→ ResponseEntity.ok(list)
```

## Tác vụ
- [x] Lấy tất cả cuộc trò chuyện
- [x] Map HR info từ UserRepository
- [x] Map UV info từ UserRepository
- [x] Trả về ConversationDTO đầy đủ

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: GET /api/chat/conversations/all
- mapToDTO: builder pattern với user lookup

### `references/`
- Entity: Conversation
- DTO: ConversationDTO, ConversationUserSummaryDTO
- Repository: ConversationRepository, UserRepository

## Ràng buộc
- Không filter 30 ngày ở backend — frontend tự filter
- userRepository.findById dùng Optional → nếu user bị xóa → bỏ qua
