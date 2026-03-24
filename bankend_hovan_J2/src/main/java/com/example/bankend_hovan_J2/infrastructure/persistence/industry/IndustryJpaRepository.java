package com.example.bankend_hovan_J2.infrastructure.persistence.industry;

import com.example.bankend_hovan_J2.domain.industry.Industry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IndustryJpaRepository extends JpaRepository<Industry, Long> {
    
    List<Industry> findAllByOrderByNameAsc();
    
    List<Industry> findByIsActiveTrueOrderByNameAsc();
    
    Optional<Industry> findByNameIgnoreCase(String name);
    
    boolean existsByNameIgnoreCase(String name);
    
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}