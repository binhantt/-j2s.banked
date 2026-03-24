# Controller — Chi tiết công ty

```java
// GET /api/companies/{id}/with-domain
@GetMapping("/{id}/with-domain")
public ResponseEntity<CompanyWithDomainResponse> getCompanyWithDomain(@PathVariable Long id) {
    return companyService.getCompanyWithDomain(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}

// GET /api/companies/{id}
@GetMapping("/{id}")
public ResponseEntity<Company> getCompany(@PathVariable Long id) {
    return companyRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}

// GET /api/companies/{id}/basic-info
@GetMapping("/{id}/basic-info")
public ResponseEntity<CompanyBasicInfoResponse> getCompanyBasicInfo(@PathVariable Long id) {
    return companyService.getCompanyBasicInfo(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}
```
