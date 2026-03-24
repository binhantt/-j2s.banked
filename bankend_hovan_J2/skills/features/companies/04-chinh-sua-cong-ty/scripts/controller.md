# Controller — Chỉnh sửa công ty

```java
// PUT /api/companies/{id}
@PutMapping("/{id}")
public ResponseEntity<Company> updateCompany(
        @PathVariable Long id,
        @RequestBody Map<String, Object> request) {
    Company company = mapToCompany(request);
    Company updated = updateCompanyUseCase.execute(id, company);
    return ResponseEntity.ok(updated);
}

// Helper mapToCompany — xem trong 03-tao-cong-ty/scripts/controller.md
```

## UseCase
```java
// UpdateCompanyUseCase.execute(Long id, Company company)
public Company execute(Long id, Company company) {
    Company existing = companyRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Company not found"));

    existing.setName(company.getName());
    existing.setLogoUrl(company.getLogoUrl());
    existing.setDomainId(company.getDomainId());
    existing.setCompanySize(company.getCompanySize());
    existing.setFoundedYear(company.getFoundedYear());
    existing.setWebsite(company.getWebsite());
    existing.setEmail(company.getEmail());
    existing.setPhone(company.getPhone());
    existing.setAddress(company.getAddress());
    existing.setDescription(company.getDescription());
    existing.setMission(company.getMission());
    existing.setVision(company.getVision());
    existing.setValues(company.getValues());
    existing.setBenefits(company.getBenefits());
    existing.setWorkingHours(company.getWorkingHours());
    existing.setImageGallery(company.getImageGallery());

    return companyRepository.save(existing);
}
```
