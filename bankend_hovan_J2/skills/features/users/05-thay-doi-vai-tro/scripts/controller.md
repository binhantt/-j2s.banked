# Controller — PUT /api/admin/users/{id}/update-role

```java
// PUT /api/admin/users/{id}/update-role
@PutMapping("/{id}/update-role")
public ResponseEntity<Map<String, Object>> updateUserRole(
        @PathVariable Long id,
        @RequestBody Map<String, String> request) {
    try {
        String newRole = request.get("userType");

        return userJpaRepository.findById(id)
            .map(user -> {
                user.setUserType(newRole);
                user.setUpdatedAt(java.time.LocalDateTime.now());
                userJpaRepository.save(user);
                return ResponseEntity.ok(convertToResponse(user));
            })
            .orElse(ResponseEntity.notFound().build());
    } catch (Exception e) {
        log.error("Error updating user role", e);
        return ResponseEntity.internalServerError().build();
    }
}
```

## Request Body
```json
{
  "userType": "admin"
}
```

## userType hợp lệ
| Nhóm | Values |
|------|--------|
| **User** | job_seeker, freelancer, hr |
| **Backend** | admin, super_admin, moderator, support |

## Khác với toggle status
- update-role **KHÔNG** chặn super_admin
- toggle-status **CÓ** chặn super_admin
