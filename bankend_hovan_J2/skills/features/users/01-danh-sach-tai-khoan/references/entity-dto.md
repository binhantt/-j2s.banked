# Entity + DTO References

## UserEntityJpa

```java
// infrastructure/persistence/user/UserEntityJpa.java
@Entity
@Table(name = "users")
@Data
public class UserEntityJpa {
    private Long id;
    private String email;
    private String name;
    private String avatarUrl;
    private String provider;         // google, github, facebook, local
    private String providerId;
    private String userType;         // job_seeker, freelancer, hr, admin, super_admin, moderator, support
    private String currentPosition;
    private String hometown;
    private String currentLocation;
    private String phone;
    private String bio;
    private Long domainId;
    private String encryptedPassword; // AES-GCM encrypted
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

## UserJpaRepository

```java
// infrastructure/persistence/user/UserJpaRepository.java
@Repository
public interface UserJpaRepository extends JpaRepository<UserEntityJpa, Long> {
    Optional<UserEntityJpa> findByEmail(String email);
    boolean existsByEmail(String email);
}
```

## Response Map fields

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "User Name",
  "avatarUrl": "https://...",
  "provider": "google",
  "userType": "job_seeker",
  "phone": "0123456789",
  "currentPosition": "Developer",
  "hometown": "Hà Nội",
  "currentLocation": "TP.HCM",
  "isActive": true,
  "createdAt": "2024-01-01T10:00:00",
  "updatedAt": "2024-01-15T14:30:00"
}
```

> **Lưu ý:** Không trả về password hoặc encryptedPassword.
