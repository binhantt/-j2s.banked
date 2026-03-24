# Entity + DTO References — Companies

## CompanyEntityJpa
```java
// infrastructure/persistence/company/CompanyEntityJpa.java
@Entity @Table(name = "companies")
public class CompanyEntityJpa {
    private Long id;
    private Long hrId;           // HR user ID
    private String name;
    private String logoUrl;
    private Long domainId;      // FK → domain
    private String companySize; // "1-10", "50-100", "100-500"...
    private Integer foundedYear;
    private String website;
    private String email;
    private String phone;
    private String address;
    private String description;  // TEXT
    private String mission;      // TEXT
    private String vision;       // TEXT
    private String values;       // TEXT (company_values)
    private String benefits;     // TEXT
    private String workingHours;
    private String imageGallery; // JSON array
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

## CompanyWithDomainResponse
```java
// application/company/CompanyWithDomainResponse.java
@Data @Builder
public class CompanyWithDomainResponse {
    private Long id;
    private Long hrId;
    private String name;
    private String logoUrl;
    private Long domainId;
    private String domainName;     // Enrich từ domainId
    private String companySize;
    private String description;
    private String email;
    private String phone;
    private String website;
    private String address;
}
```

## CompanyBasicInfoResponse
```java
// application/company/CompanyBasicInfoResponse.java
@Data @Builder
public class CompanyBasicInfoResponse {
    private Long id;
    private String name;
    private String logoUrl;
    private String companySize;
    private String address;
}
```

## CompanyRepository
```java
// domain/company/repository/CompanyRepository.java
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByHrId(Long hrId);
    Optional<Company> findByHrIdIncludingInactive(Long hrId); // kể cả inactive
    boolean existsByDomainId(Long domainId);
}
```
