package com.example.bankend_hovan_J2.application.company;

import com.example.bankend_hovan_J2.domain.company.entity.Company;
import com.example.bankend_hovan_J2.domain.company.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UpdateCompanyUseCase {
    private final CompanyRepository companyRepository;

    @Transactional
    public Company execute(Long id, Company company) {
        Company existing = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        // Update fields
        existing.setName(company.getName());
        existing.setLogoUrl(company.getLogoUrl());
        existing.setIndustry(company.getIndustry());
        existing.setCompanySize(company.getCompanySize());
        existing.setFoundedYear(company.getFoundedYear());
        existing.setWebsite(company.getWebsite());
        existing.setEmail(company.getEmail());
        existing.setPhone(company.getPhone());
        existing.setAddress(company.getAddress());
        existing.setDescription(company.getDescription());
        existing.setMission(company.getMission());
        existing.setVision(company.getVision());
        existing.setValues(company.getValues());
        existing.setBenefits(company.getBenefits());
        existing.setWorkingHours(company.getWorkingHours());

        return companyRepository.save(existing);
    }
}
