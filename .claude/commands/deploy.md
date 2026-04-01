# /deploy — Triển khai hệ thống Việc Làm 24h

## Mô tả
Triển khai toàn bộ hệ thống: Backend, Frontend User, Admin Dashboard.

## Các bước triển khai

### 1. Backend (Spring Boot)
```bash
cd d:/DOANJ2/bankend_hovan_J2
# Build JAR
mvn clean package -DskipTests
# Hoặc chạy Docker
docker build -t vieclam24h-backend .
docker run -p 8080:8080 vieclam24h-backend
```

### 2. Frontend User (Next.js)
```bash
cd d:/DOANJ2/hove_giao_dien_users
npm run build
# Deploy lên Vercel hoặc server
```

### 3. Admin Dashboard (React)
```bash
cd d:/DOANJ2/admin
pnpm build
# Deploy lên server tĩnh
```

## Kiểm tra sau deploy
- Backend health: GET http://hovan.online/api/health
- Swagger: http://hovan.online/api/swagger-ui.html
- Frontend: http://hovan.online (hoặc domain tương ứng)
- Admin: http://admin.hovan.online

## Troubleshooting
- Lỗi 502: Kiểm tra Backend đã chạy chưa (port 8080)
- Lỗi 401: Kiểm tra JWT secret trong application.yml
- Lỗi CORS: Kiểm tra WebConfig.java CORS settings
