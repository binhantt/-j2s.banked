# Controller — POST /api/admin/users/create

```java
// POST /api/admin/users/create
@PostMapping("/create")
public ResponseEntity<Map<String, Object>> createBackendUser(@RequestBody Map<String, String> request) {
    try {
        String email = request.get("email");
        String name = request.get("name");
        String password = request.get("password");
        String userType = request.get("userType"); // admin, super_admin, moderator, support

        // Validate email chưa tồn tại
        if (userJpaRepository.findByEmail(email).isPresent()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Email đã tồn tại");
            return ResponseEntity.status(400).body(error);
        }

        // Tạo user entity mới
        UserEntityJpa newUser = new UserEntityJpa();
        newUser.setEmail(email);
        newUser.setName(name);
        newUser.setProvider("local");
        newUser.setProviderId(email);
        newUser.setUserType(userType);
        newUser.setIsActive(true);
        newUser.setCreatedAt(java.time.LocalDateTime.now());
        newUser.setUpdatedAt(java.time.LocalDateTime.now());

        // Mã hóa password
        if (password != null && !password.isBlank()) {
            newUser.setEncryptedPassword(aesGcmCryptoService.encrypt(password));
        }

        userJpaRepository.save(newUser);

        return ResponseEntity.ok(convertToResponse(newUser));
    } catch (Exception e) {
        log.error("Error creating backend user", e);
        Map<String, Object> error = new HashMap<>();
        error.put("error", "Không thể tạo tài khoản");
        return ResponseEntity.status(500).body(error);
    }
}
```

## Mã hóa password
```java
// Sử dụng AesGcmCryptoService
newUser.setEncryptedPassword(aesGcmCryptoService.encrypt(password));
```
