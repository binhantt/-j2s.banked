package com.example.bankend_hovan_J2.presentation.company;

import com.example.bankend_hovan_J2.domain.company.entity.Company;
import com.example.bankend_hovan_J2.domain.company.repository.CompanyRepository;
import com.example.bankend_hovan_J2.infrastructure.persistence.company.SavedCompanyEntityJpa;
import com.example.bankend_hovan_J2.infrastructure.persistence.company.SavedCompanyJpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/saved-companies")
public class SavedCompanyController {

    private final SavedCompanyJpaRepository savedCompanyRepository;
    private final CompanyRepository companyRepository;

    public SavedCompanyController(
            SavedCompanyJpaRepository savedCompanyRepository,
            CompanyRepository companyRepository) {
        this.savedCompanyRepository = savedCompanyRepository;
        this.companyRepository = companyRepository;
    }

    // Save a company
    @PostMapping
    public ResponseEntity<?> saveCompany(@RequestBody SaveCompanyRequest request) {
        try {
            System.out.println("=== POST /api/saved-companies - Save Company Request ===");
            System.out.println("User ID: " + request.getUserId());
            System.out.println("Company ID: " + request.getCompanyId());

            // Check if already saved
            if (savedCompanyRepository.existsByUserIdAndCompanyId(request.getUserId(), request.getCompanyId())) {
                System.out.println("Company already saved!");
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Company already saved"));
            }

            SavedCompanyEntityJpa savedCompany = new SavedCompanyEntityJpa();
            savedCompany.setUserId(request.getUserId());
            savedCompany.setCompanyId(request.getCompanyId());

            SavedCompanyEntityJpa saved = savedCompanyRepository.save(savedCompany);
            System.out.println("=== Company saved successfully! savedId=" + saved.getId() + " ===");

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.out.println("ERROR saving company: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to save company"));
        }
    }

    // Get user's saved companies WITH full company details (FIX: single API call, no N+1)
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SavedCompanyResponse>> getUserSavedCompanies(@PathVariable Long userId) {
        System.out.println("=== GET /api/saved-companies/user/" + userId + " ===");

        List<SavedCompanyEntityJpa> savedCompanies = savedCompanyRepository.findByUserId(userId);
        System.out.println("Found " + savedCompanies.size() + " saved companies for userId: " + userId);

        List<SavedCompanyResponse> response = savedCompanies.stream()
                .map(this::buildSavedCompanyResponse)
                .collect(Collectors.toList());

        System.out.println("Returning " + response.size() + " saved company responses");
        return ResponseEntity.ok(response);
    }

    // Build response with company details nested under "company"
    private SavedCompanyResponse buildSavedCompanyResponse(SavedCompanyEntityJpa savedCompany) {
        SavedCompanyResponse.SavedCompanyResponseBuilder builder = SavedCompanyResponse.builder()
                .id(savedCompany.getId())
                .userId(savedCompany.getUserId())
                .companyId(savedCompany.getCompanyId())
                .createdAt(savedCompany.getCreatedAt());

        // Enrich with company details
        Optional<Company> companyOpt = companyRepository.findById(savedCompany.getCompanyId());
        if (companyOpt.isPresent()) {
            Company company = companyOpt.get();
            builder.company(SavedCompanyResponse.CompanyDetails.builder()
                    .id(company.getId())
                    .hrId(company.getHrId())
                    .name(company.getName())
                    .logoUrl(company.getLogoUrl())
                    .domainId(company.getDomainId())
                    .companySize(company.getCompanySize())
                    .foundedYear(company.getFoundedYear())
                    .website(company.getWebsite())
                    .email(company.getEmail())
                    .phone(company.getPhone())
                    .address(company.getAddress())
                    .description(company.getDescription())
                    .benefits(company.getBenefits())
                    .workingHours(company.getWorkingHours())
                    .createdAt(company.getCreatedAt())
                    .build());
        }

        return builder.build();
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
