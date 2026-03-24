package com.example.bankend_hovan_J2.presentation.company;

import com.example.bankend_hovan_J2.application.company.CreateCompanyUseCase;
import com.example.bankend_hovan_J2.application.company.UpdateCompanyUseCase;
import com.example.bankend_hovan_J2.application.company.CompanyService;
import com.example.bankend_hovan_J2.application.company.CompanyWithDomainResponse;
import com.example.bankend_hovan_J2.application.company.CompanyBasicInfoResponse;
import com.example.bankend_hovan_J2.domain.company.entity.Company;
import com.example.bankend_hovan_J2.domain.company.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {
    private final CompanyRepository companyRepository;
    private final CreateCompanyUseCase createCompanyUseCase;
    private final UpdateCompanyUseCase updateCompanyUseCase;
    private final CompanyService companyService;

    @PostMapping
    public ResponseEntity<Company> createCompany(@RequestBody Map<String, Object> request) {
        Company company = mapToCompany(request);
        Company created = createCompanyUseCase.execute(company);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Company> updateCompany(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Company company = mapToCompany(request);
        Company updated = updateCompanyUseCase.execute(id, company);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Company> getCompany(@PathVariable Long id) {
        return companyRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/hr/{hrId}")
    public ResponseEntity<Company> getCompanyByHrId(@PathVariable Long hrId) {
        return companyRepository.findByHrId(hrId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Company>> getAllCompanies() {
        List<Company> companies = companyRepository.findAll();
        return ResponseEntity.ok(companies);
    }

    // New endpoints with domain information
    @GetMapping("/with-domain")
    public ResponseEntity<List<CompanyWithDomainResponse>> getAllCompaniesWithDomain() {
        List<CompanyWithDomainResponse> companies = companyService.getAllCompaniesWithDomain();
        return ResponseEntity.ok(companies);
    }

    @GetMapping("/{id}/with-domain")
    public ResponseEntity<CompanyWithDomainResponse> getCompanyWithDomain(@PathVariable Long id) {
        return companyService.getCompanyWithDomain(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/hr/{hrId}/with-domain")
    public ResponseEntity<CompanyWithDomainResponse> getCompanyWithDomainByHrId(@PathVariable Long hrId) {
        return companyService.getCompanyWithDomainByHrId(hrId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Basic info endpoints (lighter payload)
    @GetMapping("/{id}/basic-info")
    public ResponseEntity<CompanyBasicInfoResponse> getCompanyBasicInfo(@PathVariable Long id) {
        return companyService.getCompanyBasicInfo(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/hr/{hrId}/basic-info")
    public ResponseEntity<CompanyBasicInfoResponse> getCompanyBasicInfoByHrId(@PathVariable Long hrId) {
        return companyService.getCompanyBasicInfoByHrId(hrId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Debug endpoint to check company data
    @GetMapping("/debug/{hrId}")
    public ResponseEntity<Map<String, Object>> debugCompanyByHrId(@PathVariable Long hrId) {
        try {
            Company company = companyRepository.findByHrId(hrId).orElse(null);
            Map<String, Object> debug = Map.of(
                "found", company != null,
                "company", company != null ? company : "Not found",
                "hrId", hrId
            );
            return ResponseEntity.ok(debug);
        } catch (Exception e) {
            Map<String, Object> error = Map.of(
                "error", e.getMessage(),
                "hrId", hrId
            );
            return ResponseEntity.ok(error);
        }
    }

    // Simple test endpoint
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testEndpoint() {
        return ResponseEntity.ok(Map.of(
            "status", "OK",
            "message", "Company API is working",
            "timestamp", System.currentTimeMillis()
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        try {
            // Get company to find hrId
            Company company = companyRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Company not found"));
            
            Long hrId = company.getHrId();
            
            // Delete company (this will cascade delete blogs via database constraint if set)
            companyRepository.deleteById(id);
            
            // Also delete all jobs posted by this HR
            // Note: Jobs are linked by userId (HR ID), not companyId
            // You may want to add a method to delete jobs by userId
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    private Company mapToCompany(Map<String, Object> request) {
        return Company.builder()
                .hrId(getLong(request, "hrId"))
                .name(getString(request, "name"))
                .logoUrl(getString(request, "logoUrl"))
                .domainId(getLong(request, "domainId"))
                .companySize(getString(request, "companySize"))
                .foundedYear(getInteger(request, "foundedYear"))
                .website(getString(request, "website"))
                .email(getString(request, "email"))
                .phone(getString(request, "phone"))
                .address(getString(request, "address"))
                .description(getString(request, "description"))
                .mission(getString(request, "mission"))
                .vision(getString(request, "vision"))
                .values(getString(request, "values"))
                .benefits(getString(request, "benefits"))
                .workingHours(getString(request, "workingHours"))
                .imageGallery(getString(request, "imageGallery"))
                .build();
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
