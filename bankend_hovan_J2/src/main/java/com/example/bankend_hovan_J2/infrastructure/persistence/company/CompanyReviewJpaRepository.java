package com.example.bankend_hovan_J2.infrastructure.persistence.company;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyReviewJpaRepository extends JpaRepository<CompanyReviewEntityJpa, Long> {
    List<CompanyReviewEntityJpa> findByCompanyIdOrderByCreatedAtDesc(Long companyId);
    Optional<CompanyReviewEntityJpa> findByCompanyIdAndUserId(Long companyId, Long userId);
    
    @Query("SELECT AVG(r.rating) FROM CompanyReviewEntityJpa r WHERE r.companyId = :companyId")
    Double getAverageRating(Long companyId);
    
    @Query("SELECT COUNT(r) FROM CompanyReviewEntityJpa r WHERE r.companyId = :companyId")
    Long getReviewCount(Long companyId);
}
