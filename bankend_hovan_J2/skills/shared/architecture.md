# Backend Architecture

## Cấu trúc Package

```
src/main/java/com/example/bankend_hovan_J2/
├── BankendHovanJ2Application.java      ← Spring Boot entry point
├── presentation/                        ← REST Controllers
│   ├── admin/
│   │   └── UserManagementController.java   ← /api/admin/users/**
│   ├── auth/
│   │   └── AuthController.java              ← /api/auth/**
│   ├── domain/
│   │   └── DomainController.java           ← /api/domains/**
│   ├── blog/
│   │   └── BlogController.java            ← /api/blog/**
│   ├── chat/
│   │   ├── ChatController.java            ← /api/chat/**
│   │   └── dto/
│   ├── company/
│   │   └── CompanyController.java        ← /api/companies/**
│   ├── job/
│   │   └── JobPostingController.java     ← /api/jobs/**
│   └── application/
│       └── JobApplicationController.java  ← /api/applications/**
│
├── application/                         ← Business logic + DTOs
│   ├── domain/
│   │   ├── DomainService.java
│   │   ├── CreateDomainRequest.java
│   │   └── DomainResponse.java
│   ├── blog/
│   │   ├── BlogService.java
│   │   ├── CreateBlogRequest.java
│   │   └── BlogResponse.java
│   ├── auth/
│   │   └── AuthResponseDTO.java
│   └── chat/
│       ├── CreateConversationUseCase.java
│       └── SendMessageUseCase.java
│
├── domain/                              ← Entities + Repository interfaces
│   ├── user/
│   │   ├── entity/User.java
│   │   └── repository/UserRepository.java
│   ├── domain/
│   │   ├── entity/Domain.java
│   │   └── repository/DomainRepository.java
│   ├── blog/
│   │   ├── entity/BlogPost.java
│   │   └── repository/BlogPostRepository.java
│   ├── chat/
│   │   ├── entity/ChatMessage.java
│   │   ├── entity/Conversation.java
│   │   └── repository/
│   │       ├── ChatMessageRepository.java
│   │       └── ConversationRepository.java
│   └── company/
│       ├── entity/Company.java
│       └── repository/CompanyRepository.java
│
└── infrastructure/                      ← Implementations + JPA
    ├── persistence/
    │   ├── user/UserJpaRepository.java
    │   ├── domain/
    │   ├── blog/
    │   ├── chat/
    │   └── company/
    ├── security/
    │   ├── JwtProvider.java
    │   └── AesGcmCryptoService.java
    └── oauth/
        ├── GoogleTokenVerifier.java
        ├── GitHubTokenVerifier.java
        └── FacebookTokenVerifier.java
```

## Layer Pattern

```
Request (JSON)
  ↓ @RestController
Controller (@RequestMapping, @GetMapping, @PostMapping, ...)
  ↓ @Service (@Transactional)
Application Service (Business Logic)
  ↓ @Repository
Domain Repository Interface
  ↓ JPA Implementation
JpaRepository (Spring Data JPA)
  ↓
Database (MySQL)
```

## Key Annotations

| Layer | Annotation | Ví dụ |
|-------|-----------|-------|
| Controller | `@RestController`, `@RequestMapping` | `@RequestMapping("/api/domains")` |
| Endpoint | `@GetMapping`, `@PostMapping`, `@PutMapping`, `@PatchMapping`, `@DeleteMapping` | `@GetMapping("/{id}")` |
| Service | `@Service`, `@Transactional` | Business logic |
| Repository | `@Repository` hoặc extend `JpaRepository` | Data access |
| Entity | `@Entity`, `@Table`, `@Id`, `@GeneratedValue` | Database mapping |

## Response Pattern

```java
// Thành công → 200 OK
return ResponseEntity.ok(data);

// Tạo mới → 200 OK (hoặc 201 Created)
return ResponseEntity.ok(createdData);

// Xóa → 200 OK
return ResponseEntity.ok().build();

// Lỗi → 400 Bad Request
return ResponseEntity.badRequest().build();

// Không tìm thấy → 404 Not Found
return ResponseEntity.notFound().build();

// Server error → 500
return ResponseEntity.internalServerError().build();
```

## Error Handling

```java
// Trong Service — throw RuntimeException
throw new RuntimeException("Không tìm thấy lĩnh vực với ID: " + id);

// Trong Controller — try/catch
try {
    DomainResponse domain = domainService.getDomainById(id);
    return ResponseEntity.ok(domain);
} catch (RuntimeException e) {
    return ResponseEntity.notFound().build();
}
```
