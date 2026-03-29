package com.example.bankend_hovan_J2.application.company;

import com.example.bankend_hovan_J2.domain.company.entity.CompanyImage;
import com.example.bankend_hovan_J2.domain.company.repository.CompanyImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CompanyImageService {
    
    private final CompanyImageRepository companyImageRepository;
    private static final int MAX_IMAGES_PER_COMPANY = 20;
    
    public List<CompanyImage> getCompanyImages(Long companyId) {
        return companyImageRepository.findByCompanyId(companyId);
    }
    
    @Transactional
    public CompanyImage addCompanyImage(AddCompanyImageRequest request) {
        CompanyImage image = CompanyImage.builder()
                .companyId(request.getCompanyId())
                .imageUrl(request.getImageUrl())
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType() != null ? request.getType() : CompanyImage.ImageType.GENERAL)
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .build();
        
        return companyImageRepository.save(image);
    }
    
    @Transactional
    public void deleteCompanyImage(Long imageId) {
        companyImageRepository.deleteById(imageId);
    }
}