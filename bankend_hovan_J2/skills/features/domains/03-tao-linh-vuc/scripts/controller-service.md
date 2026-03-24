# Controller + Service — Tạo lĩnh vực

## Controller
```java
@PostMapping
public ResponseEntity<DomainResponse> createDomain(
        @Valid @RequestBody CreateDomainRequest request) {
    DomainResponse domain = domainService.createDomain(request);
    return ResponseEntity.ok(domain);
}
```

## Service
```java
public DomainResponse createDomain(CreateDomainRequest request) {
    // Check trùng tên
    if (domainRepository.existsByName(request.getName())) {
        throw new RuntimeException("Lĩnh vực với tên này đã tồn tại");
    }

    Domain domain = Domain.builder()
        .name(request.getName())
        .description(request.getDescription())
        .isActive(request.getIsActive() != null ? request.getIsActive() : true)
        .jobCount(0)
        .build();

    Domain savedDomain = domainRepository.save(domain);
    return DomainResponse.from(savedDomain);
}
```

## Request Body
```json
{
  "name": "Công nghệ thông tin",
  "description": "Lĩnh vực IT",
  "isActive": true
}
```

> `isActive` và `description` đều optional.
