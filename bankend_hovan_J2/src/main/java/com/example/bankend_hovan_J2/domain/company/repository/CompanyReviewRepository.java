package com.example.bankend_hovan_J2.domain.company.repository;

import com.example.bankend_hovan_J2.domain.company.entity.CompanyReview;

import java.util.List;
import java.util.Optional;

public interface CompanyReviewRepository {
    List<CompanyReview> findByCompanyId(Long companyId);
    Optional<CompanyReview> findByCompanyIdAndUserId(Long companyId, Long userId);
    CompanyReview save(CompanyReview review);
    void deleteById(Long id);
    Double getAverageRating(Long companyId);
    Long getReviewCount(Long companyId);
}
