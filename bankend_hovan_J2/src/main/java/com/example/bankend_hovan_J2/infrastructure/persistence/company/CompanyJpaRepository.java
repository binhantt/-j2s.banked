package com.example.bankend_hovan_J2.infrastructure.persistence.company;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyJpaRepository extends JpaRepository<CompanyEntityJpa, Long> {
    Optional<CompanyEntityJpa> findByHrId(Long hrId);
}
