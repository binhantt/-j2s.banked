package com.example.bankend_hovan_J2.presentation.notification;

import com.example.bankend_hovan_J2.application.notification.CreateNotificationUseCase;
import com.example.bankend_hovan_J2.domain.notification.entity.Notification;
import com.example.bankend_hovan_J2.domain.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class NotificationController {
    
    private final NotificationRepository notificationRepository;
    private final CreateNotificationUseCase createNotificationUseCase;
    
    @PostMapping("/create")
    public ResponseEntity<Notification> createNotification(@RequestBody Map<String, Object> request) {
        try {
            Long userId = getLong(request, "userId");
            String type = getString(request, "type");
            String title = getString(request, "title");
            String message = getString(request, "message");
            String relatedEntityType = getString(request, "relatedEntityType");
            Long relatedEntityId = getLong(request, "relatedEntityId");
            
            Notification notification = createNotificationUseCase.execute(
                userId, type, title, message, relatedEntityType, relatedEntityId
            );
            
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            log.error("Error creating notification", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        try {
            List<Notification> notifications = notificationRepository.findByUserId(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("Error fetching notifications", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@PathVariable Long userId) {
        try {
            List<Notification> notifications = notificationRepository.findUnreadByUserId(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("Error fetching unread notifications", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Map<String, Integer>> getUnreadCount(@PathVariable Long userId) {
        try {
            int count = notificationRepository.countUnreadByUserId(userId);
            Map<String, Integer> response = new HashMap<>();
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error counting unread notifications", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        try {
            notificationRepository.markAsRead(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error marking notification as read", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
        try {
            notificationRepository.markAllAsRead(userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error marking all notifications as read", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        try {
            notificationRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error deleting notification", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    private String getString(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }
    
    private Long getLong(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return null;
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        try {
            return Long.valueOf(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
