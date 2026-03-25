# SC-01: Cấu hình Rate Limit từ application.yml

## Mô tả ngắn
Chuyển RateLimitFilter từ hardcode 200 req/min sang cấu hình đọc từ `application.yml`. Thêm whitelist từ config thay vì hardcode.

## Endpoint
Không có endpoint mới — cải thiện filter hiện có.

## Luồng xử lý

```
Request → RateLimitFilter
→ Đọc config: rate-limit.default-limit, rate-limit.whitelist-paths
→ Tạo Bucket theo config
→ tryConsume(1)
  ├── pass → chain.doFilter
  └── fail → 429 Too Many Requests
```

## Tác vụ
- [x] Thêm properties vào `application.yml`
- [x] Cập nhật `RateLimitFilter` đọc config từ Spring
- [x] Whitelist paths đọc từ config
- [x] Đơn vị có thể cấu hình: requests/phút

## Cách sử dụng code trong thư mục

### `scripts/`
- Filter: cập nhật `RateLimitFilter.java` — inject config

### `references/`
- Config properties mẫu

## Ràng buộc
- Không thay đổi interface filter (vẫn implement `Filter`)
- Backward compatible: nếu config thiếu → dùng giá trị mặc định
- Thread-safe: dùng `ConcurrentHashMap` cho bucket cache
