# Controller — Toggle / Activate / Deactivate

## Toggle endpoint
```java
// PUT /api/admin/users/{id}/toggle-status
@PutMapping("/{id}/toggle-status")
public ResponseEntity<Map<String, Object>> toggleUserStatus(@PathVariable Long id) {
    try {
        return userJpaRepository.findById(id)
            .map(user -> {
                // Chặn super_admin
                if ("super_admin".equalsIgnoreCase(user.getUserType())) {
                    Map<String, Object> error = new HashMap<>();
                    error.put("error", "Không thể khóa tài khoản Super Admin");
                    return ResponseEntity.status(400).body(error);
                }

                Boolean currentStatus = user.getIsActive();
                user.setIsActive(currentStatus == null || !currentStatus);
                userJpaRepository.save(user);

                Map<String, Object> response = new HashMap<>();
                response.put("id", user.getId());
                response.put("isActive", user.getIsActive());
                response.put("message", user.getIsActive() ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản");

                return ResponseEntity.ok(response);
            })
            .orElse(ResponseEntity.notFound().build());
    } catch (Exception e) {
        log.error("Error toggling user status", e);
        return ResponseEntity.internalServerError().build();
    }
}
```

## Activate endpoint
```java
// PUT /api/admin/users/{id}/activate
@PutMapping("/{id}/activate")
public ResponseEntity<Map<String, Object>> activateUser(@PathVariable Long id) {
    try {
        return userJpaRepository.findById(id)
            .map(user -> {
                user.setIsActive(true);
                userJpaRepository.save(user);
                return ResponseEntity.ok(convertToResponse(user));
            })
            .orElse(ResponseEntity.notFound().build());
    } catch (Exception e) {
        log.error("Error activating user", e);
        return ResponseEntity.internalServerError().build();
    }
}
```

## Deactivate endpoint
```java
// PUT /api/admin/users/{id}/deactivate
@PutMapping("/{id}/deactivate")
public ResponseEntity<Map<String, Object>> deactivateUser(@PathVariable Long id) {
    try {
        return userJpaRepository.findById(id)
            .map(user -> {
                user.setIsActive(false);
                userJpaRepository.save(user);
                return ResponseEntity.ok(convertToResponse(user));
            })
            .orElse(ResponseEntity.notFound().build());
    } catch (Exception e) {
        log.error("Error deactivating user", e);
        return ResponseEntity.internalServerError().build();
    }
}
```
