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
    public CompanyImage save(CompanyImage image) {
        CompanyImageEntityJpa entity = toEntity(image);
        CompanyImageEntityJpa saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<CompanyImage> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<CompanyImage> findByCompanyId(Long companyId) {
        return jpaRepository.findByCompanyIdOrderByDisplayOrderAsc(companyId)
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public void deleteByCompanyId(Long companyId) {
        jpaRepository.deleteByCompanyId(companyId);
    }

    private CompanyImageEntityJpa toEntity(CompanyImage image) {
        return CompanyImageEntityJpa.builder()
                .id(image.getId())
                .companyId(image.getCompanyId())
                .imageUrl(image.getImageUrl())
                .description(image.getDescription())
                .displayOrder(image.getDisplayOrder())
                .createdAt(image.getCreatedAt())
                .updatedAt(image.getUpdatedAt())
                .build();
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
}
