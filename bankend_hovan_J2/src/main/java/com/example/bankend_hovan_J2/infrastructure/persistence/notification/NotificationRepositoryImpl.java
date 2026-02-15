package com.example.bankend_hovan_J2.infrastructure.persistence.notification;

import com.example.bankend_hovan_J2.domain.notification.entity.Notification;
import com.example.bankend_hovan_J2.domain.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class NotificationRepositoryImpl implements NotificationRepository {
    
    private final NotificationJpaRepository jpaRepository;
    
    @Override
    @Transactional
    public Notification save(Notification notification) {
        NotificationEntityJpa entity = toEntity(notification);
        NotificationEntityJpa saved = jpaRepository.save(entity);
        return toDomain(saved);
    }
    
    @Override
    public Optional<Notification> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }
    
    @Override
    public List<Notification> findByUserId(Long userId) {
        return jpaRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<Notification> findUnreadByUserId(Long userId) {
        return jpaRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public void markAsRead(Long id) {
        jpaRepository.findById(id).ifPresent(entity -> {
            entity.setIsRead(true);
            entity.setReadAt(LocalDateTime.now());
            jpaRepository.save(entity);
        });
    }
    
    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        jpaRepository.markAllAsReadByUserId(userId);
    }
    
    @Override
    @Transactional
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }
    
    @Override
    public int countUnreadByUserId(Long userId) {
        return jpaRepository.countUnreadByUserId(userId);
    }
    
    private NotificationEntityJpa toEntity(Notification notification) {
        return NotificationEntityJpa.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .relatedEntityType(notification.getRelatedEntityType())
                .relatedEntityId(notification.getRelatedEntityId())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .build();
    }
    
    private Notification toDomain(NotificationEntityJpa entity) {
        return Notification.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .type(entity.getType())
                .title(entity.getTitle())
                .message(entity.getMessage())
                .relatedEntityType(entity.getRelatedEntityType())
                .relatedEntityId(entity.getRelatedEntityId())
                .isRead(entity.getIsRead())
                .createdAt(entity.getCreatedAt())
                .readAt(entity.getReadAt())
                .build();
    }
}
