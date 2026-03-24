# Controller — Xem tin nhắn

```java
// GET /api/chat/messages/{conversationId}
@GetMapping("/messages/{conversationId}")
public ResponseEntity<List<ChatMessage>> getMessages(@PathVariable Long conversationId) {
    List<ChatMessage> messages = messageRepository.findByConversationId(conversationId);
    return ResponseEntity.ok(messages);
}
```

## ChatMessage Entity
```java
// src/main/java/.../domain/chat/entity/ChatMessage.java

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ChatMessage {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderType; // 'hr' | 'job_seeker'
    private String message;
    private Boolean isRead;
    private Long replyToMessageId;
    private String replyToMessage;
    private LocalDateTime createdAt;
}
```

## ChatMessageRepository
```java
// src/main/java/.../domain/chat/repository/ChatMessageRepository.java

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByConversationId(Long conversationId);
    List<ChatMessage> findByConversationIdOrderByCreatedAtAsc(Long conversationId);
    void markAsRead(Long conversationId, Long userId);
    Long countUnread(Long conversationId, Long userId);
}
```

## Lưu ý
- Trả về Entity trực tiếp, không map DTO
- Không filter 30 ngày ở backend
- Sắp xếp: findByConversationIdOrderByCreatedAtAsc (cũ nhất trước)
