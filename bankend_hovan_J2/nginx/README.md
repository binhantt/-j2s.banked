# Nginx — Hướng dẫn cài đặt trên Windows

> **Mục đích:** Nginx làm Reverse Proxy + Rate Limiting đặt TRƯỚC Spring Boot
>
> Flow: `User → Nginx (:80) → Spring Boot (:8080)`

---

## 1. Tải Nginx cho Windows

### Cách 1: Tải tay

1. Truy cập: https://nginx.org/en/download.html
2. Tải version **nginx-1.24.x** (hoặc mới nhất stable)
   - Chọn: `nginx-1.24.0.zip` (Windows)
3. Giải nén vào `D:\nginx\` (hoặc `C:\nginx\`)
4. Cấu trúc sau khi giải nén:
   ```
   D:\nginx\
   ├── conf\
   │   ├── nginx.conf      ← COPY FILE NÀY VÀO ĐÂY
   │   └── ...
   ├── logs\
   ├── html\
   └── nginx.exe
   ```

### Cách 2: Dùng Chocolatey (khuyến nghị)

```powershell
# Mở PowerShell (Admin)
Set-ExecutionPolicy Bypass -Scope Process -Force
iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

# Cài nginx
choco install nginx -y

# Nginx sẽ được cài vào: C:\ProgramData\chocolatey\lib\nginx\tools\nginx-1.24\
```

---

## 2. Copy config

1. Copy file `nginx.conf` trong thư mục `nginx/` này
2. Paste vào `D:\nginx\conf\nginx.conf` (thay thế file có sẵn)

---

## 3. Khởi động Nginx

### Kiểm tra config trước khi chạy

```powershell
cd D:\nginx
.\nginx.exe -t
```

Kết quả mong đợi:
```
nginx: the configuration file D:\nginx\conf\nginx.conf syntax is ok
nginx: configuration file D:\nginx\conf\nginx.conf test is successful
```

### Khởi động Nginx

```powershell
cd D:\nginx
.\nginx.exe
```

> **Không có output = thành công.** Nginx chạy ngầm.

### Kiểm tra Nginx đã chạy chưa

```powershell
# Cách 1: Kiểm tra port 80
netstat -an | findstr ":80"

# Cách 2: Kiểm tra process
tasklist /FI "IMAGENAME eq nginx.exe"
```

Kết quả mong đợi:
```
TCP    0.0.0.0:80     0.0.0.0:0     LISTENING
nginx.exe
nginx.exe
```

(Nginx chạy 2 worker processes = bình thường)

### Test nhanh

Mở trình duyệt: http://localhost/

Nếu thấy "Welcome to nginx!" = OK.

---

## 4. Các lệnh Nginx

```powershell
cd D:\nginx

# Reload config (sau khi sửa nginx.conf)
.\nginx.exe -s reload

# Stop Nginx
.\nginx.exe -s stop

# Stop rồi start lại
.\nginx.exe -s stop
Start-Process .\nginx.exe -WindowStyle Hidden

# Test config
.\nginx.exe -t

# Chi tiết config đang dùng
.\nginx.exe -T
```

---

## 5. Chạy cùng lúc với Spring Boot

### Bước 1: Đảm bảo Spring Boot chạy port 8080

```bash
# Trong thư mục backend
mvn spring-boot:run
# Hoặc chạy JAR
java -jar target/*.jar
```

### Bước 2: Nginx đã proxy `/api/` → `localhost:8080`

```bash
# Test proxy (Spring Boot phải chạy ở 8080)
curl http://localhost/api/auth/test
# Kết quả: "Auth API is working!" (từ backend)

# Test rate limit
curl -I http://localhost/api/auth/test
# Header trả về: X-RateLimit-Zone: 1
```

---

## 6. Kiểm tra Rate Limiting

### Test: Gửi nhiều request liên tục

```powershell
# Gửi 60 requests
for ($i=1; $i -le 60; $i++) {
    $r = Invoke-WebRequest -Uri "http://localhost/api/auth/test" -UseBasicParsing
    Write-Host "$i : $($r.StatusCode)"
}
```

### Kết quả mong đợi:

- Request 1-30: `200 OK`
- Request 31+: `429 Too Many Requests` (với JSON error)

### Kiểm tra response 429

```bash
curl http://localhost/api/auth/test
```

```json
{
    "error": "Quá nhiều yêu cầu. Vui lòng chờ và thử lại.",
    "code": "RATE_LIMIT_EXCEEDED",
    "retryAfter": 60,
    "message": "Bạn đã gửi quá nhiều requests. Rate limit: 30 req/s..."
}
```

---

## 7. Xem Logs

```powershell
# Access log
type D:\nginx\logs\access.log

# Error log
type D:\nginx\logs\error.log
```

---

## 8. Uninstall / Dừng hoàn toàn

```powershell
# Dừng Nginx
cd D:\nginx
.\nginx.exe -s stop

# Xóa nginx (nếu cài bằng Chocolatey)
choco uninstall nginx -y
```

---

## 9. Troubleshooting

### Lỗi: "port 80 is already in use"

```powershell
# Tìm process chiếm port 80
netstat -ano | findstr ":80"
taskkill /PID <PID_NUMBER> /F
```

### Lỗi: "nginx: [emerg] bind() to 0.0.0.0:80 failed"

→ Có process khác đang dùng port 80 (Skype, IIS, Apache, ...)

### Lỗi: "nginx: configuration file test failed"

→ Có lỗi cú pháp trong nginx.conf. Chạy `nginx -t` để xem lỗi cụ thể.

### Lỗi: 502 Bad Gateway

→ Spring Boot không chạy ở port 8080. Kiểm tra:
```powershell
netstat -ano | findstr "8080"
```

### Windows Firewall chặn Nginx

```powershell
# Cho phép nginx qua firewall
New-NetFirewallRule -DisplayName "Nginx HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
```

---

## 10. Production Deployment (Linux Server)

Khi chuyển lên server Linux (Ubuntu/Debian):

```bash
# Cài nginx
sudo apt update && sudo apt install nginx

# Copy nginx.conf vào
sudo cp nginx.conf /etc/nginx/sites-available/vietlamh24
sudo ln -s /etc/nginx/sites-available/vietlamh24 /etc/nginx/sites-enabled/

# Test và reload
sudo nginx -t
sudo systemctl reload nginx

# Enable nginx auto-start
sudo systemctl enable nginx
```

---

## Cấu trúc thư mục hoàn chỉnh

```
D:\nginx\
├── conf\
│   ├── nginx.conf        ← Config rate limiting
│   ├── mime.types
│   └── ...
├── logs\
│   ├── access.log       ← Log requests
│   └── error.log         ← Log lỗi
├── html\                ← Static files (nếu cần)
└── nginx.exe           ← Binary
```

---

## Tóm tắt nhanh

| Bước | Lệnh |
|-------|-------|
| Cài đặt | Tải zip từ nginx.org hoặc `choco install nginx` |
| Copy config | Paste `nginx.conf` vào `conf/` |
| Test config | `nginx -t` |
| Chạy | `nginx` |
| Reload config | `nginx -s reload` |
| Stop | `nginx -s stop` |
| Test rate limit | Gửi >50 req/s → 429 |
