package com.example.bankend_hovan_J2.infrastructure.persistence.profile;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CVJpaRepository extends JpaRepository<CVEntityJpa, Long> {
    List<CVEntityJpa> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}
