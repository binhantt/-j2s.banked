package com.example.bankend_hovan_J2.infrastructure.persistence.industry;

import com.example.bankend_hovan_J2.domain.industry.Industry;
import com.example.bankend_hovan_J2.domain.industry.IndustryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class IndustryRepositoryImpl implements IndustryRepository {
    
    private final IndustryJpaRepository jpaRepository;
    
    @Override
    public List<Industry> findAll() {
        return jpaRepository.findAllByOrderByNameAsc();
    }
    
    @Override
    public List<Industry> findAllActive() {
        return jpaRepository.findByIsActiveTrueOrderByNameAsc();
    }
    
    @Override
    public Optional<Industry> findById(Long id) {
        return jpaRepository.findById(id);
    }
    
    @Override
    public Optional<Industry> findByName(String name) {
        return jpaRepository.findByNameIgnoreCase(name);
    }
    
    @Override
    public Industry save(Industry industry) {
        return jpaRepository.save(industry);
    }
    
    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }
    
    @Override
    public boolean existsByName(String name) {
        return jpaRepository.existsByNameIgnoreCase(name);
    }
    
    @Override
    public boolean existsByNameAndIdNot(String name, Long id) {
        return jpaRepository.existsByNameIgnoreCaseAndIdNot(name, id);
    }
}