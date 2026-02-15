package com.example.bankend_hovan_J2.domain.notification.repository;

import com.example.bankend_hovan_J2.domain.notification.entity.Notification;
import java.util.List;
import java.util.Optional;

public interface NotificationRepository {
    Notification save(Notification notification);
    Optional<Notification> findById(Long id);
    List<Notification> findByUserId(Long userId);
    List<Notification> findUnreadByUserId(Long userId);
    void markAsRead(Long id);
    void markAllAsRead(Long userId);
    void deleteById(Long id);
    int countUnreadByUserId(Long userId);
}
