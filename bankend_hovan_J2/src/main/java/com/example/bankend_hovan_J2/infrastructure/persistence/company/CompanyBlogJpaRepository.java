package com.example.bankend_hovan_J2.infrastructure.persistence.company;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyBlogJpaRepository extends JpaRepository<CompanyBlogEntityJpa, Long> {
    List<CompanyBlogEntityJpa> findByCompanyId(Long companyId);
    List<CompanyBlogEntityJpa> findByStatus(String status);
    
    @Query("SELECT cb FROM CompanyBlogEntityJpa cb JOIN CompanyEntityJpa c ON cb.companyId = c.id WHERE c.hrId = :hrId")
    List<CompanyBlogEntityJpa> findByHrId(@Param("hrId") Long hrId);
}
