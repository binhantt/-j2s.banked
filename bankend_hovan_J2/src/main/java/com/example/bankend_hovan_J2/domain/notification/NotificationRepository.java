package com.example.bankend_hovan_J2.domain.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.isRead = false")
    long countUnreadByUserId(@Param("userId") Long userId);
    
    void deleteByUserId(Long userId);
}