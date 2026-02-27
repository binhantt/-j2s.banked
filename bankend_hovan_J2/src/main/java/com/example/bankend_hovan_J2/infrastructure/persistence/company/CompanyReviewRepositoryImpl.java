package com.example.bankend_hovan_J2.infrastructure.persistence.company;

import com.example.bankend_hovan_J2.domain.company.entity.CompanyReview;
import com.example.bankend_hovan_J2.domain.company.repository.CompanyReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class CompanyReviewRepositoryImpl implements CompanyReviewRepository {
    private final CompanyReviewJpaRepository jpaRepository;

    @Override
    public List<CompanyReview> findByCompanyId(Long companyId) {
        return jpaRepository.findByCompanyIdOrderByCreatedAtDesc(companyId)
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<CompanyReview> findByCompanyIdAndUserId(Long companyId, Long userId) {
        return jpaRepository.findByCompanyIdAndUserId(companyId, userId)
                .map(this::toDomain);
    }

    @Override
    public CompanyReview save(CompanyReview review) {
        CompanyReviewEntityJpa entity = toEntity(review);
        CompanyReviewEntityJpa saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public Double getAverageRating(Long companyId) {
        Double avg = jpaRepository.getAverageRating(companyId);
        return avg != null ? avg : 0.0;
    }

    @Override
    public Long getReviewCount(Long companyId) {
        return jpaRepository.getReviewCount(companyId);
    }

    private CompanyReview toDomain(CompanyReviewEntityJpa entity) {
        return CompanyReview.builder()
                .id(entity.getId())
                .companyId(entity.getCompanyId())
                .userId(entity.getUserId())
                .rating(entity.getRating())
                .comment(entity.getComment())
                .userName(entity.getUserName())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private CompanyReviewEntityJpa toEntity(CompanyReview domain) {
        return CompanyReviewEntityJpa.builder()
                .id(domain.getId())
                .companyId(domain.getCompanyId())
                .userId(domain.getUserId())
                .rating(domain.getRating())
                .comment(domain.getComment())
                .userName(domain.getUserName())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .build();
    }
}
