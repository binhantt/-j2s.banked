package com.example.bankend_hovan_J2.infrastructure.persistence.company;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyJpaRepository extends JpaRepository<CompanyEntityJpa, Long> {
    
    @Query("SELECT c FROM CompanyEntityJpa c WHERE c.hrId = :hrId AND EXISTS (SELECT u FROM UserEntityJpa u WHERE u.id = c.hrId AND u.isActive = true)")
    Optional<CompanyEntityJpa> findByHrId(@Param("hrId") Long hrId);

    @Query("SELECT c FROM CompanyEntityJpa c WHERE c.hrId = :hrId")
    Optional<CompanyEntityJpa> findByHrIdIncludingInactive(@Param("hrId") Long hrId);

    @Query("SELECT c FROM CompanyEntityJpa c WHERE EXISTS (SELECT u FROM UserEntityJpa u WHERE u.id = c.hrId AND u.isActive = true)")
    List<CompanyEntityJpa> findAllActive();

    @Query("SELECT c FROM CompanyEntityJpa c WHERE c.id = :id AND EXISTS (SELECT u FROM UserEntityJpa u WHERE u.id = c.hrId AND u.isActive = true)")
    Optional<CompanyEntityJpa> findActiveById(@Param("id") Long id);

    boolean existsByDomainId(Long domainId);
}
