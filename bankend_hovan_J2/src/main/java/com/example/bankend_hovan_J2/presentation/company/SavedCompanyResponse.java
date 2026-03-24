package com.example.bankend_hovan_J2.presentation.company;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for saved company with full company details included.
 * Frontend expects: item.id, item.companyId, item.createdAt, item.company.name, item.company.logoUrl, etc.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedCompanyResponse {
    private Long id;
    private Long userId;
    private Long companyId;
    private LocalDateTime createdAt;

    // Full company details (wrapped under "company" for frontend compatibility)
    private CompanyDetails company;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompanyDetails {
        private Long id;
        private Long hrId;
        private String name;
        private String logoUrl;
        private Long domainId;
        private String companySize;
        private Integer foundedYear;
        private String website;
        private String email;
        private String phone;
        private String address;
        private String description;
        private String benefits;
        private String workingHours;
        private LocalDateTime createdAt;
    }
}
