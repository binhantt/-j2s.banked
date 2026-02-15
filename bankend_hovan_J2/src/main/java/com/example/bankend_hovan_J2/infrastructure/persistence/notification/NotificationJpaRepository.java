package com.example.bankend_hovan_J2.infrastructure.persistence.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationJpaRepository extends JpaRepository<NotificationEntityJpa, Long> {
    List<NotificationEntityJpa> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<NotificationEntityJpa> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
    
    @Query("SELECT COUNT(n) FROM NotificationEntityJpa n WHERE n.userId = :userId AND n.isRead = false")
    int countUnreadByUserId(@Param("userId") Long userId);
    
    @Modifying
    @Query("UPDATE NotificationEntityJpa n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.userId = :userId AND n.isRead = false")
    void markAllAsReadByUserId(@Param("userId") Long userId);
}
