package com.example.bankend_hovan_J2.domain.domain.repository;

import com.example.bankend_hovan_J2.domain.domain.entity.Domain;

import java.util.List;
import java.util.Optional;

public interface DomainRepository {
    Domain save(Domain domain);
    Optional<Domain> findById(Long id);
    List<Domain> findAll();
    List<Domain> findByIsActive(Boolean isActive);
    void deleteById(Long id);
    boolean existsById(Long id);
    boolean existsByName(String name);
}