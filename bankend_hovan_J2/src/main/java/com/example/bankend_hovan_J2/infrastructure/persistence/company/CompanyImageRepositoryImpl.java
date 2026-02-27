package com.example.bankend_hovan_J2.infrastructure.persistence.company;

import com.example.bankend_hovan_J2.domain.company.entity.CompanyImage;
import com.example.bankend_hovan_J2.domain.company.repository.CompanyImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class CompanyImageRepositoryImpl implements CompanyImageRepository {
    private final CompanyImageJpaRepository jpaRepository;

    @Override
    public List<CompanyImage> findByCompanyId(Long companyId) {
        return jpaRepository.findByCompanyIdOrderByDisplayOrderAsc(companyId)
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<CompanyImage> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public CompanyImage save(CompanyImage companyImage) {
        CompanyImageEntityJpa entity = toEntity(companyImage);
        CompanyImageEntityJpa saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    private CompanyImage toDomain(CompanyImageEntityJpa entity) {
        return CompanyImage.builder()
                .id(entity.getId())
                .companyId(entity.getCompanyId())
                .imageUrl(entity.getImageUrl())
                .description(entity.getDescription())
                .displayOrder(entity.getDisplayOrder())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private CompanyImageEntityJpa toEntity(CompanyImage domain) {
        return CompanyImageEntityJpa.builder()
                .id(domain.getId())
                .companyId(domain.getCompanyId())
                .imageUrl(domain.getImageUrl())
                .description(domain.getDescription())
                .displayOrder(domain.getDisplayOrder())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .build();
    }
}
