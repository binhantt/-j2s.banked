package com.example.bankend_hovan_J2.application.notification;

import com.example.bankend_hovan_J2.domain.notification.Notification;
import com.example.bankend_hovan_J2.domain.notification.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {
    
    private final NotificationRepository notificationRepository;

    public List<NotificationResponse> getUserNotifications(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return notifications.stream()
                .map(NotificationResponse::from)
                .collect(Collectors.toList());
    }

    public List<NotificationResponse> getUnreadNotifications(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        return notifications.stream()
                .map(NotificationResponse::from)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
        }
        
        notificationRepository.saveAll(unreadNotifications);
    }

    public void deleteNotification(Long notificationId) {
        if (!notificationRepository.existsById(notificationId)) {
            throw new RuntimeException("Notification not found");
        }
        notificationRepository.deleteById(notificationId);
    }

    public NotificationResponse createNotification(Long userId, String type, String title, String message) {
        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .isRead(false)
                .build();
        
        Notification saved = notificationRepository.save(notification);
        return NotificationResponse.from(saved);
    }
}