package com.example.bankend_hovan_J2.infrastructure.persistence.cv;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserCVJpaRepository extends JpaRepository<UserCVEntityJpa, Long> {
    List<UserCVEntityJpa> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<UserCVEntityJpa> findByUserIdAndIsDefaultTrue(Long userId);
    List<UserCVEntityJpa> findByUserId(Long userId);
    Optional<UserCVEntityJpa> findByFileUrl(String fileUrl);
}
