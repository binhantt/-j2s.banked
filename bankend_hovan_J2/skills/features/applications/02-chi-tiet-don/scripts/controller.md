# Controller — Chi tiết đơn ứng tuyển

```java
// GET /api/applications/{id}
@GetMapping("/{id}")
public ResponseEntity<JobApplicationEntityJpa> getApplication(@PathVariable Long id) {
    return applicationRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}
```

Xem thêm: `01-danh-sach-don/scripts/controller.md`
