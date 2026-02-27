package com.example.bankend_hovan_J2.presentation.company;

import com.example.bankend_hovan_J2.domain.company.entity.CompanyImage;
import com.example.bankend_hovan_J2.domain.company.repository.CompanyImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/company-images")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CompanyImageController {
    private final CompanyImageRepository companyImageRepository;

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<CompanyImage>> getImagesByCompany(@PathVariable Long companyId) {
        List<CompanyImage> images = companyImageRepository.findByCompanyId(companyId);
        return ResponseEntity.ok(images);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyImage> getImage(@PathVariable Long id) {
        return companyImageRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<CompanyImage> createImage(@RequestBody CompanyImage companyImage) {
        CompanyImage saved = companyImageRepository.save(companyImage);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteImage(@PathVariable Long id) {
        companyImageRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
