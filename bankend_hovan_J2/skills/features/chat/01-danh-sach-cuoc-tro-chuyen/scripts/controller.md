# Controller — Danh sách cuộc trò chuyện (CÓ PHÂN TRANG)

```java
// src/main/java/.../presentation/chat/ChatController.java

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;
    private final CreateConversationUseCase createConversationUseCase;
    private final SendMessageUseCase sendMessageUseCase;
    private final UserRepository userRepository;

    // Map Conversation → ConversationDTO kèm user info
    private ConversationDTO mapToDTO(Conversation conv) {
        ConversationDTO.ConversationDTOBuilder builder = ConversationDTO.builder()
            .id(conv.getId())
            .hrId(conv.getHrId())
            .jobSeekerId(conv.getJobSeekerId())
            .jobPostingId(conv.getJobPostingId())
            .createdAt(conv.getCreatedAt())
            .updatedAt(conv.getUpdatedAt());

        userRepository.findById(conv.getHrId()).ifPresent(hr ->
            builder.hr(ConversationUserSummaryDTO.builder()
                .id(hr.getId())
                .name(hr.getName())
                .avatarUrl(hr.getAvatarUrl())
                .build())
        );

        userRepository.findById(conv.getJobSeekerId()).ifPresent(js ->
            builder.jobSeeker(ConversationUserSummaryDTO.builder()
                .id(js.getId())
                .name(js.getName())
                .avatarUrl(js.getAvatarUrl())
                .build())
        );

        return builder.build();
    }

    // ========== CÓ PHÂN TRANG ==========
    @GetMapping("/conversations/all")
    public ResponseEntity<Page<ConversationDTO>> getAllConversations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "30") int daysLimit) {

        // Tính ngày bắt đầu (30 ngày trước)
        LocalDateTime startDate = LocalDateTime.now().minusDays(daysLimit);

        // Tạo Pageable sắp xếp theo updatedAt giảm dần (mới nhất trước)
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"));

        // Query với filter ngày + phân trang
        Page<Conversation> conversationPage = conversationRepository
            .findByUpdatedAtAfter(startDate, pageable);

        // Map sang DTO
        Page<ConversationDTO> dtoPage = conversationPage.map(this::mapToDTO);

        return ResponseEntity.ok(dtoPage);
    }

    // Endpoint cũ (giữ lại cho backward compatibility)
    @GetMapping("/conversations/all/legacy")
    public ResponseEntity<List<ConversationDTO>> getAllConversationsLegacy() {
        List<ConversationDTO> conversations = conversationRepository.findAll()
            .stream().map(this::mapToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(conversations);
    }

    // Các endpoint khác
    @GetMapping("/conversations/hr/{hrId}")
    public ResponseEntity<List<ConversationDTO>> getHRConversations(@PathVariable Long hrId) { ... }

    @GetMapping("/conversations/job-seeker/{jobSeekerId}")
    public ResponseEntity<List<ConversationDTO>> getJobSeekerConversations(@PathVariable Long jobSeekerId) { ... }
}
```

## Repository - Thêm method phân trang

```java
// src/main/java/.../domain/chat/repository/ConversationRepository.java

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    // Method cũ
    List<Conversation> findByHrId(Long hrId);
    List<Conversation> findByJobSeekerId(Long jobSeekerId);
    List<Conversation> findAll();

    // Method MỚI: Có phân trang + filter theo ngày
    Page<Conversation> findByUpdatedAtAfter(LocalDateTime startDate, Pageable pageable);
}
```

## Response Pagination

```java
// Kết quả trả về: Page<ConversationDTO>
// {
//   "content": [...],           // Danh sách cuộc trò chuyện
//   "pageable": {
//     "pageNumber": 0,
//     "pageSize": 20
//   },
//   "totalElements": 150,       // Tổng số cuộc trò chuyện
//   "totalPages": 8,            // Tổng số trang
//   "first": true,
//   "last": false,
//   "size": 20,
//   "number": 0,
//   "numberOfElements": 20
// }
```

## Lưu ý
- Phân trang mặc định: page=0, size=20
- Filter 30 ngày mặc định (có thể tùy chỉnh qua `daysLimit`)
- Sắp xếp theo `updatedAt` giảm dần → cuộc trò chuyện mới nhất lên đầu
- Giữ endpoint legacy `/conversations/all/legacy` để tương thích ngược
