package com.example.bankend_hovan_J2.application.company;

import com.example.bankend_hovan_J2.application.domain.DomainResponse;
import com.example.bankend_hovan_J2.domain.company.entity.Company;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyWithDomainResponse {
    private Long id;
    private Long hrId;
    private String name;
    private String logoUrl;
    private Long domainId;
    private DomainResponse domain; // Domain information
    private String companySize;
    private Integer foundedYear;
    private String website;
    private String email;
    private String phone;
    private String address;
    private String description;
    private String mission;
    private String vision;
    private String values;
    private String benefits;
    private String workingHours;
    private String imageGallery;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CompanyWithDomainResponse from(Company company, DomainResponse domain) {
        return CompanyWithDomainResponse.builder()
                .id(company.getId())
                .hrId(company.getHrId())
                .name(company.getName())
                .logoUrl(company.getLogoUrl())
                .domainId(company.getDomainId())
                .domain(domain)
                .companySize(company.getCompanySize())
                .foundedYear(company.getFoundedYear())
                .website(company.getWebsite())
                .email(company.getEmail())
                .phone(company.getPhone())
                .address(company.getAddress())
                .description(company.getDescription())
                .mission(company.getMission())
                .vision(company.getVision())
                .values(company.getValues())
                .benefits(company.getBenefits())
                .workingHours(company.getWorkingHours())
                .imageGallery(company.getImageGallery())
                .createdAt(company.getCreatedAt())
                .updatedAt(company.getUpdatedAt())
                .build();
    }
}