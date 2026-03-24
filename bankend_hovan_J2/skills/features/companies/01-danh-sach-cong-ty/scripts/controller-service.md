# Controller + Service — Danh sách công ty

## Controller
```java
// GET /api/companies/with-domain
@GetMapping("/with-domain")
public ResponseEntity<List<CompanyWithDomainResponse>> getAllCompaniesWithDomain() {
    List<CompanyWithDomainResponse> companies = companyService.getAllCompaniesWithDomain();
    return ResponseEntity.ok(companies);
}

// GET /api/companies
@GetMapping
public ResponseEntity<List<Company>> getAllCompanies() {
    List<Company> companies = companyRepository.findAll();
    return ResponseEntity.ok(companies);
}
```

## Service
```java
public List<CompanyWithDomainResponse> getAllCompaniesWithDomain() {
    List<Company> companies = companyRepository.findAll();
    return companies.stream()
        .map(company -> {
            CompanyWithDomainResponse res = CompanyWithDomainResponse.builder()
                .id(company.getId())
                .name(company.getName())
                .logoUrl(company.getLogoUrl())
                .companySize(company.getCompanySize())
                .description(company.getDescription())
                .hrId(company.getHrId())
                .build();
            // Enrich domainName
            domainRepository.findById(company.getDomainId()).ifPresent(domain ->
                res.setDomainName(domain.getName())
            );
            return res;
        })
        .collect(Collectors.toList());
}
```

## Endpoints
| Method | Endpoint |
|--------|----------|
| GET | `/api/companies` |
| GET | `/api/companies/with-domain` |
| GET | `/api/companies/hr/{hrId}` |
| GET | `/api/companies/hr/{hrId}/with-domain` |
| GET | `/api/companies/{id}/basic-info` |
