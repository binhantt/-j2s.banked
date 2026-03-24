# Entity + DTO References

## Domain Entity
```java
// src/main/java/.../domain/domain/entity/Domain.java

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Domain {
    private Long id;
    private String name;
    private String description;
    private Boolean isActive;
    private Integer jobCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

## DomainResponse
```java
// src/main/java/.../application/domain/DomainResponse.java

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DomainResponse {
    private Long id;
    private String name;
    private String description;
    private Boolean isActive;
    private Integer jobCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static DomainResponse from(Domain domain) {
        return DomainResponse.builder()
            .id(domain.getId())
            .name(domain.getName())
            .description(domain.getDescription())
            .isActive(domain.getIsActive())
            .jobCount(domain.getJobCount())
            .createdAt(domain.getCreatedAt())
            .updatedAt(domain.getUpdatedAt())
            .build();
    }
}
```

## CreateDomainRequest
```java
// src/main/java/.../application/domain/CreateDomainRequest.java

@Data @NoArgsConstructor @AllArgsConstructor
public class CreateDomainRequest {
    @NotNull(message = "Tên không được để trống")
    private String name;

    private String description;
    private Boolean isActive; // optional, default true
}
```

## DomainRepository
```java
// src/main/java/.../domain/domain/repository/DomainRepository.java

public interface DomainRepository extends JpaRepository<Domain, Long> {
    List<Domain> findByIsActive(Boolean isActive);
    boolean existsByName(String name);
}
```

## API Endpoints

| Method | Endpoint | Body |
|--------|----------|------|
| GET | `/api/domains` | - |
| GET | `/api/domains/{id}` | - |
| GET | `/api/domains/status/{isActive}` | - |
| POST | `/api/domains` | `{ name, description?, isActive? }` |
| PUT | `/api/domains/{id}` | `{ name, description?, isActive? }` |
| PATCH | `/api/domains/{id}/status` | `{ isActive: boolean }` |
| DELETE | `/api/domains/{id}` | - |
