package com.example.bankend_hovan_J2.application.company;

import com.example.bankend_hovan_J2.domain.company.entity.CompanyImage;
import lombok.Data;

@Data
public class AddCompanyImageRequest {
    
    private Long companyId;
    private String imageUrl;
    private String title;
    private String description;
    private CompanyImage.ImageType type;
    private Integer displayOrder;
}