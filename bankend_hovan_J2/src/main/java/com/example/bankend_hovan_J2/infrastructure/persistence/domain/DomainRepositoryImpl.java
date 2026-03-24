package com.example.bankend_hovan_J2.infrastructure.persistence.domain;

import com.example.bankend_hovan_J2.domain.domain.entity.Domain;
import com.example.bankend_hovan_J2.domain.domain.repository.DomainRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class DomainRepositoryImpl implements DomainRepository {
    private final DomainJpaRepository jpaRepository;

    @Override
    public Domain save(Domain domain) {
        DomainEntityJpa entity = toEntity(domain);
        DomainEntityJpa saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Domain> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Domain> findAll() {
        return jpaRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Domain> findByIsActive(Boolean isActive) {
        return jpaRepository.findByIsActive(isActive)
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return jpaRepository.existsById(id);
    }

    @Override
    public boolean existsByName(String name) {
        return jpaRepository.existsByName(name);
    }

    private DomainEntityJpa toEntity(Domain domain) {
        return DomainEntityJpa.builder()
                .id(domain.getId())
                .name(domain.getName())
                .description(domain.getDescription())
                .isActive(domain.getIsActive())
                .jobCount(domain.getJobCount())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .build();
    }

    private Domain toDomain(DomainEntityJpa entity) {
        return Domain.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .isActive(entity.getIsActive())
                .jobCount(entity.getJobCount())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}