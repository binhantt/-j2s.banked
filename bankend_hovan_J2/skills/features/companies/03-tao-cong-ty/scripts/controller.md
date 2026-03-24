# Controller — Tạo công ty

```java
// POST /api/companies
@PostMapping
public ResponseEntity<Company> createCompany(@RequestBody Map<String, Object> request) {
    Company company = mapToCompany(request);
    Company created = createCompanyUseCase.execute(company);
    return ResponseEntity.ok(created);
}

// Helper mapToCompany
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
    if (value instanceof Number) return ((Number) value).longValue();
    return Long.valueOf(value.toString());
}

private Integer getInteger(Map<String, Object> map, String key) {
    Object value = map.get(key);
    if (value == null) return null;
    if (value instanceof Number) return ((Number) value).intValue();
    return Integer.valueOf(value.toString());
}
```

## Request Body
```json
{
  "hrId": 123,
  "name": "Công ty ABC",
  "domainId": 1,
  "companySize": "50-100",
  "email": "contact@abc.com",
  "phone": "0901234567",
  "address": "TP.HCM",
  "description": "Mô tả công ty"
}
```

## UseCase
```java
// CreateCompanyUseCase.execute(Company company)
public Company execute(Company company) {
    return companyRepository.save(company);
}
```
