package com.example.bankend_hovan_J2.application.notification;

import com.example.bankend_hovan_J2.domain.notification.entity.Notification;
import com.example.bankend_hovan_J2.domain.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CreateNotificationUseCase {
    private final NotificationRepository notificationRepository;
    
    @Transactional
    public Notification execute(Long userId, String type, String title, String message, 
                                String relatedEntityType, Long relatedEntityId) {
        System.out.println("=== CreateNotificationUseCase.execute() ===");
        System.out.println("userId: " + userId);
        System.out.println("type: " + type);
        System.out.println("title: " + title);
        System.out.println("message: " + message);
        
        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .relatedEntityType(relatedEntityType)
                .relatedEntityId(relatedEntityId)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        
        Notification saved = notificationRepository.save(notification);
        System.out.println("Notification saved with ID: " + saved.getId());
        System.out.println("=== End CreateNotificationUseCase ===");
        
        return saved;
    }
}
