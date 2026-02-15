package com.example.bankend_hovan_J2.presentation.company;

import com.example.bankend_hovan_J2.domain.company.entity.CompanyImage;
import com.example.bankend_hovan_J2.domain.company.repository.CompanyImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/company-images")
@RequiredArgsConstructor
public class CompanyImageController {
    private final CompanyImageRepository imageRepository;

    @PostMapping
    public ResponseEntity<CompanyImage> createImage(@RequestBody Map<String, Object> request) {
        CompanyImage image = CompanyImage.builder()
                .companyId(getLong(request, "companyId"))
                .imageUrl(getString(request, "imageUrl"))
                .description(getString(request, "description"))
                .displayOrder(getInteger(request, "displayOrder"))
                .build();
        
        CompanyImage saved = imageRepository.save(image);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<CompanyImage>> getImagesByCompany(@PathVariable Long companyId) {
        List<CompanyImage> images = imageRepository.findByCompanyId(companyId);
        return ResponseEntity.ok(images);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyImage> getImage(@PathVariable Long id) {
        return imageRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteImage(@PathVariable Long id) {
        imageRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/company/{companyId}")
    public ResponseEntity<Void> deleteImagesByCompany(@PathVariable Long companyId) {
        imageRepository.deleteByCompanyId(companyId);
        return ResponseEntity.ok().build();
    }

    private String getString(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }

    private Long getLong(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return null;
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        return Long.valueOf(value.toString());
    }

    private Integer getInteger(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return null;
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return Integer.valueOf(value.toString());
    }
}
