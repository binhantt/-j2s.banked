# SC-03: Endpoint-Specific Rate Limit

## Mô tả ngắn
Thay Bucket duy nhất bằng nhiều Bucket theo endpoint group. Auth endpoints (login, register) bị giới hạn chặt hơn read endpoints. Dùng `@RateLimiter` annotation hoặc config-driven approach.

## Endpoint
Không có endpoint mới — cải thiện `RateLimitFilter`.

## Luồng xử lý

```
Request → RateLimitFilter
→ Map path → bucket key (endpoint group)
→ Chọn Bucket theo group
  ├── /api/auth/login     → Auth bucket: 5 req/min (strict)
  ├── /api/auth/register  → Auth bucket: 3 req/min (strict)
  ├── /api/auth/**        → Auth bucket: 10 req/min
  ├── GET /api/jobs/**    → Read bucket: 200 req/min (loose)
  ├── POST /api/applications/** → Write bucket: 20 req/min
  └── default             → Default bucket: 100 req/min
→ tryConsume(1)
  ├── pass  → chain.doFilter
  └── fail  → 429 Too Many Requests
```

## Tác vụ
- [x] Phân loại endpoint groups: AUTH (strict), READ (loose), WRITE (medium), DEFAULT
- [x] Map path → group + limit từ config
- [x] Tạo Bucket per-group per-IP (thay vì 1 bucket toàn cục)
- [x] Response 429 trả về JSON với `retryAfter` field

## Cách sử dụng code trong thư mục

### `scripts/`
- Updated `RateLimitFilter.java` — multi-bucket per endpoint group

### `references/`
- application.yml config mẫu cho từng nhóm

## Ràng buộc
- Cache buckets: `ConcurrentHashMap<String, Bucket>` — key = `ip + ":" + group`
- Nếu path không match → dùng DEFAULT bucket
- 429 response: JSON body với message + retryAfter
- Không áp dụng cho whitelisted paths
