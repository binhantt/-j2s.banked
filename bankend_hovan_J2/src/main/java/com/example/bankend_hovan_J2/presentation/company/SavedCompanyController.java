package com.example.bankend_hovan_J2.presentation.company;

import com.example.bankend_hovan_J2.infrastructure.persistence.company.SavedCompanyEntityJpa;
import com.example.bankend_hovan_J2.infrastructure.persistence.company.SavedCompanyJpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/saved-companies")
public class SavedCompanyController {

    private final SavedCompanyJpaRepository savedCompanyRepository;

    public SavedCompanyController(SavedCompanyJpaRepository savedCompanyRepository) {
        this.savedCompanyRepository = savedCompanyRepository;
    }

    // Save a company
    @PostMapping
    public ResponseEntity<?> saveCompany(@RequestBody SaveCompanyRequest request) {
        try {
            System.out.println("=== Save Company Request ===");
            System.out.println("User ID: " + request.getUserId());
            System.out.println("Company ID: " + request.getCompanyId());

            // Check if already saved
            if (savedCompanyRepository.existsByUserIdAndCompanyId(request.getUserId(), request.getCompanyId())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Company already saved"));
            }

            SavedCompanyEntityJpa savedCompany = new SavedCompanyEntityJpa();
            savedCompany.setUserId(request.getUserId());
            savedCompany.setCompanyId(request.getCompanyId());

            SavedCompanyEntityJpa saved = savedCompanyRepository.save(savedCompany);
            System.out.println("=== Company saved successfully ===");
            
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.out.println("ERROR saving company: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to save company"));
        }
    }

    // Get user's saved companies
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SavedCompanyEntityJpa>> getUserSavedCompanies(@PathVariable Long userId) {
        List<SavedCompanyEntityJpa> savedCompanies = savedCompanyRepository.findByUserId(userId);
        return ResponseEntity.ok(savedCompanies);
    }

    // Check if company is saved
    @GetMapping("/check/{userId}/{companyId}")
    public ResponseEntity<Boolean> checkSaved(@PathVariable Long userId, @PathVariable Long companyId) {
        boolean saved = savedCompanyRepository.existsByUserIdAndCompanyId(userId, companyId);
        return ResponseEntity.ok(saved);
    }

    // Unsave a company
    @DeleteMapping("/{userId}/{companyId}")
    @Transactional
    public ResponseEntity<?> unsaveCompany(@PathVariable Long userId, @PathVariable Long companyId) {
        try {
            System.out.println("=== Unsave Company Request ===");
            System.out.println("User ID: " + userId);
            System.out.println("Company ID: " + companyId);

            savedCompanyRepository.deleteByUserIdAndCompanyId(userId, companyId);
            System.out.println("=== Company unsaved successfully ===");
            
            return ResponseEntity.ok(Map.of("message", "Company unsaved successfully"));
        } catch (Exception e) {
            System.out.println("ERROR unsaving company: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to unsave company"));
        }
    }
}

class SaveCompanyRequest {
    private Long userId;
    private Long companyId;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
}
