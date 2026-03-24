# Controller — Xóa công ty

```java
// DELETE /api/companies/{id}
@DeleteMapping("/{id}")
public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
    try {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        companyRepository.deleteById(id);
        return ResponseEntity.ok().build();
    } catch (Exception e) {
        return ResponseEntity.status(500).build();
    }
}
```

## Lưu ý
- Không kiểm tra cascade ràng buóc jobs (jobs link qua userId/hrId)
- Cascade delete company_blogs nếu DB có FK cascade
