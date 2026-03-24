# Controller — PUT /api/admin/users/{id}/update-credentials

```java
// PUT /api/admin/users/{id}/update-credentials
@PutMapping("/{id}/update-credentials")
public ResponseEntity<Map<String, Object>> updateUserCredentials(
        @PathVariable Long id,
        @RequestBody Map<String, String> request) {
    try {
        return userJpaRepository.findById(id)
            .map(user -> {
                String newEmail = request.get("email");
                String newPassword = request.get("password");

                // Cập nhật email nếu có
                if (newEmail != null && !newEmail.equals(user.getEmail())) {
                    // Validate email mới chưa tồn tại
                    if (userJpaRepository.findByEmail(newEmail).isPresent()) {
                        Map<String, Object> error = new HashMap<>();
                        error.put("error", "Email đã tồn tại");
                        return ResponseEntity.status(400).body(error);
                    }
                    user.setEmail(newEmail);
                }

                // Cập nhật password nếu có
                if (newPassword != null && !newPassword.isBlank()) {
                    user.setEncryptedPassword(
                        aesGcmCryptoService.encrypt(newPassword)
                    );
                }

                user.setUpdatedAt(java.time.LocalDateTime.now());
                userJpaRepository.save(user);

                return ResponseEntity.ok(convertToResponse(user));
            })
            .orElse(ResponseEntity.notFound().build());
    } catch (Exception e) {
        log.error("Error updating user credentials", e);
        return ResponseEntity.internalServerError().build();
    }
}
```

## Request Body
```json
{
  "email": "newemail@example.com",  // optional
  "password": "newpassword123"       // optional
}
```

## Mã hóa password
```java
user.setEncryptedPassword(aesGcmCryptoService.encrypt(newPassword));
```
