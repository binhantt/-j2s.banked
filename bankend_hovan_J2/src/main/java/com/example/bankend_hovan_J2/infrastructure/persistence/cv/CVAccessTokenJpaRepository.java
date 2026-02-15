package com.example.bankend_hovan_J2.infrastructure.persistence.cv;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface CVAccessTokenJpaRepository extends JpaRepository<CVAccessTokenEntityJpa, Long> {
    Optional<CVAccessTokenEntityJpa> findByToken(String token);
    
    @Query("SELECT t FROM CVAccessTokenEntityJpa t WHERE t.token = ?1 AND t.expiredAt > ?2 AND t.used = false")
    Optional<CVAccessTokenEntityJpa> findValidToken(String token, LocalDateTime now);
}
