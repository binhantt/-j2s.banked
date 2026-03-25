# SKILL — Tối ưu hệ thống cho 50,000+ người dùng đồng thời

> **Mục tiêu:** Hệ thống chịu được **50,000 concurrent users** (hoặc 200,000+ total registered users) mà không suy giảm hiệu năng đáng kể.
>
> **Phạm vi:** Frontend (Next.js/React) + Backend (Spring Boot + MySQL + Redis) + Infrastructure

---

## 1. Tổng quan Kiến trúc

```
                          ┌─────────────────┐
                          │   CDN / WAF      │  ← CloudFlare / AWS CloudFront
                          │  (Static assets) │
                          └────────┬──────────┘
                                   │ /api/*
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
        ▼                          ▼                          ▼
┌───────────────┐         ┌─────────────────┐        ┌──────────────────┐
│  Next.js SSR  │         │   Load Balancer  │        │  Static Files    │
│  (Frontend)   │         │  (Nginx / AWS)   │        │  (S3 / OSS)      │
└───────┬───────┘         └────────┬─────────┘        └──────────────────┘
        │                           │
        │ JWT Auth Cookie           │ /api/*
        ▼                           ▼
┌──────────────────────────────────┐
│         API Gateway / Nginx       │  ← Rate limiting, SSL termination
└──────────┬───────────────────────┘
           │
           ▼
  ┌────────────────┐    ┌──────────────┐    ┌──────────────┐
  │  Spring Boot    │◄──►│    Redis      │◄──►│    MySQL      │
  │  (stateless)    │    │  (cache/session)│   │  (primary DB) │
  └────────────────┘    └──────────────┘    └──────────────┘
         │
         ▼
  ┌────────────────┐
  │  Object Storage │
  │  (AVatars, CV)  │
  └────────────────┘
```

---

## 2. Backend — Spring Boot + MySQL

### 2.1 Database Indexing (QUAN TRỌNG NHẤT)

```sql
-- ===== VIEC LAM / JOBS =====
CREATE INDEX idx_jobs_status_active ON jobs(status, is_active, created_at DESC);
CREATE INDEX idx_jobs_user_active ON jobs(user_id, is_active, created_at DESC);
CREATE INDEX idx_jobs_search ON jobs(title(50), description(100), is_active, status);
CREATE INDEX idx_jobs_location ON jobs.location, is_active;

-- ===== UNG TUYEN / APPLICATIONS =====
CREATE INDEX idx_applications_job_user ON applications(job_id, user_id);
CREATE INDEX idx_applications_user_status ON applications(user_id, status);
CREATE INDEX idx_applications_job_status ON applications(job_id, status);

-- ===== USERS =====
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active, created_at);
CREATE INDEX idx_users_type ON users(user_type, is_active);

-- ===== NOTIFICATIONS =====
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);

-- ===== CHAT / MESSAGES =====
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_conversations_participants ON conversations(user1_id, user2_id, updated_at DESC);

-- ===== REFRESH TOKENS =====
CREATE INDEX idx_refresh_tokens_hash ON user_refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_user ON user_refresh_tokens(user_id, is_revoked, is_used);
```

> **Nguyên tắc:** Mọi `WHERE`, `JOIN`, `ORDER BY` trong code phải có index tương ứng.
> Dùng `EXPLAIN ANALYZE` để kiểm tra query plan.

### 2.2 Connection Pool (HikariCP)

```yaml
# application.yml
spring:
  datasource:
    hikari:
      # Số kết nối tối đa — điều chỉnh theo RAM server
      maximum-pool-size: 40
      # Số kết nối tối thiểu luôn giữ alive
      minimum-idle: 10
      # Timeout chờ kết nối (ms)
      connection-timeout: 30000
      # Timeout idle (ms) — > 10 phút không dùng → đóng
      idle-timeout: 600000
      # Max lifetime của 1 connection (ms) — tránh stale connection
      max-lifetime: 1800000
      pool-name: VietLamH24Pool
```

### 2.3 Redis Caching (Cache toàn bộ data "đọc nhiều - ít sửa")

```java
// src/main/java/.../infrastructure/cache/CacheService.java
package com.example.bankend_hovan_J2.infrastructure.cache;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;

@Service
public class CacheService {

    private final RedisTemplate<String, Object> redisTemplate;

    // ── TTL Constants ──
    private static final Duration TTL_SHORT  = Duration.ofMinutes(5);   // session, token
    private static final Duration TTL_MEDIUM  = Duration.ofMinutes(30);  // user profile
    private static final Duration TTL_LONG     = Duration.ofHours(2);     // job listings
    private static final Duration TTL_VERY_LONG = Duration.ofHours(24);    // static config

    // ════════════════════════════════════════════════════════════
    //  CACHE DANH SÁCH VIỆC LÀM
    // ════════════════════════════════════════════════════════════
    public List<Object> getJobsList(Long userId, int page, int size) {
        String key = "jobs:list:" + userId + ":" + page + ":" + size;
        return (List<Object>) redisTemplate.opsForValue().get(key);
    }

    public void setJobsList(Long userId, int page, int size, List<Object> jobs) {
        String key = "jobs:list:" + userId + ":" + page + ":" + size;
        redisTemplate.opsForValue().set(key, jobs, TTL_LONG);
    }

    // ════════════════════════════════════════════════════════════
    //  CACHE THÔNG TIN VIỆC LÀM (1 job detail)
    // ════════════════════════════════════════════════════════════
    public Object getJobDetail(Long jobId) {
        return redisTemplate.opsForValue().get("job:" + jobId);
    }

    public void setJobDetail(Long jobId, Object jobDetail) {
        redisTemplate.opsForValue().set("job:" + jobId, jobDetail, TTL_LONG);
    }

    public void evictJobDetail(Long jobId) {
        redisTemplate.delete("job:" + jobId);
    }

    // ════════════════════════════════════════════════════════════
    //  CACHE USER PROFILE
    // ════════════════════════════════════════════════════════════
    public Object getUserProfile(Long userId) {
        return redisTemplate.opsForValue().get("user:profile:" + userId);
    }

    public void setUserProfile(Long userId, Object profile) {
        redisTemplate.opsForValue().set("user:profile:" + userId, profile, TTL_MEDIUM);
    }

    public void evictUserProfile(Long userId) {
        redisTemplate.delete("user:profile:" + userId);
    }

    // ════════════════════════════════════════════════════════════
    //  CACHE SỐ LƯỢNG THÔNG BÁO (unread count)
    // ════════════════════════════════════════════════════════════
    public Long getUnreadNotificationCount(Long userId) {
        return redisTemplate.opsForValue().get("notif:unread:" + userId);
    }

    public void incrementUnreadNotification(Long userId) {
        String key = "notif:unread:" + userId;
        redisTemplate.opsForValue().increment(key);
        redisTemplate.expire(key, TTL_SHORT);
    }

    public void resetUnreadNotification(Long userId) {
        redisTemplate.delete("notif:unread:" + userId);
    }

    // ════════════════════════════════════════════════════════════
    //  CACHE DANH SÁCH CÔNG TY
    // ════════════════════════════════════════════════════════════
    public Object getCompaniesList(int page, int size) {
        return redisTemplate.opsForValue().get("companies:list:" + page + ":" + size);
    }

    public void setCompaniesList(int page, int size, Object companies) {
        redisTemplate.opsForValue().set("companies:list:" + page + ":" + size, companies, TTL_LONG);
    }

    // ════════════════════════════════════════════════════════════
    //  EVICT ALL (khi admin update data)
    // ════════════════════════════════════════════════════════════
    public void evictAllJobsList() {
        Set<String> keys = redisTemplate.keys("jobs:list:*");
        if (keys != null && !keys.isEmpty()) redisTemplate.delete(keys);
        // Evict all job details
        Set<String> jobKeys = redisTemplate.keys("job:*");
        if (jobKeys != null && !jobKeys.isEmpty()) redisTemplate.delete(jobKeys);
    }

    public void evictAllCompanies() {
        Set<String> keys = redisTemplate.keys("companies:*");
        if (keys != null && !keys.isEmpty()) redisTemplate.delete(keys);
    }

    // ════════════════════════════════════════════════════════════
    //  CACHE CÁC API CÔNG KHAI (không cần auth)
    // ════════════════════════════════════════════════════════════
    public Object getPublicJobs(int page, int size) {
        return redisTemplate.opsForValue().get("public:jobs:" + page + ":" + size);
    }

    public void setPublicJobs(int page, int size, Object jobs) {
        redisTemplate.opsForValue().set("public:jobs:" + page + ":" + size, jobs, TTL_LONG);
    }
}
```

**Sử dụng trong Controller:**

```java
@GetMapping
public ResponseEntity<?> getJobs(@RequestParam(defaultValue = "0") int page,
                                 @RequestParam(defaultValue = "20") int size,
                                 Principal principal) {
    // Try cache first
    List<Object> cached = cacheService.getJobsList(
        principal != null ? getUserId(principal) : 0L, page, size);
    if (cached != null) {
        return ResponseEntity.ok(cached);
    }

    // DB query
    List<Object> jobs = jobService.getJobs(page, size);

    // Cache result
    cacheService.setJobsList(
        principal != null ? getUserId(principal) : 0L, page, size, jobs);

    return ResponseEntity.ok(jobs);
}
```

### 2.4 Pagination + Cursor-Based (thay vì Offset)

```java
// ── OFFSET PAGING (CHẬM với large tables) ──
@Query("SELECT j FROM Job j WHERE j.isActive = true ORDER BY j.createdAt DESC")
Page<Job> findJobs(Pageable pageable);  // SELECT * FROM jobs ORDER BY id DESC LIMIT 20 OFFSET 1000000 ❌

// ── CURSOR PAGING (NHANH — dùng cho danh sách dài) ──
@Query("""
    SELECT j FROM Job j
    WHERE j.isActive = true
      AND j.id < :cursor
    ORDER BY j.id DESC
    LIMIT :limit
    """)
List<Job> findJobsCursor(@Param("cursor") Long cursor, @Param("limit") int limit);
```

```typescript
// Frontend — Cursor pagination
interface CursorPaginatedResponse<T> {
  data: T[];
  nextCursor: number | null;
  hasMore: boolean;
}

// API call
const fetchJobs = async (cursor?: number) => {
  const params = cursor ? `?cursor=${cursor}&limit=20` : '?limit=20';
  const response = await api.get(`/api/jobs${params}`);
  return response.data;
};
```

### 2.5 N+1 Query Prevention

```java
// ── BAD: N+1 query ──
// @OneToMany(fetch = FetchType.LAZY) mặc định → mỗi job query thêm company = N query

// ── GOOD: JOIN FETCH 1 lần duy nhất ──
@Query("""
    SELECT DISTINCT j FROM Job j
    LEFT JOIN FETCH j.company c
    LEFT JOIN FETCH j.industry i
    WHERE j.isActive = true AND j.status = 'PUBLISHED'
    ORDER BY j.createdAt DESC
    """)
List<Job> findActiveJobsWithDetails();

// Hoặc dùng EntityGraph
@EntityGraph(attributePaths = {"company", "industry"})
@Query("SELECT j FROM Job j WHERE j.isActive = true")
List<Job> findAllActiveJobs();
```

### 2.6 Rate Limiting cấu hình cao

```java
// Tăng limits trong Bucket4j config
@Configuration
public class RateLimitConfig {
    @Bean
    public Map<String, Bucket> buckets() {
        return Map.of(
            // API đọc: 500 req/phút / IP
            "read-api", createBucket(500, 60),
            // API ghi: 30 req/phút / IP
            "write-api", createBucket(30, 60),
            // Auth endpoints: 10 req/phút / IP (chống brute force)
            "auth-strict", createBucket(10, 60),
            // Tìm kiếm: 60 req/phút / user
            "search", createBucket(60, 60)
        );
    }

    private Bucket createBucket(int capacity, int refillDurationSeconds) {
        return Bucket.builder()
            .addLimit(Bandwidth.classic(capacity,
                Refill.intervally(capacity, Duration.ofSeconds(refillDurationSeconds))))
            .build();
    }
}
```

### 2.7 Async Processing (Email, Notifications)

```java
// Thay vì gửi email đồng bộ (chặn request), dùng @Async
@Service
public class AsyncNotificationService {

    @Async("notificationExecutor")
    public void sendEmailAsync(String to, String subject, String body) {
        // Gửi email — không blocking main thread
        emailService.send(to, subject, body);
    }

    @Async("notificationExecutor")
    public void pushNotification(Long userId, String message) {
        // Push notification — không blocking
        notificationService.push(userId, message);
    }

    @Async("notificationExecutor")
    public void processApplication(Long applicationId) {
        // Xử lý đơn ứng tuyển — chậm nhưng không cần reply ngay
        applicationService.processApplication(applicationId);
    }
}

// Thread pool config
@Configuration
@EnableAsync
public class AsyncConfig {
    @Bean("notificationExecutor")
    public Executor notificationExecutor() {
        return ThreadPoolTaskExecutor.builder()
            .corePoolSize(10)
            .maxPoolSize(50)
            .queueCapacity(500)
            .threadNamePrefix("notif-")
            .rejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy())
            .build();
    }
}
```

### 2.8 Database Sharding (khi > 500,000 users)

Khi MySQL đơn lẻ không đủ, chia theo `user_id % N`:

```java
// Shard routing
@Component
public class ShardRouter {
    private final int SHARD_COUNT = 4;  // Bắt đầu với 4 shards

    public int getShardIndex(Long userId) {
        return (int) (userId % SHARD_COUNT);
    }

    public DataSource getDataSource(Long userId) {
        return dataSources.get(getShardIndex(userId));
    }
}
```

---

## 3. Frontend — Next.js / React

### 3.1 React Query / TanStack Query (QUAN TRỌNG NHẤT)

```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache 5 phút — không refetch liên tục
      staleTime: 5 * 60 * 1000,
      // Cache tối đa 10 phút
      gcTime: 10 * 60 * 1000,
      // Retry 1 lần khi fail
      retry: 1,
      // Không refetch khi tab đang ở background (tiết kiệm server)
      refetchOnWindowFocus: false,
    },
  },
});

// ── Sử dụng trong component ──
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Danh sách việc làm — cache 5 phút
const useJobs = (page: number) => {
  return useQuery({
    queryKey: ['jobs', page],
    queryFn: async () => {
      const response = await api.get(`/api/jobs?page=${page}&size=20`);
      return response.data;
    },
    // Giữ data cũ khi fetch data mới (smooth transition)
    placeholderData: (prev) => prev,
  });
};

// Chi tiết việc làm — cache lâu hơn
const useJobDetail = (jobId: number) => {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const response = await api.get(`/api/jobs/${jobId}`);
      return response.data;
    },
    staleTime: 30 * 60 * 1000,  // 30 phút
  });
};

// Tạo mutation với invalidate cache thông minh
const useCreateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateJobDTO) => {
      const response = await api.post('/api/jobs', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate jobs list cache — fetch lại
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      // Không invalidate job detail vì chưa tạo xong
    },
  });
};
```

### 3.2 Virtual Scrolling (cho danh sách dài)

```typescript
// components/common/VirtualJobList.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export const VirtualJobList = ({ jobs }: { jobs: Job[] }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: jobs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,  // Chiều cao ước tính mỗi job card (px)
    overscan: 5,              // Render thêm 5 item ngoài viewport
  });

  return (
    <div
      ref={parentRef}
      style={{ height: '100vh', overflow: 'auto' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <JobCard job={jobs[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 3.3 Lazy Loading + Code Splitting

```typescript
// pages/_app.tsx — Dynamic import cho các trang nặng
import dynamic from 'next/dynamic';
import { queryClient } from '@/lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';

// Lazy load trang nặng (blog, admin panel)
const AdminPanel = dynamic(() => import('@/features/admin/AdminPanel'), {
  loading: () => <div className="animate-pulse p-8">Đang tải...</div>,
  ssr: false,  // Admin không cần SSR
});

const BlogPage = dynamic(() => import('@/features/blog/BlogPage'), {
  loading: () => <BlogSkeleton />,
  ssr: true,
});

// Lazy load component nặng (chart, rich text editor)
const RichTextEditor = dynamic(() => import('@/components/editor/RichTextEditor'), {
  ssr: false,
});

const Chart = dynamic(() => import('@/components/charts/StatsChart'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded animate-pulse" />,
});
```

### 3.4 Debounce Search (chống spam API)

```typescript
// hooks/useDebouncedSearch.ts
import { useState, useEffect } from 'react';

export const useDebouncedSearch = (value: string, delay: number = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

// Sử dụng trong trang tìm kiếm
const SearchPage = () => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedSearch(query, 400);  // Đợi 400ms sau khi gõ

  const { data } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => api.get(`/api/jobs/search?q=${debouncedQuery}`),
    enabled: debouncedQuery.length >= 2,  // Chỉ search khi >= 2 ký tự
  });

  return (
    <Input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Tìm việc làm..."
    />
  );
};
```

### 3.5 Image Optimization (Avatar, Job Images)

```typescript
// Next.js Image component — tự động resize, lazy load, WebP
import Image from 'next/image';

// Avatar user — kích thước cố định nhỏ
<Image
  src={user.avatarUrl || '/default-avatar.png'}
  alt={user.name}
  width={48}
  height={48}
  className="rounded-full object-cover"
  // Tự động lazy load + placeholder blur
  placeholder="blur"
  blurDataURL="data:image/png;base64,..."  // 10x10 px base64
/>

// Job cover image
<Image
  src={job.coverImage}
  alt={job.title}
  fill  // Responsive — fill container
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover"
  priority={index < 3}  // Preload 3 ảnh đầu tiên
/>
```

### 3.6 Service Worker — Offline + Prefetch

```typescript
// lib/sw.ts — Đăng ký service worker
// public/sw.js
const CACHE_NAME = 'vietlamh24-v1';
const STATIC_ASSETS = [
  '/',
  '/login',
  '/jobs',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

// Prefetch jobs list khi user đăng nhập
self.addEventListener('message', (event) => {
  if (event.data === 'PREFETCH_JOBS') {
    fetch('/api/jobs?page=0&size=20')
      .then((res) => res.json())
      .then((data) => caches.open(CACHE_NAME).then((cache) => cache.put('/api/jobs', new Response(JSON.stringify(data)))));
  }
});
```

### 3.7 WebSocket cho Notifications + Chat (thay vì polling)

```typescript
// lib/useWebSocket.ts
import { useEffect, useRef } from 'react';
import { api } from '@/lib/api';

export const useNotificationSocket = (userId: number) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const connect = () => {
      // Kết nối WebSocket — thay polling 5 giây
      const token = localStorage.getItem('token');
      const ws = new WebSocket(
        `${process.env.NEXT_PUBLIC_WS_URL}/ws/notifications?token=${token}`
      );

      ws.onmessage = (event) => {
        const notification = JSON.parse(event.data);
        // Cập nhật UI ngay lập tức — không cần reload
        if (notification.type === 'NEW_MESSAGE') {
          useChatStore.getState().addMessage(notification.data);
        }
        if (notification.type === 'NEW_APPLICATION') {
          message.success('Bạn có đơn ứng tuyển mới!');
          useNotificationStore.getState().incrementUnread();
        }
      };

      ws.onclose = () => {
        // Reconnect sau 3 giây nếu mất kết nối
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      wsRef.current = ws;
    };

    connect();
    return () => {
      clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
    };
  }, [userId]);
};

// Navbar — không còn setInterval polling
const Navbar = () => {
  useNotificationSocket(currentUser.id);  // WebSocket real-time
  // Thay vì: useEffect(() => { const interval = setInterval(poll, 5000); }, []);
};
```

---

## 4. Cấu hình Infrastructure

### 4.1 Nginx (Load Balancer + Reverse Proxy)

```nginx
# /etc/nginx/nginx.conf

# Upstream — nhiều Spring Boot instances
upstream backend {
    least_conn;  # Load balance theo active connections
    server 127.0.0.1:8080 weight=3;
    server 127.0.0.1:8081 weight=3;
    server 127.0.0.1:8082 weight=2;
}

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=10r/m;
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;
limit_req_zone $binary_remote_addr zone=search_limit:10m rate=30r/m;

server {
    listen 80;
    server_name api.vietlamh24.com;

    # SSL Termination
    ssl_certificate /etc/ssl/certs/vietlamh24.crt;
    ssl_certificate_key /etc/ssl/private/vietlamh24.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    # ── Gzip compression ──
    gzip on;
    gzip_types application/json text/css application/javascript;
    gzip_min_length 1000;

    # ── Static files (Next.js build) ──
    location /_next/static/ {
        proxy_cache_valid 200 60m;
        expires 60m;
        add_header Cache-Control "public, immutable";
    }

    # ── Auth endpoints — rate limit CHẶT NHẤT ──
    location /api/auth/ {
        limit_req zone=auth_limit burst=5 nodelay;
        proxy_pass http://backend;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_connect_timeout 5s;
        proxy_read_timeout 30s;
    }

    # ── Search — rate limit vừa ──
    location /api/jobs/search {
        limit_req zone=search_limit burst=20 nodelay;
        proxy_pass http://backend;
        proxy_cache_valid 200 5m;
        add_header X-Cache-Status HIT;
    }

    # ── API proxy ──
    location /api/ {
        limit_req zone=api_limit burst=200 nodelay;
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Connection pooling — reuse connections
        proxy_http_version 1.1;
        proxy_set_header Connection "";

        # Timeouts
        proxy_connect_timeout 10s;
        proxy_send_timeout 30s;
        proxy_read_timeout 60s;

        # Buffering — giảm memory pressure
        proxy_buffering on;
        proxy_buffer_size 8k;
        proxy_buffers 8 16k;
    }
}
```

### 4.2 Redis Session Store

```java
// Thêm Redis session cho JWT blacklist thay vì ConcurrentHashMap
@Configuration
@EnableRedisHttpSession(maxInactiveIntervalInSeconds = 604800)  // 7 ngày
public class RedisSessionConfig {
    @Bean
    public RedisTemplate<String, Object> redisTemplate(
            RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        // Serialize JWT blacklist entries
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        return template;
    }
}
```

### 4.3 Docker / Kubernetes Scaling

```yaml
# docker-compose.yml — Production setup
services:
  spring-boot:
    image: vietlamh24/backend:latest
    deploy:
      replicas: 3  # 3 instances
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - REDIS_HOST=redis
      - MYSQL_HOST=mysql-primary
    depends_on:
      - redis
      - mysql
    restart: always

  redis:
    image: redis:7-alpine
    command: redis-server --maxmemory 2gb --maxmemory-policy allkeys-lru
    restart: always

  # MySQL primary + 1 replica
  mysql-primary:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=${DB_ROOT_PASSWORD}
      - MYSQL_DATABASE=vietlamh24
    command: --innodb-buffer-pool-size=1G --max-connections=500
    volumes:
      - mysql_data:/var/lib/mysql
    restart: always

  mysql-replica:
    image: mysql:8.0
    command: --innodb-buffer-pool-size=1G
    depends_on:
      - mysql-primary
    restart: always

volumes:
  mysql_data:
```

---

## 5. Monitoring & Observability

### 5.1 Metrics (Micrometer + Prometheus)

```java
// Metrics cho mỗi API endpoint
@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final MeterRegistry meterRegistry;

    @GetMapping
    public ResponseEntity<?> getJobs() {
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            List<Job> jobs = jobService.getJobs();
            // Record: count, time
            meterRegistry.counter("jobs.list.requests").increment();
            return ResponseEntity.ok(jobs);
        } finally {
            sample.stop(Timer.builder("jobs.list.latency")
                .description("Thời gian response API jobs")
                .register(meterRegistry));
        }
    }
}
```

### 5.2 Health Checks

```java
// src/main/java/.../infrastructure/health/
@Component
public class DatabaseHealthIndicator implements HealthIndicator {
    @Override
    public Health health() {
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            return Health.up()
                .withDetail("db", "MySQL")
                .withDetail("status", "connected")
                .build();
        } catch (Exception e) {
            return Health.down()
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}

// GET /actuator/health → return status health của toàn bộ hệ thống
```

---

## 6. Checklist Triển khai cho 50K Users

| STT | Tối ưu | Mức ưu tiên | Impact |
|-----|--------|-------------|--------|
| 1 | Thêm database indexes | **P0** | Giảm 80% query time |
| 2 | Bật Redis caching (jobs list, profiles) | **P0** | Giảm 95% DB load |
| 3 | Thay axios → React Query | **P0** | Giảm 90% redundant requests |
| 4 | Tăng HikariCP pool size | P1 | Tránh connection exhaustion |
| 5 | Thêm rate limiting trên Nginx | P1 | Chống DDoS, bảo vệ server |
| 6 | Cursor-based pagination | P1 | Danh sách dài mượt hơn |
| 7 | Debounce search (400ms) | P1 | Giảm 80% search requests |
| 8 | Virtual scrolling (danh sách > 100 items) | P2 | Smooth scroll, ít DOM nodes |
| 9 | WebSocket cho notifications | P2 | Real-time, bớt polling |
| 10 | Async email/notification | P2 | Response time nhanh hơn |
| 11 | Lazy load + code splitting | P2 | JS bundle nhỏ hơn, load nhanh |
| 12 | Image optimization (next/image) | P3 | Tiết kiệm bandwidth |
| 13 | Docker replicas (3+ instances) | P3 | High availability |

---

## 7. Quick Wins — Code có thể apply NGAY

### 7.1 Thêm Redis caching trong `JobService`

```java
// Tìm file JobService.java hoặc tạo mới
// src/main/java/.../application/job/JobService.java

@RequiredArgsConstructor
@Service
public class JobService {

    private final JobRepository jobRepository;
    private final CacheService cacheService;

    private static final int CACHE_TTL_MINUTES = 30;

    public List<Job> getActiveJobs(int page, int size) {
        // Check cache first
        String cacheKey = "jobs:active:" + page + ":" + size;
        @SuppressWarnings("unchecked")
        List<Job> cached = (List<Job>) cacheService.get(cacheKey);
        if (cached != null) {
            return cached;
        }

        // DB query
        Pageable pageable = PageRequest.of(page, size);
        List<Job> jobs = jobRepository.findByIsActiveTrueOrderByCreatedAtDesc(pageable);

        // Cache result
        cacheService.set(cacheKey, jobs, Duration.ofMinutes(CACHE_TTL_MINUTES));
        return jobs;
    }

    @Transactional
    public Job createJob(Job job) {
        Job saved = jobRepository.save(job);
        // Invalidate jobs list cache — tất cả pages
        cacheService.evictAllJobsList();
        return saved;
    }

    @Transactional
    public void toggleJobStatus(Long jobId, boolean active) {
        jobRepository.updateActiveStatus(jobId, active);
        // Evict cache
        cacheService.evictJobDetail(jobId);
        cacheService.evictAllJobsList();
    }
}
```

### 7.2 Thêm React Query vào `_app.tsx`

```typescript
// pages/_app.tsx — Thêm QueryClientProvider
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

function App({ Component, pageProps }: AppProps) {
  // ... existing code ...

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={theme}>
        <Component {...pageProps} />
      </ConfigProvider>
    </QueryClientProvider>
  );
}
```

### 7.3 Cập nhật Navbar — thêm React Query cho notifications

```typescript
// components/layout/Navbar.tsx
import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '@/lib/notificationApi';

// THAY thế setInterval polling
const { data: notifications } = useQuery({
  queryKey: ['notifications', 'unread-count'],
  queryFn: () => notificationApi.getUnreadCount(),
  // Refresh mỗi 60 giây — không spam request
  refetchInterval: 60 * 1000,
  // Không refetch khi tab không active
  refetchOnWindowFocus: false,
});
```

---

## 8. Mục tiêu hiệu năng

| Chỉ số | Trước tối ưu | Sau tối ưu |
|--------|-------------|-------------|
| **API Response Time** (p95) | 800–2000ms | < 200ms |
| **Concurrent users** | ~2,000 | 50,000+ |
| **DB Queries / request** | 15–50 | 1–3 |
| **Cache hit rate** | 0% | > 80% |
| **Time to First Byte** | 2–5s | < 500ms |
| **Error rate** | 1–5% | < 0.1% |
