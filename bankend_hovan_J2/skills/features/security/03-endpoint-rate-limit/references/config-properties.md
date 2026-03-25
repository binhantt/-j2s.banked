# application.yml — Multi-Bucket Rate Limit Config

## Thêm / cập nhật `rate-limit:` section

```yaml
rate-limit:
  enabled: true
  whitelist-paths: |
    /api/auth/,
    /api/upload/,
    /api/cv/,
    /uploads/,
    /api/health,
    /api/notifications/

  # Auth endpoints — strict
  group:
    auth:
      limit: 10
      window-seconds: 60

    auth-strict:
      limit: 5
      window-seconds: 60

    # Read-only GET
    read:
      limit: 200
      window-seconds: 60

    # Write operations (POST/PUT/PATCH/DELETE)
    write:
      limit: 20
      window-seconds: 60

    # Fallback
    default:
      limit: 100
      window-seconds: 60
```

## Ví dụ production

```yaml
rate-limit:
  enabled: true
  whitelist-paths: |
    /api/auth/,
    /api/upload/,
    /api/cv/,
    /uploads/,
    /api/health,
    /api/notifications/
  group:
    auth-strict:
      limit: 3              # Production: 3 login/min
      window-seconds: 60
    auth:
      limit: 5
      window-seconds: 60
    read:
      limit: 100
      window-seconds: 60
    write:
      limit: 10
      window-seconds: 60
    default:
      limit: 50
      window-seconds: 60
```

## So sánh trước vs sau

| Khía cạnh | Trước (SC-01) | Sau (SC-03) |
|-----------|---------------|------------|
| Số bucket | 1 toàn cục | 5 group riêng |
| Auth | 200 req/min | **5** req/min (strict) |
| Read jobs/companies | 200 req/min | 200 req/min |
| Write applications | 200 req/min | **20** req/min |
| Config-driven | Có | Có |
| 429 Response JSON | Có | Có + `group` + `Retry-After` header |
