# Controller + Service

## Controller
```java
// src/main/java/.../presentation/domain/DomainController.java

@RestController
@RequestMapping("/api/domains")
@RequiredArgsConstructor
public class DomainController {
    private final DomainService domainService;

    @GetMapping
    public ResponseEntity<List<DomainResponse>> getAllDomains() {
        List<DomainResponse> domains = domainService.getAllDomains();
        return ResponseEntity.ok(domains);
    }
}
```

## Service
```java
// src/main/java/.../application/domain/DomainService.java

@Service
@RequiredArgsConstructor
@Transactional
public class DomainService {
    private final DomainRepository domainRepository;
    private final JobPostingRepository jobPostingRepository;
    private final CompanyRepository companyRepository;

    public List<DomainResponse> getAllDomains() {
        List<Domain> domains = domainRepository.findAll();
        return domains.stream()
            .map(domain -> {
                DomainResponse res = DomainResponse.from(domain);
                res.setJobCount((int) jobPostingRepository.countActiveJobsByDomainId(domain.getId()));
                return res;
            })
            .collect(Collectors.toList());
    }
}
```
