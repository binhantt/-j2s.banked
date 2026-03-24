package com.example.bankend_hovan_J2.domain.industry;

import java.util.List;
import java.util.Optional;

public interface IndustryRepository {
    
    List<Industry> findAll();
    
    List<Industry> findAllActive();
    
    Optional<Industry> findById(Long id);
    
    Optional<Industry> findByName(String name);
    
    Industry save(Industry industry);
    
    void deleteById(Long id);
    
    boolean existsByName(String name);
    
    boolean existsByNameAndIdNot(String name, Long id);
}