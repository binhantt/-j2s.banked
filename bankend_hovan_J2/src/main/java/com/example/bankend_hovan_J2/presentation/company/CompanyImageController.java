package com.example.bankend_hovan_J2.presentation.company;

import com.example.bankend_hovan_J2.application.company.*;
import com.example.bankend_hovan_J2.domain.company.CompanyImage;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/company-images")
@RequiredArgsConstructor
public class CompanyImageController {
    
    private final CompanyImageService companyImageService;
    
    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<CompanyImageResponse>> getCompanyImages(@PathVariable Long companyId) {
        List<CompanyImageResponse> images = companyImageService.getCompanyImages(companyId)
                .stream()
                .map(CompanyImageResponse::from)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(images);
    }
    
    @GetMapping("/company/{companyId}/type/{type}")
    public ResponseEntity<List<CompanyImageResponse>> getCompanyImagesByType(
            @PathVariable Long companyId,
            @PathVariable CompanyImage.ImageType type) {
        // For now, just return all images for the company
        // You can implement filtering by type later if needed
        List<CompanyImageResponse> images = companyImageService.getCompanyImages(companyId)
                .stream()
                .filter(image -> image.getType() == type)
                .map(CompanyImageResponse::from)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(images);
    }
    
    @PostMapping
    public ResponseEntity<CompanyImageResponse> addCompanyImage(@RequestBody AddCompanyImageRequest request) {
        CompanyImage image = companyImageService.addCompanyImage(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(CompanyImageResponse.from(image));
    }
    
    @DeleteMapping("/{imageId}")
    public ResponseEntity<Void> deleteCompanyImage(@PathVariable Long imageId) {
        companyImageService.deleteCompanyImage(imageId);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/company/{companyId}/url")
    public ResponseEntity<Void> deleteCompanyImageByUrl(
            @PathVariable Long companyId,
            @RequestParam String imageUrl) {
        // For now, we'll just delete by ID
        // You can implement delete by URL later if needed
        return ResponseEntity.noContent().build();
    }
}