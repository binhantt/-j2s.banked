package com.example.bankend_hovan_J2.infrastructure.persistence.company;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedCompanyJpaRepository extends JpaRepository<SavedCompanyEntityJpa, Long> {
    List<SavedCompanyEntityJpa> findByUserId(Long userId);
    Optional<SavedCompanyEntityJpa> findByUserIdAndCompanyId(Long userId, Long companyId);
    void deleteByUserIdAndCompanyId(Long userId, Long companyId);
    boolean existsByUserIdAndCompanyId(Long userId, Long companyId);
}
