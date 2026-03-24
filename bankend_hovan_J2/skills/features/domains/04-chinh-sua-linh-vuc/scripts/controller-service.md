# Controller + Service — Chỉnh sửa lĩnh vực

## Controller
```java
@PutMapping("/{id}")
public ResponseEntity<DomainResponse> updateDomain(
        @PathVariable Long id,
        @Valid @RequestBody CreateDomainRequest request) {
    DomainResponse domain = domainService.updateDomain(id, request);
    return ResponseEntity.ok(domain);
}
```

## Service
```java
public DomainResponse updateDomain(Long id, CreateDomainRequest request) {
    Domain domain = domainRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Không tìm thấy lĩnh vực với ID: " + id));

    // Check trùng tên mới với domain khác
    if (!domain.getName().equals(request.getName())
            && domainRepository.existsByName(request.getName())) {
        throw new RuntimeException("Lĩnh vực với tên này đã tồn tại");
    }

    domain.setName(request.getName());
    domain.setDescription(request.getDescription());
    domain.setIsActive(
        request.getIsActive() != null ? request.getIsActive() : domain.getIsActive()
    );

    Domain savedDomain = domainRepository.save(domain);
    return DomainResponse.from(savedDomain);
}
```

## Request Body
```json
{
  "name": "Tên mới",
  "description": "Mô tả mới",
  "isActive": false
}
```

> `isActive` null → giữ nguyên giá trị cũ.
