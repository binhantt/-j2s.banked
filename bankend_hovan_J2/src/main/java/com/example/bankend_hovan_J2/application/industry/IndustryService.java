package com.example.bankend_hovan_J2.application.industry;

import com.example.bankend_hovan_J2.domain.industry.Industry;
import com.example.bankend_hovan_J2.domain.industry.IndustryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class IndustryService {
    
    private final IndustryRepository industryRepository;
    
    public List<Industry> getAllIndustries() {
        return industryRepository.findAll();
    }
    
    public List<Industry> getActiveIndustries() {
        return industryRepository.findAllActive();
    }
    
    public Industry getIndustryById(Long id) {
        return industryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Industry not found with id: " + id));
    }
    
    @Transactional
    public Industry createIndustry(CreateIndustryRequest request) {
        // Validate input
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new RuntimeException("Industry name is required");
        }
        
        if (request.getName().length() > 100) {
            throw new RuntimeException("Industry name must not exceed 100 characters");
        }
        
        if (request.getDescription() != null && request.getDescription().length() > 500) {
            throw new RuntimeException("Description must not exceed 500 characters");
        }
        
        // Check if industry name already exists
        if (industryRepository.existsByName(request.getName())) {
            throw new RuntimeException("Industry with name '" + request.getName() + "' already exists");
        }
        
        Industry industry = Industry.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .isActive(true)
                .build();
        
        return industryRepository.save(industry);
    }
    
    @Transactional
    public Industry updateIndustry(Long id, UpdateIndustryRequest request) {
        Industry industry = getIndustryById(id);
        
        // Validate input
        if (request.getName() != null) {
            if (request.getName().trim().isEmpty()) {
                throw new RuntimeException("Industry name cannot be empty");
            }
            
            if (request.getName().length() > 100) {
                throw new RuntimeException("Industry name must not exceed 100 characters");
            }
        }
        
        if (request.getDescription() != null && request.getDescription().length() > 500) {
            throw new RuntimeException("Description must not exceed 500 characters");
        }
        
        // Check if new name conflicts with existing industry
        if (request.getName() != null && 
            !request.getName().equalsIgnoreCase(industry.getName()) &&
            industryRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new RuntimeException("Industry with name '" + request.getName() + "' already exists");
        }
        
        industry.updateInfo(request.getName(), request.getDescription());
        
        return industryRepository.save(industry);
    }
    
    @Transactional
    public Industry toggleIndustryStatus(Long id) {
        Industry industry = getIndustryById(id);
        
        if (industry.getIsActive()) {
            industry.deactivate();
        } else {
            industry.activate();
        }
        
        return industryRepository.save(industry);
    }
    
    @Transactional
    public void deleteIndustry(Long id) {
        Industry industry = getIndustryById(id);
        industryRepository.deleteById(id);
    }
}