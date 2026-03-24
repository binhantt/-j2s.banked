package com.example.bankend_hovan_J2.application.company;

import com.example.bankend_hovan_J2.application.domain.DomainResponse;
import com.example.bankend_hovan_J2.application.domain.DomainService;
import com.example.bankend_hovan_J2.domain.company.entity.Company;
import com.example.bankend_hovan_J2.domain.company.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyService {
    private final CompanyRepository companyRepository;
    private final DomainService domainService;

    public Optional<CompanyWithDomainResponse> getCompanyWithDomain(Long id) {
        Optional<Company> companyOpt = companyRepository.findById(id);
        if (companyOpt.isEmpty()) {
            return Optional.empty();
        }

        Company company = companyOpt.get();
        DomainResponse domain = null;
        
        if (company.getDomainId() != null) {
            try {
                domain = domainService.getDomainById(company.getDomainId());
            } catch (Exception e) {
                // Domain not found, continue without domain info
            }
        }

        return Optional.of(CompanyWithDomainResponse.from(company, domain));
    }

    public Optional<CompanyWithDomainResponse> getCompanyWithDomainByHrId(Long hrId) {
        Optional<Company> companyOpt = companyRepository.findByHrId(hrId);
        if (companyOpt.isEmpty()) {
            return Optional.empty();
        }

        Company company = companyOpt.get();
        DomainResponse domain = null;
        
        if (company.getDomainId() != null) {
            try {
                domain = domainService.getDomainById(company.getDomainId());
            } catch (Exception e) {
                // Domain not found, continue without domain info
            }
        }

        return Optional.of(CompanyWithDomainResponse.from(company, domain));
    }

    public Optional<CompanyBasicInfoResponse> getCompanyBasicInfo(Long id) {
        Optional<Company> companyOpt = companyRepository.findById(id);
        if (companyOpt.isEmpty()) {
            return Optional.empty();
        }

        Company company = companyOpt.get();
        DomainResponse domain = null;
        
        if (company.getDomainId() != null) {
            try {
                domain = domainService.getDomainById(company.getDomainId());
            } catch (Exception e) {
                // Domain not found, continue without domain info
            }
        }

        return Optional.of(CompanyBasicInfoResponse.from(company, domain));
    }

    public Optional<CompanyBasicInfoResponse> getCompanyBasicInfoByHrId(Long hrId) {
        Optional<Company> companyOpt = companyRepository.findByHrId(hrId);
        if (companyOpt.isEmpty()) {
            return Optional.empty();
        }

        Company company = companyOpt.get();
        DomainResponse domain = null;
        
        if (company.getDomainId() != null) {
            try {
                domain = domainService.getDomainById(company.getDomainId());
            } catch (Exception e) {
                // Domain not found, continue without domain info
            }
        }

        return Optional.of(CompanyBasicInfoResponse.from(company, domain));
    }

    public List<CompanyWithDomainResponse> getAllCompaniesWithDomain() {
        List<Company> companies = companyRepository.findAll();
        
        return companies.stream()
                .map(company -> {
                    DomainResponse domain = null;
                    if (company.getDomainId() != null) {
                        try {
                            domain = domainService.getDomainById(company.getDomainId());
                        } catch (Exception e) {
                            // Domain not found, continue without domain info
                        }
                    }
                    return CompanyWithDomainResponse.from(company, domain);
                })
                .collect(Collectors.toList());
    }
}