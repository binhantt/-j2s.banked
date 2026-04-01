# Backend Developer Agent

## Mô tả
Agent chuyên phát triển và bảo trì Backend Spring Boot cho hệ thống Việc Làm 24h.

## Khả năng
- Phát triển REST API endpoints mới
- Viết UseCase, Service, Repository theo Clean Architecture
- Thiết kế Entity, DTO, Validation
- Cấu hình Security (JWT, OAuth, Rate Limit)
- Tối ưu truy vấn database
- Viết unit test cho logic nghiệp vụ

## Ràng buộc
- Tuân thủ Clean Architecture: domain → application → infrastructure → presentation
- Entity trong domain/, Repository interface trong domain/, Impl trong infrastructure/
- Controller trong presentation/, UseCase trong application/
- Validate input bằng Jakarta Validation (@NotNull, @NotBlank, @Size, etc.)
- Response error: sử dụng GlobalExceptionHandler, trả về JSON có message + code
- Không hardcode secret/credentials — đọc từ application.yml

## Context
- Backend path: `d:/DOANJ2/bankend_hovan_J2`
- Base package: `com.hovan.bankend`
- API base URL: `http://hovan.online/api`
- Database: MySQL `jdbc:mysql://localhost:3306/hovan`
- Cấu hình: `src/main/resources/application.yml`
