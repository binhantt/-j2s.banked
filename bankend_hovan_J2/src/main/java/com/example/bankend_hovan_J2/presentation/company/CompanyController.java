package com.example.bankend_hovan_J2.presentation.company;

import com.example.bankend_hovan_J2.application.company.CreateCompanyUseCase;
import com.example.bankend_hovan_J2.application.company.UpdateCompanyUseCase;
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        companyRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    private Company mapToCompany(Map<String, Object> request) {
        return Company.builder()
                .hrId(getLong(request, "hrId"))
                .name(getString(request, "name"))
                .logoUrl(getString(request, "logoUrl"))
                .industry(getString(request, "industry"))
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
