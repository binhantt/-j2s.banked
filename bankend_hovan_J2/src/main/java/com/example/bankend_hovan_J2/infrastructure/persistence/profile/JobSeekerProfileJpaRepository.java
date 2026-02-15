package com.example.bankend_hovan_J2.infrastructure.persistence.profile;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JobSeekerProfileJpaRepository extends JpaRepository<JobSeekerProfileEntityJpa, Long> {
    Optional<JobSeekerProfileEntityJpa> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}
