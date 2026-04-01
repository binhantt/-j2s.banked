# CLAUDE.local.md — Cấu hình máy local

## Cấu hình local

```json
{
  "paths": {
    "backend": "d:/DOANJ2/bankend_hovan_J2",
    "frontend": "d:/DOANJ2/hove_giao_dien_users",
    "admin": "d:/DOANJ2/admin"
  },
  "api": {
    "baseUrl": "http://hovan.online/api",
    "localBackend": "http://localhost:8080"
  }
}
```

## Ghi chú local

- Backend chạy trên port 8080
- Frontend User chạy trên port 3000
- Admin Dashboard chạy trên port 5173
- MySQL: localhost:3306/hovan
- Redis: localhost:6379
