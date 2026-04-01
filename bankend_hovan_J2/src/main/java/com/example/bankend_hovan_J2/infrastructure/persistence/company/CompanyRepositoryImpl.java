package com.example.bankend_hovan_J2.infrastructure.persistence.company;

import com.example.bankend_hovan_J2.domain.company.entity.Company;
import com.example.bankend_hovan_J2.domain.company.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class CompanyRepositoryImpl implements CompanyRepository {
    private final CompanyJpaRepository jpaRepository;

    @Override
    public Company save(Company company) {
        CompanyEntityJpa entity = toEntity(company);
        CompanyEntityJpa saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Company> findById(Long id) {
        return jpaRepository.findActiveById(id).map(this::toDomain);
    }

    @Override
    public Optional<Company> findByHrId(Long hrId) {
        return jpaRepository.findByHrId(hrId).map(this::toDomain);
    }

    @Override
    public Optional<Company> findByHrIdIncludingInactive(Long hrId) {
        return jpaRepository.findByHrIdIncludingInactive(hrId).map(this::toDomain);
    }

    @Override
    public List<Company> findAll() {
        return jpaRepository.findAllActive()
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public boolean existsByDomainId(Long domainId) {
        return jpaRepository.existsByDomainId(domainId);
    }

    private CompanyEntityJpa toEntity(Company company) {
        return CompanyEntityJpa.builder()
                .id(company.getId())
                .hrId(company.getHrId())
                .name(company.getName())
                .logoUrl(company.getLogoUrl())
                .domainId(company.getDomainId())
                .companySize(company.getCompanySize())
                .foundedYear(company.getFoundedYear())
                .website(company.getWebsite())
                .email(company.getEmail())
                .phone(company.getPhone())
                .address(company.getAddress())
                .description(company.getDescription())
                .mission(company.getMission())
                .vision(company.getVision())
                .values(company.getValues())
                .benefits(company.getBenefits())
                .workingHours(company.getWorkingHours())
                .imageGallery(company.getImageGallery())
                .tags(company.getTags())
                .facebookLink(company.getFacebookLink())
                .instagramLink(company.getInstagramLink())
                .zaloLink(company.getZaloLink())
                .createdAt(company.getCreatedAt())
                .updatedAt(company.getUpdatedAt())
                .build();
    }

    private Company toDomain(CompanyEntityJpa entity) {
        return Company.builder()
                .id(entity.getId())
                .hrId(entity.getHrId())
                .name(entity.getName())
                .logoUrl(entity.getLogoUrl())
                .domainId(entity.getDomainId())
                .companySize(entity.getCompanySize())
                .foundedYear(entity.getFoundedYear())
                .website(entity.getWebsite())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .address(entity.getAddress())
                .description(entity.getDescription())
                .mission(entity.getMission())
                .vision(entity.getVision())
                .values(entity.getValues())
                .benefits(entity.getBenefits())
                .workingHours(entity.getWorkingHours())
                .imageGallery(entity.getImageGallery())
                .tags(entity.getTags())
                .facebookLink(entity.getFacebookLink())
                .instagramLink(entity.getInstagramLink())
                .zaloLink(entity.getZaloLink())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
