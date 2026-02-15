package com.example.bankend_hovan_J2.application.company;

import com.example.bankend_hovan_J2.domain.company.entity.Company;
import com.example.bankend_hovan_J2.domain.company.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CreateCompanyUseCase {
    private final CompanyRepository companyRepository;

    @Transactional
    public Company execute(Company company) {
        // Check if HR already has a company
        companyRepository.findByHrId(company.getHrId())
                .ifPresent(existing -> {
                    throw new RuntimeException("HR already has a company");
                });

        return companyRepository.save(company);
    }
}
