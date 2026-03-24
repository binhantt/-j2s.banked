# Controller + Service — Chi tiết lĩnh vực

## Controller
```java
@GetMapping("/{id}")
public ResponseEntity<DomainResponse> getDomainById(@PathVariable Long id) {
    DomainResponse domain = domainService.getDomainById(id);
    return ResponseEntity.ok(domain);
}
```

## Service
```java
public DomainResponse getDomainById(Long id) {
    Domain domain = domainRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Không tìm thấy lĩnh vực với ID: " + id));
    DomainResponse res = DomainResponse.from(domain);
    res.setJobCount((int) jobPostingRepository.countActiveJobsByDomainId(domain.getId()));
    return res;
}
```
