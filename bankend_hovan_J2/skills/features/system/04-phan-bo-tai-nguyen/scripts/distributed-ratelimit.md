# Scripts — Cài đặt Phân bổ Tài nguyên

## 1. Cài đặt Bucket4j với Redis

### 1.1 Thêm dependency `pom.xml`

```xml
<!-- Bucket4j — Rate limiting -->
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

<!-- Lettuce (Redis client mặc định của Spring Boot) -->
<dependency>
    <groupId>io.lettuce</groupId>
    <artifactId>lettuce-core</artifactId>
    <version>6.3.0.RELEASE</version>
</dependency>
```

### 1.2 Cấu hình Redis trong `application.yml`

```yaml
spring:
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
      password: ${REDIS_PASSWORD:}
      database: 0
      timeout: 2000ms
      lettuce:
        pool:
          max-active: 50        # Tối đa 50 connections đến Redis
          max-idle: 20          # Idle connections
          min-idle: 5           # Luôn giữ 5 connections alive
          max-wait: 1000ms      # Chờ tối đa 1s

# Cấu hình Bucket4j
bucket4j:
  configurations: read,write,search,auth,upload
```

### 1.3 Khởi tạo Redis ProxyManager

```java
// src/main/java/.../infrastructure/ratelimit/Bucket4jRedisConfig.java

package com.example.bankend_hovan_J2.infrastructure.ratelimit;

import io.github.bucket4j.distributed.ExpirationAfterWriteStrategy;
import io.github.bucket4j.redis.letscript.lettuce.LettuceBasedProxyManager;
import io.lettuce.core.RedisClient;
import io.lettuce.core.api.StatefulRedisConnection;
import io.vavr.control.Option;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class Bucket4jRedisConfig {

    @Value("${spring.data.redis.host}")
    private String redisHost;

    @Value("${spring.data.redis.port}")
    private int redisPort;

    @Value("${spring.data.redis.password:}")
    private String redisPassword;

    @Bean
    public RedisClient redisClient() {
        String uri = redisPassword.isEmpty()
            ? "redis://" + redisHost + ":" + redisPort + "/0"
            : "redis://:" + redisPassword + "@" + redisHost + ":" + redisPort + "/0";
        return RedisClient.create(uri);
    }

    @Bean
    public StatefulRedisConnection<String, String> redisConnection(RedisClient redisClient) {
        return redisClient.connect();
    }

    @Bean
    public LettuceBasedProxyManager<String> proxyManager(
            StatefulRedisConnection<String, String> connection) {

        return LettuceBasedProxyManager.builderFor(connection)
            .withExpirationStrategy(
                // Bucket tự động xóa khỏi Redis sau 15 phút không dùng
                ExpirationAfterWriteStrategy.basedOnTimeForRefillingBucketUpToMax(
                    java.time.Duration.ofMinutes(15)))
            .build();
    }
}
```

---

## 2. Cài đặt Nginx Rate Limiting

### 2.1 Cài đặt Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# Kiểm tra version
nginx -v

# Cấu hình
sudo nano /etc/nginx/nginx.conf
```

### 2.2 File cấu hình đầy đủ

```nginx
# /etc/nginx/sites-available/vietlamh24-api

limit_req_zone $binary_remote_addr zone=ip_limit:10m rate=30r/s;
limit_req_zone $http_x_user_id zone=user_limit:50m rate=20r/s;
limit_req_zone $http_x_user_id zone=search_limit:20m rate=5r/s;
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

    # SSL
    ssl_certificate /etc/ssl/certs/vietlamh24.crt;
    ssl_certificate_key /etc/ssl/private/vietlamh24.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Gzip
    gzip on;
    gzip_types application/json text/css application/javascript;
    gzip_min_length 1000;

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

    location /api/jobs/search {
        limit_req zone=search_limit burst=10 nodelay;
        proxy_pass http://backend;
        proxy_cache_valid 200 5m;
    }

    location /api/auth/ {
        limit_req zone=ip_limit burst=10 nodelay;
        proxy_pass http://backend;
    }

    location /api/upload/ {
        limit_req zone=upload_limit burst=3 nodelay;
        client_max_body_size 10M;
        proxy_pass http://backend;
    }

    # Static assets
    location ~* \.(js|css|png|jpg|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        gzip_static on;
    }

    error_page 429 = @rate_limit_exceeded;
    location @rate_limit_exceeded {
        default_type application/json;
        return 429 '{"error":"Quá nhiều yêu cầu. Vui lòng chờ.","code":"RATE_LIMIT_EXCEEDED","retryAfter":60}';
    }
}
```

```bash
# Kích hoạt cấu hình
sudo ln -s /etc/nginx/sites-available/vietlamh24-api /etc/nginx/sites-enabled/

# Test cấu hình
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

---

## 3. Upload Queue Setup

### 3.1 Cấu hình Thread Pool

```java
// src/main/java/.../config/UploadConfig.java

@Configuration
public class UploadConfig {

    /**
     * Thread pool cho upload files
     * - Core pool: 2 threads (luôn có sẵn)
     * - Max pool: 8 threads (khi có nhiều upload cùng lúc)
     * - Queue: 100 task chờ
     */
    @Bean("uploadExecutor")
    public TaskExecutor uploadExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("upload-");
        executor.setRejectedExecutionHandler(
            new ThreadPoolExecutor.CallerRunsPolicy()  // Nếu queue đầy → chạy trong caller thread
        );
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        return executor;
    }

    /**
     * Scheduler cho kiểm tra queue
     */
    @Bean
    public TaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(2);
        scheduler.setThreadNamePrefix("queue-scheduler-");
        scheduler.initialize();
        return scheduler;
    }
}
```

### 3.2 Cấu hình Object Storage (MinIO hoặc S3)

```yaml
# application.yml
spring:
  servlet:
    multipart:
      enabled: true
      max-file-size: 10MB
      max-request-size: 10MB

# MinIO / S3 configuration
minio:
  endpoint: ${MINIO_ENDPOINT:http://localhost:9000}
  access-key: ${MINIO_ACCESS_KEY:}
  secret-key: ${MINIO_SECRET_KEY:}
  bucket-name: vietlamh24-uploads
```

---

## 4. Connection Limiter Setup

### 4.1 Redis Keys cho Connection Tracking

```
# Key format
connections:{userId} → SET of connectionIds
connection:count:{userId} → INT (số connection hiện tại)

# TTL: tự động xóa sau 5 phút không heartbeat
connections:{userId} TTL=300s
```

### 4.2 Heartbeat机制 (WebSocket/SSE)

```java
// src/main/java/.../presentation/ws/WebSocketController.java

@RestController
@RequestMapping("/api/ws")
@RequiredArgsConstructor
public class WebSocketController {

    private final ConnectionLimiter connectionLimiter;

    /**
     * Heartbeat mỗi 30 giây để giữ connection alive
     */
    @PostMapping("/heartbeat")
    public ResponseEntity<?> heartbeat(@RequestParam String connectionId) {
        String userId = getCurrentUserId();
        // Refresh TTL
        return ResponseEntity.ok(Map.of(
            "status", "ok",
            "remainingConnections", connectionLimiter.getConnectionCount(Long.parseLong(userId)),
            "maxConnections", 5
        ));
    }
}
```

---

## 5. Monitoring — Kiểm tra Fairness

### 5.1 Actuator Endpoints

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: when_authorized
  metrics:
    tags:
      application: vietlamh24
    export:
      prometheus:
        enabled: true
```

### 5.2 Custom Metrics cho Rate Limiter

```java
// Thêm vào DistributedRateLimiter.java

private final MeterRegistry meterRegistry;

@PostConstruct
public void initMetrics() {
    meterRegistry.gauge("ratelimit.connections.active",
        userConnections, Set::size);
}

public Either<RateLimitExceededException, Void> checkRateLimit(
        Long userId, String bucketType) {
    // ...
    meterRegistry.counter("ratelimit.requests.total",
        Tags.of("bucket", bucketType, "user", userId.toString())).increment();
    // ...
}
```

### 5.3 Prometheus Queries cho Fairness

```promql
# Tỷ lệ request bị limit theo bucket
rate_limit_rejected / rate_limit_total > 0.1

# Top 10 user có nhiều request nhất
topk(10, sum by (user_id) (rate(api_requests_total[5m])))

# Requests per second theo endpoint
rate(http_server_requests_seconds_count[1m])
```

---

## 6. Health Check Script

```bash
#!/bin/bash
# scripts/health-check.sh

echo "=== VietLamH24 Health Check ==="

# 1. Nginx
nginx_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/nginx_status)
echo "Nginx: $nginx_status"

# 2. Backend instances
for port in 8080 8081 8082; do
    status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/actuator/health)
    echo "Backend :$port: $status"
done

# 3. Redis
redis_ping=$(redis-cli ping 2>/dev/null)
echo "Redis: $redis_ping"

# 4. MySQL
mysql_status=$(mysqladmin ping -h localhost -u root -p${MYSQL_ROOT_PASSWORD} 2>/dev/null)
echo "MySQL: $mysql_status"

# 5. Connection count
echo "Active connections to backend:"
curl -s http://localhost:8080/actuator/metrics/tomcat.threads.busy | grep value

echo "=== Done ==="
```

```bash
chmod +x scripts/health-check.sh
```
