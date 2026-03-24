# Controller — GET /api/admin/users

```java
// src/main/java/.../presentation/admin/UserManagementController.java

@Slf4j
@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(originPatterns = "*")
@RequiredArgsConstructor
public class UserManagementController {

    private final UserRepository userRepository;
    private final UserJpaRepository userJpaRepository;
    private final AesGcmCryptoService aesGcmCryptoService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        try {
            List<UserEntityJpa> users = userJpaRepository.findAll();

            List<Map<String, Object>> response = users.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching users", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
```

## convertToResponse

```java
private Map<String, Object> convertToResponse(UserEntityJpa user) {
    Map<String, Object> response = new HashMap<>();
    response.put("id", user.getId());
    response.put("email", user.getEmail());
    response.put("name", user.getName());
    response.put("avatarUrl", user.getAvatarUrl());
    response.put("provider", user.getProvider());
    response.put("userType", user.getUserType());
    response.put("phone", user.getPhone());
    response.put("currentPosition", user.getCurrentPosition());
    response.put("hometown", user.getHometown());
    response.put("currentLocation", user.getCurrentLocation());
    response.put("isActive", user.getIsActive() != null ? user.getIsActive() : true);
    response.put("createdAt", user.getCreatedAt());
    response.put("updatedAt", user.getUpdatedAt());
    return response;
}
```
