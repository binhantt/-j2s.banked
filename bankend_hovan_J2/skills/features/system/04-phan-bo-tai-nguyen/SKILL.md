# SKILL — Phân bổ tài nguyên công bằng cho 50,000+ người dùng

> **Mục tiêu:** Mọi người dùng đều được trải nghiệm NHƯ NHAU — không ai chiếm tài nguyên hệ thống khiến người khác bị chậm.
>
> **Nguyên tắc cốt lõi:**
> - Mỗi user có **giới hạn tài nguyên riêng** — không ai "ăn hết"
> - Heavy operation (export, batch) phải **xếp hàng đợi**
> - Tài nguyên chia **đều theo thời gian**, không chia đều theo request đầu tiên
> - Upload **chunk nhỏ** + **lưu tiến độ** để **tiếp tục sau**

---

## Thứ tự triển khai (làm từng bước)

```
Bước 1 → Nginx Rate Limiting     (dễ, hiệu quả ngay)
Bước 2 → Bucket4j + Redis        (quan trọng nhất cho fairness)
Bước 3 → Connection Limiter       (bảo vệ connection pool)
Bước 4 → Background Job Queue     (trải nghiệm người dùng tốt hơn)
Bước 5 → Upload Chunk + Progress  (frontend, resume upload)
Bước 6 → K8s HPA                (auto scale khi hệ thống lớn)
```

---

## 1. Tổng quan Kiến trúc Phân bổ

```
Người dùng A
    │
    ▼
┌─────────────────┐
│  Nginx / WAF     │  ← Rate limit: 1 IP = 30 req/s
└────────┬────────┘
         │ Quá limit? → 429 Too Many Requests
         ▼
┌──────────────────────────────────────────┐
│           API Gateway / Nginx             │
│                                          │
│  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │  Auth    │  │  Jobs    │  │ Upload │  │
│  │  30 req/m│  │ 120 req/m│  │ 10 req/m│  │
│  └──────────┘  └──────────┘  └────────┘  │
└─────────────────┬──────────────────────┘
                  │
         ▼        ▼        ▼
    ┌────────┐ ┌───────┐ ┌───────────┐
    │Instance│ │Instance│ │Instance   │
    │  :8080 │ │ :8081  │ │  :8082    │
    └────────┘ └────────┘ └───────────┘
         │         │          │
         └─────────┼──────────┘
                   ▼
          ┌──────────────────┐
          │  Redis / MySQL   │
          │  (Rate limit DB)  │
          └──────────────────┘
```

---

## Bước 1 — Nginx Rate Limiting

### Cài đặt Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx
```

### File cấu hình

```nginx
# /etc/nginx/sites-available/vietlamh24-api

# ── Khai báo các limit zones ──
limit_req_zone $binary_remote_addr zone=ip_limit:10m rate=30r/s;
limit_req_zone $http_x_user_id   zone=user_limit:50m rate=20r/s;
limit_req_zone $http_x_user_id   zone=search_limit:20m rate=5r/s;
limit_req_zone $binary_remote_addr zone=upload_limit:10m rate=1r/s;

upstream backend {
    least_conn;
    server 127.0.0.1:8080 weight=5;
    server 127.0.0.1:8081 weight=5;
    server 127.0.0.1:8082 weight=3;
    keepalive 32;
}

server {
    listen 80;
    server_name api.vietlamh24.com;

    ssl_certificate /etc/ssl/certs/vietlamh24.crt;
    ssl_certificate_key /etc/ssl/private/vietlamh24.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Gzip
    gzip on;
    gzip_types application/json text/css application/javascript;

    # ── ALL /api requests ──
    location /api/ {
        limit_req zone=ip_limit burst=50 nodelay;
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 5s;
        proxy_read_timeout 60s;
        proxy_buffering on;
    }

    # ── Search — cache kết quả ──
    location /api/jobs/search {
        limit_req zone=search_limit burst=10 nodelay;
        proxy_pass http://backend;
        proxy_cache_valid 200 5m;
    }

    # ── Upload — limit chặt ──
    location /api/upload/ {
        limit_req zone=upload_limit burst=3 nodelay;
        client_max_body_size 10M;
        proxy_pass http://backend;
    }

    # ── Static assets — cache lâu ──
    location ~* \.(js|css|png|jpg|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        gzip_static on;
    }

    # ── Custom 429 error ──
    error_page 429 = @rate_limit_exceeded;
    location @rate_limit_exceeded {
        default_type application/json;
        return 429 '{"error":"Quá nhiều yêu cầu. Vui lòng chờ và thử lại.","code":"RATE_LIMIT_EXCEEDED","retryAfter":60}';
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/vietlamh24-api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## Bước 2 — Bucket4j + Redis (Quan trọng nhất)

### Thêm dependency `pom.xml`

```xml
<dependency>
    <groupId>com.bucket4j</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>8.7.0</version>
</dependency>
<dependency>
    <groupId>com.bucket4j</groupId>
    <artifactId>bucket4j-redis</artifactId>
    <version>8.7.0</version>
</dependency>
```

### Cấu hình `application.yml`

```yaml
spring:
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
      password: ${REDIS_PASSWORD:}
      timeout: 2000ms
      lettuce:
        pool:
          max-active: 50
          max-idle: 20
          min-idle: 5
```

### DistributedRateLimiter.java

```java
package com.example.bankend_hovan_J2.infrastructure.ratelimit;

import io.github.bucket4j.*;
import io.github.bucket4j.distributed.ExpirationAfterWriteStrategy;
import io.github.bucket4j.distributed.proxy.ProxyManager;
import io.github.bucket4j.redis.letscript.lettuce.LettuceBasedProxyManager;
import io.lettuce.core.api.StatefulRedisConnection;
import io.vavr.control.Either;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * RATE LIMIT PHÂN TÁN — Mỗi user 1 bucket riêng trong Redis
 *
 * User A gọi 100 req liên tục → chỉ nhận 20 req đầu (tùy bucket)
 * User B gọi 1 req → nhận ngay lập tức
 * → KHÔNG ẢNH HƯỞNG nhau
 */
@Service
public class DistributedRateLimiter {

    private final ProxyManager<String> proxyManager;
    private final JwtProvider jwtProvider;

    public DistributedRateLimiter(
            StringRedisTemplate redisTemplate,
            JwtProvider jwtProvider,
            @Value("${bucket4j.configurations:read,write,search,auth,upload}") String configs) {

        // Redis proxy — bucket lưu trong Redis theo key
        // Key format: "rate-limit:user:{userId}:{bucketType}"
        this.proxyManager = BucketFactory.builder()
            .with(new LettuceBasedProxyManager(
                redisTemplate.getRequiredConnectionFactory()))
            .withExpirationStrategy(
                ExpirationAfterWriteStrategy.basedOnTimeForRefillingBucketUpToMax(
                    Duration.ofMinutes(15)))
            .build();
        this.jwtProvider = jwtProvider;
    }

    /**
     * Lấy bucket cho 1 user + 1 loại endpoint
     * Key: "rate-limit:user:{userId}:read"
     */
    public Bucket resolveBucket(Long userId, String bucketType) {
        String key = "rate-limit:user:" + userId + ":" + bucketType;
        return proxyManager.builder().build(key, builder -> builder
            .addLimit(Bandwidth.classic(
                getCapacity(bucketType),
                Refill.intervally(
                    getCapacity(bucketType),
                    Duration.ofMinutes(getRefillMinutes(bucketType))
                )
            ))
        );
    }

    /**
     * Kiểm tra rate limit cho 1 request
     * @return Right(null) = OK, Left(ex) = bị limit
     */
    public Either<RateLimitExceededException, Void> checkRateLimit(
            Long userId, String bucketType) {

        Bucket bucket = resolveBucket(userId, bucketType);
        Probe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            return Either.right(null); // OK
        }

        long waitSeconds = probe.getNanosToWaitForRefill() / 1_000_000_000;
        return Either.left(new RateLimitExceededException(
            "Bạn đã gửi quá nhiều yêu cầu. Vui lòng chờ " + waitSeconds + " giây.",
            waitSeconds,
            probe.getAvailableTokens(),
            getCapacity(bucketType)
        ));
    }

    /** Reset bucket của user (admin dùng) */
    public void resetBucket(Long userId, String bucketType) {
        String key = "rate-limit:user:" + userId + ":" + bucketType;
        proxyManager.removeBucket(key);
    }

    // ── Cấu hình giới hạn theo loại endpoint ──
    private int getCapacity(String bucketType) {
        return switch (bucketType) {
            case "read"         -> 120;  // Đọc: nhiều nhất
            case "write"        ->  30;  // Ghi: vừa
            case "search"       ->  10;  // Tìm kiếm: ít
            case "auth"         ->  30;  // Auth: chặn brute force
            case "upload"       ->   5;  // Upload: rất ít
            case "notification" ->  60;  // Notification: vừa
            default             ->  50;
        };
    }

    private int getRefillMinutes(String bucketType) {
        return switch (bucketType) {
            case "upload" -> 5;  // Upload refill chậm: 1 lần / 5 phút
            default       -> 1;  // Các loại khác refill: 1 lần / phút
        };
    }

    public Long extractUserIdFromRequest(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        try {
            String token = authHeader.substring(7);
            if (!jwtProvider.validateToken(token)) return null;
            return jwtProvider.getUserIdFromToken(token);
        } catch (Exception e) {
            return null;
        }
    }
}
```

### RateLimitExceededException.java

```java
package com.example.bankend_hovan_J2.infrastructure.ratelimit;

import lombok.Getter;

@Getter
public class RateLimitExceededException extends RuntimeException {
    private final long retryAfterSeconds;
    private final long remainingTokens;
    private final long maxTokens;

    public RateLimitExceededException(String message, long retryAfterSeconds,
                                     long remainingTokens, long maxTokens) {
        super(message);
        this.retryAfterSeconds = retryAfterSeconds;
        this.remainingTokens = remainingTokens;
        this.maxTokens = maxTokens;
    }
}
```

### RateLimitInterceptor.java

```java
package com.example.bankend_hovan_J2.infrastructure.ratelimit;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {

    private final DistributedRateLimiter rateLimiter;

    @Override
    public boolean preHandle(HttpServletRequest request,
                            HttpServletResponse response,
                            Object handler) throws Exception {

        String authHeader = request.getHeader("Authorization");
        Long userId = rateLimiter.extractUserIdFromRequest(authHeader);

        if (userId == null) {
            return true; // Chưa login → bị limit bởi IP ở Nginx
        }

        String bucketType = resolveBucketType(request.getRequestURI(), request.getMethod());
        if (bucketType == null) return true;

        try {
            rateLimiter.checkRateLimit(userId, bucketType);
            response.addHeader("X-RateLimit-Remaining", String.valueOf(
                rateLimiter.resolveBucket(userId, bucketType).getAvailableTokens()));
            response.addHeader("X-RateLimit-Type", bucketType);
            return true;

        } catch (RateLimitExceededException e) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.addHeader("Retry-After", String.valueOf(e.getRetryAfterSeconds()));

            String json = """
                {
                    "error": "%s",
                    "code": "RATE_LIMIT_EXCEEDED",
                    "retryAfter": %d,
                    "remaining": %d,
                    "limit": %d
                }
                """.formatted(e.getMessage(), e.getRetryAfterSeconds(),
                    e.getRemainingTokens(), e.getMaxTokens());

            response.getWriter().write(json);
            return false;
        }
    }

    private String resolveBucketType(String uri, String method) {
        if (uri.startsWith("/api/auth/"))          return "auth";
        if (uri.startsWith("/api/jobs/search") ||
            uri.startsWith("/api/companies/search")) return "search";
        if (uri.startsWith("/api/upload") ||
            uri.contains("/cv/") ||
            uri.contains("/image/"))               return "upload";
        if (uri.startsWith("/api/notifications/")) return "notification";
        if ("POST".equals(method) || "PUT".equals(method) || "DELETE".equals(method))
                                                      return "write";
        if (uri.startsWith("/api/"))                return "read";
        return null;
    }
}
```

### WebConfig.java

```java
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {
    private final RateLimitInterceptor rateLimitInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(rateLimitInterceptor)
            .addPathPatterns("/api/**")
            .excludePathPatterns(
                "/api/auth/refresh",
                "/api/auth/test",
                "/actuator/**"
            );
    }
}
```

---

## Bước 3 — Connection Limiter (bảo vệ connection pool)

### ConnectionLimiter.java

```java
package com.example.bankend_hovan_J2.infrastructure.connection;

import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * CONNECTION LIMITER — Mỗi user tối đa 5 kết nối đồng thời
 *
 * User A mở 10 tab → tab 6-10 bị reject
 * User B mở 1 tab  → OK bình thường
 * → KHÔNG ai chiếm hết connection pool
 */
@Service
public class ConnectionLimiter {

    private static final int MAX_CONNECTIONS_PER_USER = 5;

    // key = userId:connectionId
    private final Set<String> userConnections = ConcurrentHashMap.newKeySet();

    /** Đăng ký 1 connection
     * @return true = được phép, false = đã đạt giới hạn */
    public boolean registerConnection(Long userId, String connectionId) {
        String key = userId + ":" + connectionId;
        userConnections.add(key);

        long count = userConnections.stream()
            .filter(k -> k.startsWith(userId + ":"))
            .count();

        if (count > MAX_CONNECTIONS_PER_USER) {
            userConnections.remove(key);
            return false;
        }
        return true;
    }

    /** Hủy connection (khi tab/window đóng) */
    public void unregisterConnection(Long userId, String connectionId) {
        userConnections.remove(userId + ":" + connectionId);
    }

    /** Số connection hiện tại của user */
    public int getConnectionCount(Long userId) {
        return (int) userConnections.stream()
            .filter(k -> k.startsWith(userId + ":"))
            .count();
    }
}
```

### WebSocket / Heartbeat Controller

```java
@RestController
@RequestMapping("/api/ws")
@RequiredArgsConstructor
public class WebSocketController {

    private final ConnectionLimiter connectionLimiter;

    @PostMapping("/heartbeat")
    public ResponseEntity<?> heartbeat(@RequestParam String connectionId,
                                       @AuthenticationPrincipal Long userId) {
        // Heartbeat mỗi 30s để giữ connection alive
        return ResponseEntity.ok(Map.of(
            "status", "ok",
            "remainingConnections", connectionLimiter.getConnectionCount(userId),
            "maxConnections", 5
        ));
    }
}
```

---

## Bước 4 — Background Job Queue (Export nặng)

### BackgroundJobQueue.java

```java
package com.example.bankend_hovan_J2.application.queue;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;

/**
 * BACKGROUND JOB QUEUE — Export/Report nặng xử lý background
 *
 * User A gọi export 10000 rows PDF
 * → Trả ngay: "Đang xử lý, sẽ gửi email khi xong"
 * → Xử lý background → gửi notification khi hoàn tất
 *
 * User B gọi export 10 rows → cũng vào queue, đợi lấy
 * → CÔNG BẰNG: ai cũng phải đợi, không ai block
 */
@Service
public class BackgroundJobQueue {

    private final Deque<BackgroundJob> globalQueue = new ConcurrentLinkedDeque<>();
    private final Map<Long, Queue<BackgroundJob>> userJobs = new ConcurrentHashMap<>();

    private final ExecutorService executor = Executors.newFixedThreadPool(
        Runtime.getRuntime().availableProcessors(),
        r -> {
            Thread t = new Thread(r, "bg-job");
            t.setPriority(Thread.MIN_PRIORITY); // Low priority — không block user
            return t;
        }
    );

    // Scheduler kiểm tra queue mỗi 5 giây
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    {
        scheduler.scheduleAtFixedRate(this::processNextJob, 0, 5, TimeUnit.SECONDS);
    }

    /** Xếp job nặng vào queue
     * @return ticket để track trạng thái */
    public BackgroundJobTicket enqueue(Long userId, JobType type, Map<String, Object> params) {
        String jobId = UUID.randomUUID().toString();

        BackgroundJob job = new BackgroundJob(
            jobId, userId, type, params, Instant.now(),
            BackgroundJob.Status.PENDING, null, null
        );

        globalQueue.addLast(job);
        userJobs.computeIfAbsent(userId, k -> new ConcurrentLinkedQueue()).add(job);

        return new BackgroundJobTicket(jobId, globalQueue.size(), type);
    }

    /** Lấy trạng thái job */
    public BackgroundJob getJobStatus(Long userId, String jobId) {
        return globalQueue.stream()
            .filter(j -> j.jobId().equals(jobId) && j.userId().equals(userId))
            .findFirst().orElse(null);
    }

    /** Hủy job (chỉ PENDING) */
    public boolean cancelJob(Long userId, String jobId) {
        return globalQueue.removeIf(j ->
            j.jobId().equals(jobId) &&
            j.userId().equals(userId) &&
            j.status() == BackgroundJob.Status.PENDING
        );
    }

    // ── Xử lý queue ──
    private void processNextJob() {
        for (BackgroundJob job : globalQueue) {
            if (job.status() == BackgroundJob.Status.PENDING) {
                // So sánh thời gian tạo → FIFO (job tạo trước xử lý trước)
                globalQueue.remove(job);
                updateStatus(job, BackgroundJob.Status.PROCESSING, null);
                executor.submit(() -> executeJob(job));
                break;
            }
        }
    }

    private void executeJob(BackgroundJob job) {
        try {
            Object result = switch (job.type()) {
                case EXPORT_JOBS_PDF          -> exportJobsPdf(job);
                case EXPORT_APPLICATIONS_EXCEL -> exportApplicationsExcel(job);
                case GENERATE_REPORT            -> generateReport(job);
                case BULK_EMAIL                -> sendBulkEmail(job);
            };
            updateStatus(job, BackgroundJob.Status.COMPLETED, result);
            sendNotification(job.userId(), job.type(), result.toString());

        } catch (Exception e) {
            updateStatus(job, BackgroundJob.Status.FAILED, e.getMessage());
        }
    }

    private String exportJobsPdf(BackgroundJob job) {
        // Dùng iText / Apache PDFBox
        return "https://storage.vietlamh24.com/exports/" + job.jobId() + ".pdf";
    }

    private String exportApplicationsExcel(BackgroundJob job) {
        // Dùng Apache POI
        return "https://storage.vietlamh24.com/exports/" + job.jobId() + ".xlsx";
    }

    private String generateReport(BackgroundJob job) {
        return "https://storage.vietlamh24.com/reports/" + job.jobId() + ".pdf";
    }

    private String sendBulkEmail(BackgroundJob job) {
        return "Đã gửi " + job.params().get("recipientCount") + " email";
    }

    private void updateStatus(BackgroundJob job, BackgroundJob.Status status, Object result) {
        // Cập nhật status trong queue
    }

    private void sendNotification(Long userId, JobType type, String result) {
        String message = switch (type) {
            case EXPORT_JOBS_PDF          -> "File PDF việc làm đã sẵn sàng";
            case EXPORT_APPLICATIONS_EXCEL   -> "File Excel đơn ứng tuyển đã sẵn sàng";
            case GENERATE_REPORT           -> "Báo cáo đã được tạo xong";
            case BULK_EMAIL                -> "Email hàng loạt đã gửi xong";
        };
        // notificationService.push(userId, message);
    }

    // ── Records ──
    public record BackgroundJob(
        String jobId, Long userId, JobType type, Map<String, Object> params,
        Instant createdAt, Status status, Object result, String error
    ) {
        public enum Status { PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED }
    }

    public enum JobType {
        EXPORT_JOBS_PDF,
        EXPORT_APPLICATIONS_EXCEL,
        GENERATE_REPORT,
        BULK_EMAIL
    }

    public record BackgroundJobTicket(String jobId, int queuePosition, JobType type) {}
}
```

### BackgroundJobController

```java
@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class BackgroundJobController {

    private final BackgroundJobQueue jobQueue;

    /** Xếp export vào queue → trả ticketId */
    @PostMapping("/export/queue")
    public ResponseEntity<?> enqueueExport(
            @RequestBody Map<String, Object> params,
            @AuthenticationPrincipal Long userId) {

        JobType type = JobType.valueOf((String) params.get("type"));
        BackgroundJobTicket ticket = jobQueue.enqueue(userId, type, params);

        return ResponseEntity.accepted().body(Map.of(
            "jobId", ticket.jobId(),
            "queuePosition", ticket.queuePosition(),
            "message", "Đang xử lý background. Kiểm tra trạng thái bằng jobId."
        ));
    }

    /** Kiểm tra trạng thái */
    @GetMapping("/export/status/{jobId}")
    public ResponseEntity<?> getStatus(@PathVariable String jobId,
                                      @AuthenticationPrincipal Long userId) {
        BackgroundJob job = jobQueue.getJobStatus(userId, jobId);
        if (job == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(Map.of(
            "jobId", job.jobId(),
            "status", job.status().name(),
            "result", job.result() != null ? job.result() : "",
            "error", job.error() != null ? job.error() : "",
            "createdAt", job.createdAt()
        ));
    }

    /** Hủy job */
    @DeleteMapping("/export/cancel/{jobId}")
    public ResponseEntity<?> cancelJob(@PathVariable String jobId,
                                      @AuthenticationPrincipal Long userId) {
        boolean ok = jobQueue.cancelJob(userId, jobId);
        return ResponseEntity.ok(Map.of("cancelled", ok));
    }
}
```

---

## Bước 5 — Upload Chunk + Progress % (Frontend)

### Nguyên lý hoạt động

```
┌─────────────────────────────────────────────────────────┐
│  Upload 1 file lớn (100MB)                              │
│                                                          │
│  1. Slice file thành chunks 1MB                        │
│  2. Upload từng chunk → server                                                  │
│  3. Server ghép chunks → lưu file hoàn chỉnh           │
│                                                          │
│  ★ LƯU TIẾN ĐỘ sau mỗi chunk:                          │
│     → Mất điện / đóng tab / lỗi mạng                  │
│     → Mở lại → TỰ ĐỘNG TIẾP TỤC từ chunk đã lưu        │
│                                                          │
│  ★ HIỂN THỊ % PROGRESS:                                 │
│     → Chunk 1/100 uploaded → 1%                        │
│     → Chunk 50/100 uploaded → 50%                       │
│     → Chunk 100/100 → Done 100%                        │
└─────────────────────────────────────────────────────────┘
```

### UploadController.java (Backend)

```java
// src/main/java/.../presentation/upload/ChunkUploadController.java

@RestController
@RequestMapping("/api/upload/chunk")
@RequiredArgsConstructor
public class ChunkUploadController {

    private final ChunkUploadService chunkUploadService;

    /**
     * Upload 1 chunk nhỏ
     * - chunkIndex: thứ tự chunk (0, 1, 2, ...)
     * - totalChunks: tổng số chunk
     * - fileId: ID tạm thời để ghép chunks
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadChunk(
            @RequestParam("file") MultipartFile chunk,
            @RequestParam int chunkIndex,
            @RequestParam int totalChunks,
            @RequestParam String fileId,
            @RequestParam String filename,
            @RequestParam String contentType,
            @AuthenticationPrincipal Long userId) {

        try {
            ChunkUploadService.ChunkResult result = chunkUploadService.saveChunk(
                userId, fileId, chunkIndex, totalChunks, filename, contentType, chunk.getBytes()
            );

            return ResponseEntity.ok(Map.of(
                "chunkIndex", chunkIndex,
                "uploaded", result.uploadedChunks(),
                "total", totalChunks,
                "progress", result.progress(),        // ← % hoàn thành
                "isComplete", result.isComplete(),
                "message", result.isComplete()
                    ? "File đã upload xong!"
                    : "Đã upload " + result.uploadedChunks() + "/" + totalChunks
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "error", e.getMessage(),
                "chunkIndex", chunkIndex
            ));
        }
    }

    /**
     * Lấy trạng thái upload (hỗ trợ resume)
     */
    @GetMapping("/status/{fileId}")
    public ResponseEntity<?> getStatus(@PathVariable String fileId,
                                      @AuthenticationPrincipal Long userId) {
        ChunkUploadService.UploadStatus status = chunkUploadService.getStatus(userId, fileId);
        if (status == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of(
            "fileId", status.fileId(),
            "uploadedChunks", status.uploadedChunks(),
            "totalChunks", status.totalChunks(),
            "progress", status.progress(),  // ← % để hiển thị
            "isComplete", status.isComplete(),
            "savedAt", status.savedAt()
        ));
    }

    /**
     * Hủy upload (xóa chunks đã upload)
     */
    @DeleteMapping("/cancel/{fileId}")
    public ResponseEntity<?> cancelUpload(@PathVariable String fileId,
                                        @AuthenticationPrincipal Long userId) {
        chunkUploadService.cancelUpload(userId, fileId);
        return ResponseEntity.ok(Map.of("message", "Đã hủy upload"));
    }
}
```

### ChunkUploadService.java (Backend)

```java
// src/main/java/.../application/upload/ChunkUploadService.java

package com.example.bankend_hovan_J2.application.upload;

import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.*;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * CHUNK UPLOAD SERVICE
 *
 * ★ Mỗi user có thư mục riêng → không ảnh hưởng nhau
 * ★ Lưu chunks vào temp thư mục
 * ★ Ghép chunks khi đủ → lưu file cuối cùng
 * ★ Hỗ trợ RESUME: đọc lại tiến độ từ temp folder
 */
@Service
public class ChunkUploadService {

    private static final long CHUNK_SIZE = 1024 * 1024; // 1MB mỗi chunk
    private static final String TEMP_DIR = "/tmp/uploads/";

    // userId → fileId → status (in-memory cho đơn giản, nên dùng Redis)
    private final Map<String, UploadStatus> uploadTracker = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(TEMP_DIR));
        } catch (IOException e) {
            throw new RuntimeException("Cannot create temp dir", e);
        }
    }

    /**
     * Lưu 1 chunk vào temp folder
     * @return ChunkResult chứa % tiến độ
     */
    public ChunkResult saveChunk(Long userId, String fileId, int chunkIndex,
                                int totalChunks, String filename,
                                String contentType, byte[] chunkData) throws IOException {

        // Thư mục: /tmp/uploads/{userId}/{fileId}/
        String folder = TEMP_DIR + userId + "/" + fileId + "/";
        Files.createDirectories(Paths.get(folder));

        // Lưu chunk: chunk_0, chunk_1, chunk_2...
        String chunkPath = folder + "chunk_" + String.format("%05d", chunkIndex);
        Files.write(Paths.get(chunkPath), chunkData);

        // Đếm số chunks đã upload
        File[] chunks = new File(folder).listFiles(f -> f.getName().startsWith("chunk_"));
        int uploaded = chunks != null ? chunks.length : 0;
        int progress = (int) ((uploaded * 100.0) / totalChunks);

        // Track tiến độ (lưu vào map để frontend resume)
        UploadStatus status = new UploadStatus(
            fileId, userId, filename, totalChunks,
            uploaded, progress, false, Instant.now()
        );
        uploadTracker.put(userId + ":" + fileId, status);

        // Kiểm tra đủ chunks chưa
        boolean isComplete = uploaded == totalChunks;

        if (isComplete) {
            String finalPath = assembleChunks(userId, fileId, filename, folder, totalChunks);
            // Lưu file hoàn chỉnh vào S3/OSS hoặc local storage
            String url = saveToStorage(finalPath, userId, filename);
            status = new UploadStatus(
                fileId, userId, filename, totalChunks,
                totalChunks, 100, true, Instant.now(), url
            );
            uploadTracker.put(userId + ":" + fileId, status);
            // Xóa temp chunks
            deleteFolder(folder);
        }

        return new ChunkResult(uploaded, progress, isComplete);
    }

    /**
     * Ghép các chunks thành file hoàn chỉnh
     */
    private String assembleChunks(Long userId, String fileId, String filename,
                                 String folder, int totalChunks) throws IOException {

        String outputPath = TEMP_DIR + userId + "/" + fileId + "_" + filename;
        try (OutputStream out = new BufferedOutputStream(
                new FileOutputStream(outputPath))) {

            for (int i = 0; i < totalChunks; i++) {
                String chunkPath = folder + "chunk_" + String.format("%05d", i);
                byte[] chunk = Files.readAllBytes(Paths.get(chunkPath));
                out.write(chunk);
            }
        }
        return outputPath;
    }

    private String saveToStorage(String filePath, Long userId, String filename) {
        // Upload file hoàn chỉnh lên S3/MinIO/OSS
        // Trả về URL file
        return "https://storage.vietlamh24.com/uploads/" + userId + "/" + filename;
    }

    private void deleteFolder(String folder) {
        File f = new File(folder);
        if (f.exists()) {
            for (File c : f.listFiles()) c.delete();
            f.delete();
        }
    }

    /** Lấy trạng thái upload (dùng để RESUME) */
    public UploadStatus getStatus(Long userId, String fileId) {
        return uploadTracker.get(userId + ":" + fileId);
    }

    /** Hủy upload */
    public void cancelUpload(Long userId, String fileId) {
        String folder = TEMP_DIR + userId + "/" + fileId + "/";
        deleteFolder(folder);
        uploadTracker.remove(userId + ":" + fileId);
    }

    // ── Records ──
    public record ChunkResult(int uploadedChunks, int progress, boolean isComplete) {}

    public record UploadStatus(
        String fileId, Long userId, String filename,
        int totalChunks, int uploadedChunks,
        int progress, boolean isComplete,
        Instant savedAt, String url
    ) {
        public UploadStatus(String fileId, Long userId, String filename,
                          int totalChunks, int uploadedChunks,
                          int progress, boolean isComplete, Instant savedAt) {
            this(fileId, userId, filename, totalChunks,
                 uploadedChunks, progress, isComplete, savedAt, null);
        }
    }
}
```

### Frontend — useChunkUpload.ts (Hook React)

```typescript
// hooks/useChunkUpload.ts

import { useState, useRef, useCallback } from 'react';
import { api } from '@/lib/api';

interface ChunkUploadOptions {
  chunkSize?: number;        // Kích thước chunk (default: 1MB)
  maxRetries?: number;       // Số lần retry nếu fail (default: 3)
  onProgress?: (percent: number) => void;
  onComplete?: (fileUrl: string) => void;
  onError?: (error: string) => void;
}

interface ChunkUploadState {
  progress: number;          // 0-100
  isUploading: boolean;
  isPaused: boolean;
  isComplete: boolean;
  error: string | null;
  fileId: string | null;     // Dùng để resume
}

interface UploadChunkResult {
  chunkIndex: number;
  uploaded: number;
  total: number;
  progress: number;
  isComplete: boolean;
}

/**
 * useChunkUpload — Upload file chia nhỏ + LƯU TIẾN ĐỘ + HIỂN THỊ %
 *
 * ★ Tự động resume nếu: mất mạng, đóng tab, lỗi
 * ★ Hiển thị % progress real-time
 * ★ Retry tự động khi fail
 */
export function useChunkUpload(options: ChunkUploadOptions = {}) {
  const {
    chunkSize = 1024 * 1024,           // 1MB
    maxRetries = 3,
    onProgress,
    onComplete,
    onError,
  } = options;

  const [state, setState] = useState<ChunkUploadState>({
    progress: 0,
    isUploading: false,
    isPaused: false,
    isComplete: false,
    error: null,
    fileId: null,
  });

  // Ref để track abort khi user hủy
  const abortRef = useRef(false);
  const pauseRef = useRef(false);

  /** Tạo chunks từ File */
  const createChunks = useCallback((file: File): Blob[] => {
    const chunks: Blob[] = [];
    let start = 0;
    while (start < file.size) {
      const end = Math.min(start + chunkSize, file.size);
      chunks.push(file.slice(start, end));
      start = end;
    }
    return chunks;
  }, [chunkSize]);

  /** Upload file chính */
  const uploadFile = useCallback(async (file: File) => {
    abortRef.current = false;
    pauseRef.current = false;

    // Tạo fileId để resume + lưu tiến độ
    let fileId = state.fileId;
    if (!fileId) {
      fileId = `${Date.now()}_${Math.random().toString(36).substring(2)}`;
    }

    const chunks = createChunks(file);
    const totalChunks = chunks.length;
    let uploadedCount = 0;

    setState(prev => ({
      ...prev,
      isUploading: true,
      isPaused: false,
      isComplete: false,
      error: null,
      fileId,
    }));

    try {
      // ── Lấy tiến độ đã upload trước đó (nếu có — RESUME) ──
      if (state.fileId) {
        try {
          const statusRes = await api.get(`/api/upload/chunk/status/${fileId}`);
          const status = statusRes.data;
          uploadedCount = status.uploadedChunks || 0;
          setState(prev => ({ ...prev, progress: status.progress || 0 }));
          onProgress?.(status.progress || 0);
        } catch {
          // Chưa có tiến độ → bắt đầu từ đầu
          uploadedCount = 0;
        }
      }

      // ── Upload từng chunk ──
      for (let i = uploadedCount; i < totalChunks; i++) {
        // Kiểm tra abort/pause
        if (abortRef.current) {
          setState(prev => ({ ...prev, isUploading: false, error: 'Đã hủy' }));
          return;
        }
        while (pauseRef.current) {
          await new Promise(r => setTimeout(r, 500));
          if (abortRef.current) return;
        }

        const chunk = chunks[i];
        let retries = 0;
        let success = false;

        // Retry nếu chunk fail
        while (retries < maxRetries && !success) {
          try {
            const formData = new FormData();
            formData.append('file', chunk);
            formData.append('chunkIndex', String(i));
            formData.append('totalChunks', String(totalChunks));
            formData.append('fileId', fileId);
            formData.append('filename', file.name);
            formData.append('contentType', file.type || 'application/octet-stream');

            const response = await api.post<UploadChunkResult>(
              '/api/upload/chunk/upload',
              formData,
              {
                headers: { 'Content-Type': 'multipart/form-data' },
                // Timeout cho từng chunk
                timeout: 60000,
              }
            );

            const result = response.data;
            uploadedCount = result.uploaded;
            const percent = result.progress;

            setState(prev => ({ ...prev, progress: percent }));
            onProgress?.(percent);
            success = true;

            // LƯU TIẾN ĐỘ vào localStorage (RESUME khi reload)
            localStorage.setItem(`upload_${fileId}`, JSON.stringify({
              fileId,
              filename: file.name,
              uploadedChunks: uploadedCount,
              totalChunks,
              progress: percent,
              savedAt: Date.now(),
            }));

          } catch (err) {
            retries++;
            if (retries >= maxRetries) {
              setState(prev => ({
                ...prev,
                isUploading: false,
                error: `Upload chunk ${i} thất bại sau ${maxRetries} lần thử`
              }));
              onError?.(`Upload chunk ${i} thất bại`);
              return;
            }
            // Đợi 2 giây trước khi retry
            await new Promise(r => setTimeout(r, 2000));
          }
        }
      }

      // ── Hoàn tất ──
      setState(prev => ({
        ...prev,
        isUploading: false,
        isComplete: true,
        progress: 100,
      }));
      onProgress?.(100);
      onComplete?.(`File ${file.name} đã upload xong!`);

      // Xóa tiến độ đã lưu
      localStorage.removeItem(`upload_${fileId}`);

    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isUploading: false,
        error: err.message || 'Upload thất bại',
      }));
      onError?.(err.message);
    }
  }, [createChunks, maxRetries, onComplete, onError, onProgress, state.fileId]);

  /** Tạm dừng upload */
  const pause = () => {
    pauseRef.current = true;
    setState(prev => ({ ...prev, isPaused: true }));
  };

  /** Tiếp tục upload */
  const resume = () => {
    pauseRef.current = false;
    setState(prev => ({ ...prev, isPaused: false }));
  };

  /** Hủy upload */
  const cancel = async () => {
    abortRef.current = true;
    pauseRef.current = false;
    if (state.fileId) {
      try {
        await api.delete(`/api/upload/chunk/cancel/${state.fileId}`);
        localStorage.removeItem(`upload_${state.fileId}`);
      } catch {}
    }
    setState({
      progress: 0, isUploading: false,
      isPaused: false, isComplete: false,
      error: null, fileId: null,
    });
  };

  return {
    ...state,
    uploadFile,
    pause,
    resume,
    cancel,
  };
}
```

### Frontend — UploadComponent.tsx (Giao diện)

```tsx
// components/upload/ChunkUploadButton.tsx

import { useState, useRef } from 'react';
import { Button, Progress, message, Modal, Space } from 'antd';
import { UploadOutlined, PauseCircleOutlined, PlayCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useChunkUpload } from '@/hooks/useChunkUpload';

interface ChunkUploadButtonProps {
  onUploadComplete?: (fileUrl: string) => void;
  accept?: string;          // ".pdf,.doc,.docx"
  maxSize?: number;          // bytes, default: 100MB
}

export const ChunkUploadButton = ({
  onUploadComplete,
  accept = "*",
  maxSize = 100 * 1024 * 1024,
}: ChunkUploadButtonProps) => {

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    progress,
    isUploading,
    isPaused,
    isComplete,
    error,
    fileId,
    uploadFile,
    pause,
    resume,
    cancel,
  } = useChunkUpload({
    chunkSize: 1024 * 1024,           // 1MB
    maxRetries: 3,
    onProgress: (percent) => {
      // Progress cập nhật real-time
    },
    onComplete: (msg) => {
      message.success(msg);
      setModalOpen(false);
      setSelectedFile(null);
    },
    onError: (err) => {
      message.error(err);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize) {
      message.error(`File quá lớn. Tối đa ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    setSelectedFile(file);
    setModalOpen(true);
  };

  const handleStartUpload = () => {
    if (!selectedFile) return;
    uploadFile(selectedFile);
  };

  return (
    <>
      {/* Nút upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <Button
        icon={<UploadOutlined />}
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        Tải lên
      </Button>

      {/* Modal hiển thị tiến độ */}
      <Modal
        title="Đang tải file lên"
        open={modalOpen}
        footer={null}
        onCancel={() => {
          if (isUploading) {
            Modal.confirm({
              title: 'Hủy upload?',
              content: 'Tiến độ sẽ không được lưu. Bạn có muốn hủy?',
              onOk: () => { cancel(); setModalOpen(false); }
            });
          } else {
            setModalOpen(false);
          }
        }}
        width={480}
      >
        <div style={{ padding: '16px 0' }}>
          {/* File info */}
          {selectedFile && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                {selectedFile.name}
              </div>
              <div style={{ color: '#64748b', fontSize: 13 }}>
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                {fileId && <span style={{ marginLeft: 8, color: '#16a34a' }}>
                  ● Đã lưu tiến độ (có thể resume)
                </span>}
              </div>
            </div>
          )}

          {/* Progress bar */}
          <Progress
            percent={Math.round(progress)}
            status={isComplete ? 'success' : error ? 'exception' : 'active'}
            stroke={{
              color: isComplete ? '#16a34a' : error ? '#ef4444' : '#16a34a',
              activeColor: '#22c55e',
            }}
            format={(percent) => (
              <span style={{ color: percent === 100 ? '#16a34a' : '#0f172a', fontWeight: 700 }}>
                {percent}%
              </span>
            )}
          />

          {/* Chi tiết tiến độ */}
          {isUploading && (
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
              {!isPaused ? '⚡ Đang upload...' : '⏸ Đang tạm dừng'}
              {fileId && <span style={{ marginLeft: 8 }}>
                ID: {fileId.substring(0, 12)}...
              </span>}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div style={{ fontSize: 13, color: '#ef4444', marginTop: 8 }}>
              ❌ {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 12 }}>
            {!isUploading && !isComplete && (
              <Button
                type="primary"
                onClick={handleStartUpload}
                style={{
                  background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                  border: 'none',
                  fontWeight: 700,
                }}
              >
                Bắt đầu upload
              </Button>
            )}

            {isUploading && !isPaused && (
              <Button
                icon={<PauseCircleOutlined />}
                onClick={pause}
                style={{ borderColor: '#16a34a', color: '#16a34a' }}
              >
                Tạm dừng
              </Button>
            )}

            {isUploading && isPaused && (
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={resume}
                style={{
                  background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                  border: 'none',
                }}
              >
                Tiếp tục
              </Button>
            )}

            {isUploading && (
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  cancel();
                  setModalOpen(false);
                }}
              >
                Hủy
              </Button>
            )}
          </div>

          {/* Resume hint */}
          {!isUploading && fileId && !isComplete && (
            <div style={{
              marginTop: 16, padding: '12px 16px',
              background: 'rgba(22,163,74,0.06)',
              borderRadius: 8, fontSize: 12, color: '#16a34a',
              textAlign: 'center',
            }}>
              💡 Tiến độ đã được lưu. Đóng tab và quay lại sau vẫn tiếp tục được.
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
```

### Frontend — Resume Upload on Page Load

```tsx
// pages/upload-resume.tsx

import { useEffect } from 'react';
import { useChunkUpload } from '@/hooks/useChunkUpload';
import { message } from 'antd';

/**
 * Component tự động kiểm tra và resume upload khi user quay lại
 * Đặt trong _app.tsx hoặc Navbar
 */
export const UploadResumeChecker = () => {
  useEffect(() => {
    // Tìm các upload đang dở trong localStorage
    const pendingUploads = Object.keys(localStorage)
      .filter(k => k.startsWith('upload_'))
      .map(k => {
        try {
          return JSON.parse(localStorage.getItem(k) || '');
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    if (pendingUploads.length > 0) {
      const first = pendingUploads[0];
      Modal.confirm({
        title: '📤 Có file đang upload dở',
        content: (
          <div>
            <p>File: <strong>{first.filename}</strong></p>
            <p>Đã upload: <strong>{first.progress}%</strong></p>
            <p>Bạn có muốn tiếp tục upload không?</p>
          </div>
        ),
        okText: 'Tiếp tục',
        cancelText: 'Hủy bỏ',
        onOk: () => {
          // Trigger resume upload với fileId cũ
          // (Cần lưu thêm file object hoặc dùng IndexedDB)
          message.info('Đang tiếp tục upload...');
        },
        onCancel: () => {
          // Xóa tiến độ
          pendingUploads.forEach(u => {
            localStorage.removeItem('upload_' + u.fileId);
          });
        },
      });
    }
  }, []);

  return null;
};
```

---

## Bước 6 — K8s HPA (Auto Scale)

```yaml
# k8s/deployment.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: vietlamh24-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: vietlamh24/backend:latest
          ports:
            - containerPort: 8080
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "2Gi"
              cpu: "1000m"
          env:
            - name: JAVA_OPTS
              value: "-XX:+UseG1GC -XX:MaxGCPauseMillis=200"
---
# Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: vietlamh24-backend
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          # Scale khi CPU trung bình > 60%
          # → Đảm bảo mọi instances đều có CPU = CÔNG BẰNG
          averageUtilization: 60
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
```

---

## Tóm tắt — Bảng các bước

| Bước | Nội dung | Giới hạn | Tác dụng |
|------|----------|----------|----------|
| **1** | Nginx Rate Limiting | 30 req/s/IP | Chặn spam, DDoS |
| **2** | Bucket4j + Redis | 120 read, 30 write, 10 search / phút / user | **Mỗi user 1 bucket riêng** |
| **3** | Connection Limiter | 5 kết nối đồng thời / user | Mở 10 tab → 6-10 bị reject |
| **4** | Background Job Queue | Export nặng → xử lý background FIFO | User không bị block, nhận notification |
| **5** | Upload Chunk + Progress | File chia 1MB, resume được, hiển thị % | Mất mạng → resume được, % real-time |
| **6** | K8s HPA | 3-20 replicas, CPU avg 60% | Auto thêm instance khi quá tải |

> **Quy tắc vàng:** Mỗi user có giới hạn tài nguyên RIÊNG → không ai có thể "ăn hết" tài nguyên của người khác.
