package com.example.bankend_hovan_J2.presentation.notification;

import com.example.bankend_hovan_J2.application.notification.NotificationResponse;
import com.example.bankend_hovan_J2.application.notification.NotificationService;
import com.example.bankend_hovan_J2.domain.chat.repository.ConversationRepository;
import com.example.bankend_hovan_J2.domain.chat.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponse>> getUserNotifications(@PathVariable Long userId) {
        List<NotificationResponse> notifications = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(@PathVariable Long userId) {
        List<NotificationResponse> notifications = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable Long userId) {
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * LAY TONG SO THONG BAO + TIN NHAN CHUA DOC
     * Dung de hien thi badge tren navbar: (+N tin nhan)
     * Tra ve: { notificationCount: N, chatCount: M, total: N+M }
     */
    @GetMapping("/user/{userId}/navbar-count")
    public ResponseEntity<Map<String, Object>> getNavbarUnreadCount(@PathVariable Long userId) {
        // Dem thong bao chua doc (notification)
        long notificationCount = notificationService.getUnreadCount(userId);

        // Dem tin nhan chua doc trong tat ca cuoc tro chuyen
        long chatCount = 0;
        var hrConvs = conversationRepository.findByHrId(userId);
        var jsConvs = conversationRepository.findByJobSeekerId(userId);

        for (var conv : hrConvs) {
            chatCount += chatMessageRepository.countUnread(conv.getId(), userId);
        }
        for (var conv : jsConvs) {
            chatCount += chatMessageRepository.countUnread(conv.getId(), userId);
        }

        long total = notificationCount + chatCount;

        return ResponseEntity.ok(Map.of(
                "notificationCount", notificationCount,
                "chatCount", chatCount,
                "total", total
        ));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok().build();
    }
}