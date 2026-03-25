# application.yml — Thêm rate-limit config

## Thêm vào `src/main/resources/application.yml`

```yaml
# Trước phần management:, thêm:

rate-limit:
  enabled: true
  default-limit: 200          # requests per window
  window-seconds: 60           # 1 phút
  whitelist-paths: |
    /api/auth/,
    /api/upload/,
    /api/cv/,
    /uploads/,
    /api/health,
    /api/notifications/
```

## Ý nghĩa từng config

| Property | Mặc định | Ý nghĩa |
|----------|----------|----------|
| `rate-limit.enabled` | `true` | Bật/tắt rate limit |
| `rate-limit.default-limit` | `200` | Số request tối đa mỗi window |
| `rate-limit.window-seconds` | `60` | Độ dài window (giây) |
| `rate-limit.whitelist-paths` | (danh sách trên) | Các endpoint không bị rate limit |

## Ví dụ cấu hình môi trường

```yaml
# development
rate-limit:
  enabled: false

# production
rate-limit:
  enabled: true
  default-limit: 100
  window-seconds: 60
  whitelist-paths: |
    /api/auth/,
    /api/upload/,
    /api/cv/,
    /uploads/,
    /api/health,
    /api/notifications/
```
