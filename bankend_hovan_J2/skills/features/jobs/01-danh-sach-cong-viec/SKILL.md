# JB-01: Xem danh sách công việc

## Mô tả ngắn
Lấy danh sách công việc, có lọc theo trạng thái và tìm kiếm nâng cao (location, salary, experience, jobType).

## Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/jobs` | Tất cả công việc |
| GET | `/api/jobs/active` | Chỉ công việc đang active |
| GET | `/api/jobs/search` | Tìm kiếm nâng cao |
| GET | `/api/jobs/user/{userId}` | Công việc theo HR (userId) |
| GET | `/api/jobs/locations` | Lấy danh sách location đang active |
| GET | `/api/jobs/experiences` | Lấy danh sách experience level đang active |

## Tìm kiếm nâng cao — Query Params

```
GET /api/jobs/search?searchText=java&location=HCM&salaryMin=5000000&salaryMax=20000000&experience=fresher&jobType=full-time&page=0&size=20&sortBy=createdAt&sortDir=desc
```

| Param | Type | Mô tả |
|-------|------|--------|
| searchText | String | Tìm trong title, description, company name |
| location | String | Lọc theo location |
| salaryMin | Long | Lương tối thiểu |
| salaryMax | Long | Lương tối đa |
| experience | String | Mức kinh nghiệm |
| jobType | String | Loại công việc (full-time, part-time...) |
| page | int | Trang (default 0) |
| size | int | Kích thước trang (default 20) |
| sortBy | String | Trường sort (default createdAt) |
| sortDir | String | asc/desc (default desc) |

## Luồng xử lý

```
GET /api/jobs/search
→ jobPostingRepository.findByStatus("active")
→ stream filter theo từng param
  → searchText: contains trong title/description/companyName
  → location: contains (case-insensitive)
  → jobType: exact match (split by comma)
  → salaryMin/Max: so sánh salaryMin/salaryMax
  → experience: exact match
→ Apply pagination manually (in-memory)
→ enrichWithCompanyName(jobs)
  → companyRepository.findByHrIdIncludingInactive(userId)
  → setCompanyName, companyId, companyLogoUrl
→ ResponseEntity.ok(list)
```

## Tác vụ
- [x] Lấy tất cả / active jobs
- [x] Tìm kiếm nâng cao với nhiều filter
- [x] Phân trang (manual, in-memory)
- [x] Enrich company info (name, logo)
- [x] Auto-close job khi đạt maxApplicants

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: GET /api/jobs/search với nhiều @RequestParam
- Repository: JobPostingJpaRepository.findByStatus()
- Enrich: enrichWithCompanyName() helper

### `references/`
- Entity: JobPostingEntityJpa
- Response: JobPostingResponse
- Repository: JobPostingJpaRepository

## Ràng buộc
- Filter trong memory (allActive.stream().filter...)
- Enrich company info từ userId → findByHrIdIncludingInactive
- Lương: salaryMin/salaryMax là Long (VNĐ)
