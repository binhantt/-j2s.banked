package com.example.bankend_hovan_J2.application.company;

import com.example.bankend_hovan_J2.application.domain.DomainResponse;
import com.example.bankend_hovan_J2.domain.company.entity.Company;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyBasicInfoResponse {
    private Long id;
    private String name;
    private String logoUrl;
    private Long domainId;
    private DomainResponse domain;

    public static CompanyBasicInfoResponse from(Company company, DomainResponse domain) {
        return CompanyBasicInfoResponse.builder()
                .id(company.getId())
                .name(company.getName())
                .logoUrl(company.getLogoUrl())
                .domainId(company.getDomainId())
                .domain(domain)
                .build();
    }
}