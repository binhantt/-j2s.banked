package com.example.bankend_hovan_J2.application.domain;

import com.example.bankend_hovan_J2.domain.company.repository.CompanyRepository;
import com.example.bankend_hovan_J2.domain.domain.entity.Domain;
import com.example.bankend_hovan_J2.domain.domain.repository.DomainRepository;
import com.example.bankend_hovan_J2.domain.job.repository.JobPostingRepository;
import com.example.bankend_hovan_J2.presentation.exception.DomainNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DomainService {
    private final DomainRepository domainRepository;
    private final JobPostingRepository jobPostingRepository;
    private final CompanyRepository companyRepository;

    public List<DomainResponse> getAllDomains() {
        List<Domain> domains = domainRepository.findAll();
        return domains.stream()
                .map(domain -> {
                    DomainResponse res = DomainResponse.from(domain);
                    res.setJobCount((int) jobPostingRepository.countActiveJobsByDomainId(domain.getId()));
                    return res;
                })
                .collect(Collectors.toList());
    }

    public DomainResponse getDomainById(Long id) {
        Domain domain = domainRepository.findById(id)
                .orElseThrow(() -> new DomainNotFoundException("Không tìm thấy lĩnh vực với ID: " + id));
        DomainResponse res = DomainResponse.from(domain);
        res.setJobCount((int) jobPostingRepository.countActiveJobsByDomainId(domain.getId()));
        return res;
    }

    public List<DomainResponse> getDomainsByStatus(Boolean isActive) {
        List<Domain> domains = domainRepository.findByIsActive(isActive);
        return domains.stream()
                .map(domain -> {
                    DomainResponse res = DomainResponse.from(domain);
                    res.setJobCount((int) jobPostingRepository.countActiveJobsByDomainId(domain.getId()));
                    return res;
                })
                .collect(Collectors.toList());
    }

    public DomainResponse createDomain(CreateDomainRequest request) {
        // Check if domain name already exists
        if (domainRepository.existsByName(request.getName())) {
            throw new RuntimeException("Lĩnh vực với tên này đã tồn tại");
        }

        Domain domain = Domain.builder()
                .name(request.getName())
                .description(request.getDescription())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .jobCount(0)
                .build();

        Domain savedDomain = domainRepository.save(domain);
        return DomainResponse.from(savedDomain);
    }

    public DomainResponse updateDomain(Long id, CreateDomainRequest request) {
        Domain domain = domainRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lĩnh vực với ID: " + id));

        // Check if new name conflicts with existing domain (excluding current domain)
        if (!domain.getName().equals(request.getName()) && domainRepository.existsByName(request.getName())) {
            throw new RuntimeException("Lĩnh vực với tên này đã tồn tại");
        }

        domain.setName(request.getName());
        domain.setDescription(request.getDescription());
        domain.setIsActive(request.getIsActive() != null ? request.getIsActive() : domain.getIsActive());

        Domain savedDomain = domainRepository.save(domain);
        return DomainResponse.from(savedDomain);
    }

    public void deleteDomain(Long id) {
        if (!domainRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy lĩnh vực với ID: " + id);
        }
        
        // Check if any companies are associated with this domain
        if (companyRepository.existsByDomainId(id)) {
            throw new IllegalArgumentException("Lĩnh vực này đã có công ty hoặc công việc thuộc về, không thể xóa!");
        }
        
        domainRepository.deleteById(id);
    }

    public DomainResponse toggleDomainStatus(Long id, Boolean isActive) {
        Domain domain = domainRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lĩnh vực với ID: " + id));

        domain.setIsActive(isActive);
        Domain savedDomain = domainRepository.save(domain);
        return DomainResponse.from(savedDomain);
    }
}