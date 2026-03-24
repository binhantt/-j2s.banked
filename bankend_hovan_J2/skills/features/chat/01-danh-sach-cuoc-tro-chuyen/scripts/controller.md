# Controller — Danh sách cuộc trò chuyện

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

    @GetMapping("/conversations/all")
    public ResponseEntity<List<ConversationDTO>> getAllConversations() {
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

## Conversation Entity
```java
// src/main/java/.../domain/chat/entity/Conversation.java

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Conversation {
    private Long id;
    private Long hrId;
    private Long jobSeekerId;
    private Long jobPostingId; // nullable
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

## ConversationDTO
```java
// src/main/java/.../presentation/chat/dto/ConversationDTO.java

@Data @Builder
public class ConversationDTO {
    private Long id;
    private Long hrId;
    private Long jobSeekerId;
    private Long jobPostingId;
    private ConversationUserSummaryDTO hr;
    private ConversationUserSummaryDTO jobSeeker;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

@Data @Builder
public class ConversationUserSummaryDTO {
    private Long id;
    private String name;
    private String avatarUrl;
}
```

## ConversationRepository
```java
List<Conversation> findByHrId(Long hrId);
List<Conversation> findByJobSeekerId(Long jobSeekerId);
List<Conversation> findAll();
```

## Lưu ý
- Không filter 30 ngày ở backend — frontend tự filter
- Nếu user bị xóa → Optional rỗng → bỏ qua, không crash
