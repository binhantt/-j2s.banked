package com.example.bankend_hovan_J2.infrastructure.persistence.profile;

import com.example.bankend_hovan_J2.domain.profile.entity.HRProfile;
import com.example.bankend_hovan_J2.domain.profile.repository.HRProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class HRProfileRepositoryImpl implements HRProfileRepository {

    private final HRProfileJpaRepository jpaRepository;

    @Override
    public HRProfile save(HRProfile profile) {
        HRProfileEntityJpa entity = toEntity(profile);
        HRProfileEntityJpa saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<HRProfile> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<HRProfile> findByUserId(Long userId) {
        return jpaRepository.findByUserId(userId).map(this::toDomain);
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    private HRProfileEntityJpa toEntity(HRProfile domain) {
        HRProfileEntityJpa entity = new HRProfileEntityJpa();
        entity.setId(domain.getId());
        entity.setUserId(domain.getUserId());
        entity.setCompanyName(domain.getCompanyName());
        entity.setCompanySize(domain.getCompanySize());
        entity.setIndustry(domain.getIndustry());
        entity.setWebsite(domain.getWebsite());
        entity.setAddress(domain.getAddress());
        entity.setDescription(domain.getDescription());
        entity.setCreatedAt(domain.getCreatedAt());
        entity.setUpdatedAt(domain.getUpdatedAt());
        return entity;
    }

    private HRProfile toDomain(HRProfileEntityJpa entity) {
        HRProfile domain = new HRProfile();
        domain.setId(entity.getId());
        domain.setUserId(entity.getUserId());
        domain.setCompanyName(entity.getCompanyName());
        domain.setCompanySize(entity.getCompanySize());
        domain.setIndustry(entity.getIndustry());
        domain.setWebsite(entity.getWebsite());
        domain.setAddress(entity.getAddress());
        domain.setDescription(entity.getDescription());
        domain.setCreatedAt(entity.getCreatedAt());
        domain.setUpdatedAt(entity.getUpdatedAt());
        return domain;
    }
}
