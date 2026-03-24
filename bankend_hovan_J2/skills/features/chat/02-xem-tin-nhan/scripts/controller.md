# Controller — Xem tin nhắn (CÓ PHÂN TRANG)

```java
// src/main/java/.../presentation/chat/ChatController.java

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    // ... các field khác ...

    // ========== CÓ PHÂN TRANG ==========
    @GetMapping("/messages/{conversationId}")
    public ResponseEntity<Page<ChatMessage>> getMessages(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        // Tạo Pageable sắp xếp theo createdAt tăng dần (cũ nhất trước)
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));

        // Query với phân trang
        Page<ChatMessage> messages = messageRepository
            .findByConversationId(conversationId, pageable);

        return ResponseEntity.ok(messages);
    }

    // Endpoint cũ (giữ lại cho backward compatibility)
    @GetMapping("/messages/{conversationId}/legacy")
    public ResponseEntity<List<ChatMessage>> getMessagesLegacy(
            @PathVariable Long conversationId) {
        List<ChatMessage> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        return ResponseEntity.ok(messages);
    }
}
```

## ChatMessageRepository - Thêm method phân trang

```java
// src/main/java/.../domain/chat/repository/ChatMessageRepository.java

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    // Method cũ
    List<ChatMessage> findByConversationId(Long conversationId);
    List<ChatMessage> findByConversationIdOrderByCreatedAtAsc(Long conversationId);
    void markAsRead(Long conversationId, Long userId);
    Long countUnread(Long conversationId, Long userId);

    // Method MỚI: Có phân trang
    Page<ChatMessage> findByConversationId(Long conversationId, Pageable pageable);
}
```

## Response Pagination

```java
// Kết quả trả về: Page<ChatMessage>
// {
//   "content": [
//     { "id": 1, "conversationId": 10, "senderId": 5, "senderType": "hr", "message": "Xin chào", "createdAt": "..." },
//     { "id": 2, "conversationId": 10, "senderId": 8, "senderType": "job_seeker", "message": "Chào anh", "createdAt": "..." }
//   ],
//   "pageable": {
//     "pageNumber": 0,
//     "pageSize": 50,
//     "sort": { "direction": "ASC", "property": "createdAt" }
//   },
//   "totalElements": 234,
//   "totalPages": 5,
//   "first": true,
//   "last": false,
//   "size": 50,
//   "number": 0,
//   "numberOfElements": 50
// }
```

## ChatMessage Entity (giữ nguyên)

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

## Lưu ý
- Phân trang mặc định: page=0, size=50
- Sắp xếp theo `createdAt` tăng dần → tin nhắn cũ nhất lên đầu
- Giữ endpoint legacy `/messages/{conversationId}/legacy` để tương thích ngược
- KHÔNG filter 30 ngày ở backend (frontend có thể filter nếu cần)
