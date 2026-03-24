# Controller — Xóa công việc

```java
// DELETE /api/jobs/{id}
@DeleteMapping("/{id:[0-9]+}")
public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
    jobPostingRepository.deleteById(id);
    return ResponseEntity.ok().build();
}
```
