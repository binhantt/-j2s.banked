package com.example.bankend_hovan_J2.infrastructure.ratelimit;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Distributed Rate Limiter — Dùng Redis để chia sẻ rate limit GIỮA các instances.
 *
 * Key: "rl:{ip}:{group}"  ( Ví dụ: "rl:127.0.0.1:auth-strict" )
 *
 * Logic Redis:
 *   INCR rl:{ip}:{group} → nếu count == 1 → SET EXPIRE (window seconds)
 *   → nếu count > limit → trả 429
 *
 * Fallback: Nếu Redis không khả dụng → dùng Bucket4j local (in-memory)
 *
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  Mỗi user/IP có bucket RIÊNG trong Redis              ║
 * ║  User A gửi 100 req → User B vẫn có bucket đầy       ║
 * ║  → KHÔNG ẢNH HƯỞNG nhau                           ║
 * ╚══════════════════════════════════════════════════════════════╝
 */
@Component
public class RateLimitFilter implements Filter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);

    // ── In-memory fallback (khi Redis không khả dụng) ──
    // Key: "ip:group", Value: Bucket per IP per group
    private final Map<String, Bucket> localBuckets = new ConcurrentHashMap<>();

    // ── Redis (distributed) ──
    private final StringRedisTemplate redisTemplate;
    private final boolean redisEnabled;

    // ── Global toggle ──
    @Value("${rate-limit.enabled:true}")
    private boolean rateLimitEnabled;

    // ── Whitelist paths ──
    @Value("#{'${rate-limit.whitelist-paths:/api/notifications/,/api/auth/,/api/upload/,/api/cv/,/uploads/,/api/health}'.split(',')}")
    private List<String> whitelistPaths;

    // ── Auth strict: /api/auth/login, /api/auth/register ──
    @Value("${rate-limit.group.auth-strict.limit:5}")
    private int authStrictLimit;

    @Value("${rate-limit.group.auth-strict.window-seconds:60}")
    private int authStrictWindow;

    // ── Auth other: /api/auth/** (khác) ──
    @Value("${rate-limit.group.auth.limit:10}")
    private int authLimit;

    @Value("${rate-limit.group.auth.window-seconds:60}")
    private int authWindow;

    // ── Read: GET /api/jobs, /api/companies, /api/blog, /api/domains ──
    @Value("${rate-limit.group.read.limit:200}")
    private int readLimit;

    @Value("${rate-limit.group.read.window-seconds:60}")
    private int readWindow;

    // ── Write: POST/PUT/PATCH/DELETE (non-auth) ──
    @Value("${rate-limit.group.write.limit:20}")
    private int writeLimit;

    @Value("${rate-limit.group.write.window-seconds:60}")
    private int writeWindow;

    // ── Default fallback ──
    @Value("${rate-limit.group.default.limit:100}")
    private int defaultLimit;

    @Value("${rate-limit.group.default.window-seconds:60}")
    private int defaultWindow;

    // ── Paths bị giới hạn cực chặt ──
    private static final List<String> AUTH_STRICT_PATHS = List.of(
        "/api/auth/login",
        "/api/auth/register"
    );

    public RateLimitFilter(
            StringRedisTemplate redisTemplate,
            @Value("${spring.data.redis.host:localhost}") String redisHost) {
        this.redisTemplate = redisTemplate;
        // Redis enabled khi StringRedisTemplate được inject thành công
        // → Khi chạy Redis (localhost hay remote) đều dùng distributed rate limit
        // → Khi Redis không chạy / lỗi → fallback in-memory (graceful degradation)
        this.redisEnabled = redisTemplate != null;
        log.info("[RateLimit] Redis distributed mode: {}", redisEnabled ? "ENABLED" : "DISABLED (in-memory fallback)");
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        if (!rateLimitEnabled) {
            chain.doFilter(request, response);
            return;
        }

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String path = httpRequest.getRequestURI();
        String method = httpRequest.getMethod();

        // ── Whitelist bypass ──
        if (isWhitelisted(path)) {
            chain.doFilter(request, response);
            return;
        }

        String ip = getClientIP(httpRequest);
        String group = resolveGroup(path, method);
        int limit = getLimit(group);
        int window = getWindowSeconds(group);

        // ╔══════════════════════════════════════════════════════════╗
        // ║  REDIS RATE LIMIT (distributed — nếu Redis khả dụng)  ║
        // ╚══════════════════════════════════════════════════════════╝
        if (redisEnabled) {
            boolean allowed = checkRedisRateLimit(ip, group, limit, window);
            if (!allowed) {
                send429(httpResponse, group, limit, window);
                return;
            }
        } else {
            // ── Fallback: Bucket4j local (in-memory) ──
            boolean allowed = checkLocalRateLimit(ip, group);
            if (!allowed) {
                send429(httpResponse, group, limit, window);
                return;
            }
        }

        // ── Thêm headers thông tin ──
        httpResponse.setHeader("X-RateLimit-Group", group);
        httpResponse.setHeader("X-RateLimit-Limit", String.valueOf(limit));
        httpResponse.setHeader("X-RateLimit-Window", window + "s");
        httpResponse.setHeader("X-RateLimit-Mode", redisEnabled ? "distributed" : "local");

        chain.doFilter(request, response);
    }

    /**
     * ╔══════════════════════════════════════════════════════════════╗
     * ║  REDIS DISTRIBUTED RATE LIMIT                          ║
     * ║                                                        ║
     * ║  1. INCR rl:{ip}:{group}                             ║
     * ║  2. Nếu count == 1 → SET EXPIRE (window seconds)    ║
     * ║  3. Nếu count > limit → REJECT                       ║
     * ║                                                        ║
     * ║  ★ Mỗi instance chạy cùng 1 Redis                  ║
     * ║  ★ Không ai có thể vượt limit dù chạy nhiều server  ║
     * ╚══════════════════════════════════════════════════════════════╝
     */
    private boolean checkRedisRateLimit(String ip, String group, int limit, int windowSeconds) {
        String redisKey = "rl:" + ip + ":" + group;
        try {
            Long count = redisTemplate.opsForValue().increment(redisKey);

            if (count == null) {
                // Redis lỗi → fallback sang local
                log.warn("[RateLimit] Redis INCR failed, falling back to local");
                return checkLocalRateLimit(ip, group);
            }

            // Set EXPIRE khi request đầu tiên trong window
            if (count == 1) {
                redisTemplate.expire(redisKey, Duration.ofSeconds(windowSeconds));
            }

            // count > limit → REJECT
            if (count > limit) {
                log.debug("[RateLimit] Redis REJECT {}: count={}, limit={}", redisKey, count, limit);
                return false;
            }

            log.debug("[RateLimit] Redis ALLOW {}: count={}, limit={}", redisKey, count, limit);
            return true;

        } catch (Exception e) {
            // Redis exception → fallback local để không block user
            log.warn("[RateLimit] Redis error: {}, falling back to local", e.getMessage());
            return checkLocalRateLimit(ip, group);
        }
    }

    /**
     * ╔══════════════════════════════════════════════════════════════╗
     * ║  LOCAL BUCKET4J RATE LIMIT (fallback / dev)          ║
     * ║                                                        ║
     * ║  Mỗi instance có Map riêng                          ║
     * ║  Dùng khi: Redis không khả dụng HOẶC dev localhost   ║
     * ╚══════════════════════════════════════════════════════════════╝
     */
    private boolean checkLocalRateLimit(String ip, String group) {
        String bucketKey = ip + ":" + group;
        Bucket bucket = localBuckets.computeIfAbsent(bucketKey, k -> createLocalBucket(group));
        return bucket.tryConsume(1);
    }

    private Bucket createLocalBucket(String group) {
        int limit = getLimit(group);
        int window = getWindowSeconds(group);
        Bandwidth bandwidth = Bandwidth.classic(
            limit,
            Refill.intervally(limit, Duration.ofSeconds(window))
        );
        return Bucket.builder().addLimit(bandwidth).build();
    }

    /**
     * ╔══════════════════════════════════════════════════════════════╗
     * ║  PHÂN LOẠI ENDPOINT VÀO GROUP                       ║
     * ║                                                        ║
     * ║  auth-strict:  5 req/min  — login, register        ║
     * ║  auth:        10 req/min  — other auth             ║
     * ║  read:       200 req/min  — GET public data         ║
     * ║  write:       20 req/min  — POST/PUT/DELETE        ║
     * ║  default:    100 req/min  — fallback                ║
     * ╚══════════════════════════════════════════════════════════════╝
     */
    private String resolveGroup(String path, String method) {
        // Auth endpoints
        if (path.startsWith("/api/auth/")) {
            if (AUTH_STRICT_PATHS.contains(path)) {
                return "auth-strict";
            }
            return "auth";
        }

        // Read-only GET trên public resources
        if ("GET".equalsIgnoreCase(method)) {
            if (path.startsWith("/api/jobs") ||
                path.startsWith("/api/companies") ||
                path.startsWith("/api/blog") ||
                path.startsWith("/api/domains")) {
                return "read";
            }
        }

        // Write operations
        if ("POST".equalsIgnoreCase(method) ||
            "PUT".equalsIgnoreCase(method) ||
            "PATCH".equalsIgnoreCase(method) ||
            "DELETE".equalsIgnoreCase(method)) {
            return "write";
        }

        return "default";
    }

    private int getLimit(String group) {
        return switch (group) {
            case "auth-strict" -> authStrictLimit;
            case "auth"         -> authLimit;
            case "read"         -> readLimit;
            case "write"        -> writeLimit;
            default             -> defaultLimit;
        };
    }

    private int getWindowSeconds(String group) {
        return switch (group) {
            case "auth-strict" -> authStrictWindow;
            case "auth"         -> authWindow;
            case "read"         -> readWindow;
            case "write"        -> writeWindow;
            default             -> defaultWindow;
        };
    }

    private void send429(HttpServletResponse response, String group, int limit, int window)
            throws IOException {
        response.setStatus(429);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Retry-After", String.valueOf(window));
        response.setHeader("X-RateLimit-Limit", String.valueOf(limit));

        String json = """
            {
                "error": "Quá nhiều yêu cầu. Vui lòng chờ %d giây và thử lại.",
                "code": "RATE_LIMIT_EXCEEDED",
                "group": "%s",
                "limit": %d,
                "windowSeconds": %d,
                "retryAfter": %d
            }
            """.formatted(window, group, limit, window);

        response.getWriter().write(json);
    }

    private boolean isWhitelisted(String path) {
        return whitelistPaths.stream().anyMatch(path::startsWith);
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isBlank()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        log.info("[RateLimit] Filter initialized. Redis mode: {}", redisEnabled ? "DISTRIBUTED" : "LOCAL (in-memory)");
    }

    @Override
    public void destroy() {
        localBuckets.clear();
        log.info("[RateLimit] Filter destroyed. Buckets cleared.");
    }
}
