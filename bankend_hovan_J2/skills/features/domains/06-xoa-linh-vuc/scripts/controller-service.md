# Controller + Service — Xóa lĩnh vực

## Controller
```java
@DeleteMapping("/{id}")
public ResponseEntity<Void> deleteDomain(@PathVariable Long id) {
    domainService.deleteDomain(id);
    return ResponseEntity.ok().build();
}
```

## Service
```java
public void deleteDomain(Long id) {
    if (!domainRepository.existsById(id)) {
        throw new RuntimeException("Không tìm thấy lĩnh vực với ID: " + id);
    }

    // Kiểm tra có công ty thuộc lĩnh vực này không
    if (companyRepository.existsByDomainId(id)) {
        throw new IllegalArgumentException(
            "Lĩnh vực này đã có công ty hoặc công việc thuộc về, không thể xóa!"
        );
    }

    domainRepository.deleteById(id);
}
```

## Ràng buộc
- Không xóa được nếu có công ty thuộc lĩnh vực
- Dùng `IllegalArgumentException` (khác `RuntimeException`)
