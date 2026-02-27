package com.example.bankend_hovan_J2.infrastructure.persistence.freelance;

import com.example.bankend_hovan_J2.domain.freelance.entity.FreelanceProject;
import com.example.bankend_hovan_J2.domain.freelance.repository.FreelanceProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class FreelanceProjectRepositoryImpl implements FreelanceProjectRepository {
    private final FreelanceProjectJpaRepository jpaRepository;

    @Override
    public FreelanceProject save(FreelanceProject project) {
        FreelanceProjectEntityJpa entity = toEntity(project);
        FreelanceProjectEntityJpa saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<FreelanceProject> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<FreelanceProject> findByClientId(Long clientId) {
        return jpaRepository.findByClientId(clientId)
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<FreelanceProject> findByFreelancerId(Long freelancerId) {
        return jpaRepository.findByFreelancerId(freelancerId)
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<FreelanceProject> findAll() {
        return jpaRepository.findAll()
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    private FreelanceProjectEntityJpa toEntity(FreelanceProject project) {
        return FreelanceProjectEntityJpa.builder()
                .id(project.getId())
                .clientId(project.getClientId())
                .freelancerId(project.getFreelancerId())
                .title(project.getTitle())
                .description(project.getDescription())
                .budget(project.getBudget())
                .depositAmount(project.getDepositAmount())
                .depositStatus(project.getDepositStatus())
                .status(project.getStatus())
                .progress(project.getProgress())
                .deadline(project.getDeadline())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }

    private FreelanceProject toDomain(FreelanceProjectEntityJpa entity) {
        return FreelanceProject.builder()
                .id(entity.getId())
                .clientId(entity.getClientId())
                .freelancerId(entity.getFreelancerId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .budget(entity.getBudget())
                .depositAmount(entity.getDepositAmount())
                .depositStatus(entity.getDepositStatus())
                .status(entity.getStatus())
                .progress(entity.getProgress())
                .deadline(entity.getDeadline())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
