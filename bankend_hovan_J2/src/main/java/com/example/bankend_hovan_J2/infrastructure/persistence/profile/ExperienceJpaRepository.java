package com.example.bankend_hovan_J2.infrastructure.persistence.profile;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExperienceJpaRepository extends JpaRepository<ExperienceEntityJpa, Long> {
    List<ExperienceEntityJpa> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}
