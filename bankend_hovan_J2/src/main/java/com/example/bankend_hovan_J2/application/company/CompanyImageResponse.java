package com.example.bankend_hovan_J2.application.company;

import com.example.bankend_hovan_J2.domain.company.entity.CompanyImage;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CompanyImageResponse {
    
    private Long id;
    private Long companyId;
    private String imageUrl;
    private String title;
    private String description;
    private CompanyImage.ImageType type;
    private Integer displayOrder;
    private LocalDateTime createdAt;
    
    public static CompanyImageResponse from(CompanyImage image) {
        return CompanyImageResponse.builder()
                .id(image.getId())
                .companyId(image.getCompanyId())
                .imageUrl(image.getImageUrl())
                .title(image.getTitle())
                .description(image.getDescription())
                .type(image.getType())
                .displayOrder(image.getDisplayOrder())
                .createdAt(image.getCreatedAt())
                .build();
    }
}