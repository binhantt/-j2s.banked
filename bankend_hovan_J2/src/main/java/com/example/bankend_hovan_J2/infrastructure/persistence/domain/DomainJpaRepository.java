package com.example.bankend_hovan_J2.infrastructure.persistence.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DomainJpaRepository extends JpaRepository<DomainEntityJpa, Long> {
    List<DomainEntityJpa> findByIsActive(Boolean isActive);
    boolean existsByName(String name);
    List<DomainEntityJpa> findAllByOrderByCreatedAtDesc();
}