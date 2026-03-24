# Controller + Service — Toggle trạng thái

## Controller
```java
@PatchMapping("/{id}/status")
public ResponseEntity<DomainResponse> toggleDomainStatus(
        @PathVariable Long id,
        @RequestBody Map<String, Boolean> request) {
    Boolean isActive = request.get("isActive");
    if (isActive == null) {
        return ResponseEntity.badRequest().build();
    }

    DomainResponse domain = domainService.toggleDomainStatus(id, isActive);
    return ResponseEntity.ok(domain);
}
```

## Service
```java
public DomainResponse toggleDomainStatus(Long id, Boolean isActive) {
    Domain domain = domainRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Không tìm thấy lĩnh vực với ID: " + id));

    domain.setIsActive(isActive);
    Domain savedDomain = domainRepository.save(domain);
    return DomainResponse.from(savedDomain);
}
```

## Request Body
```json
{
  "isActive": true
}
```

> **Lưu ý:** Dùng `@PatchMapping` (không phải `@PutMapping`)
