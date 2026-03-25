# RateLimitFilter — Multi-Bucket theo Endpoint Group

## `RateLimitFilter.java` — Endpoint-Specific

```java
// src/main/java/.../infrastructure/ratelimit/RateLimitFilter.java

package com.example.bankend_hovan_J2.infrastructure.ratelimit;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter implements Filter {

    // Key: "ip:group", Value: Bucket
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    // --- Config injected ---
    @Value("${rate-limit.group.auth.limit:5}")
    private int authLimit;

    @Value("${rate-limit.group.auth.window-seconds:60}")
    private int authWindow;

    @Value("${rate-limit.group.read.limit:200}")
    private int readLimit;

    @Value("${rate-limit.group.read.window-seconds:60}")
    private int readWindow;

    @Value("${rate-limit.group.write.limit:20}")
    private int writeLimit;

    @Value("${rate-limit.group.write.window-seconds:60}")
    private int writeWindow;

    @Value("${rate-limit.group.default.limit:100}")
    private int defaultLimit;

    @Value("${rate-limit.group.default.window-seconds:60}")
    private int defaultWindow;

    @Value("#{'${rate-limit.whitelist-paths:/api/auth/,/api/upload/,/api/cv/,/uploads/,/api/health,/api/notifications/}'.split(',')}")
    private List<String> whitelistPaths;

    // --- Auth strict paths ---
    private static final List<String> AUTH_STRICT_PATHS = List.of(
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/forgot-password"
    );

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String path = httpRequest.getRequestURI();

        // Skip whitelisted
        if (isWhitelisted(path)) {
            chain.doFilter(request, response);
            return;
        }

        String ip = getClientIP(httpRequest);
        String method = httpRequest.getMethod();

        // Determine group and get bucket
        String group = resolveGroup(path, method);
        String bucketKey = ip + ":" + group;

        Bucket bucket = cache.computeIfAbsent(bucketKey, k -> createBucket(group));

        if (bucket.tryConsume(1)) {
            chain.doFilter(request, response);
        } else {
            int retryAfter = getWindowSeconds(group);
            httpResponse.setStatus(429);
            httpResponse.setContentType("application/json");
            httpResponse.setCharacterEncoding("UTF-8");
            httpResponse.setHeader("Retry-After", String.valueOf(retryAfter));
            httpResponse.getWriter().write(
                "{\"error\":\"Too many requests. Please try again later.\"," +
                "\"group\":\"" + group + "\"," +
                "\"retryAfter\":" + retryAfter + "}"
            );
        }
    }

    private String resolveGroup(String path, String method) {
        // Auth endpoints
        if (path.startsWith("/api/auth/")) {
            if (AUTH_STRICT_PATHS.stream().anyMatch(path::equals)) {
                return "auth-strict";   // 5 req/min — login, register
            }
            return "auth";              // 10 req/min — other auth
        }

        // Read-only GET on jobs, companies, blogs, domains
        if ("GET".equalsIgnoreCase(method)) {
            if (path.startsWith("/api/jobs") ||
                path.startsWith("/api/companies") ||
                path.startsWith("/api/blog") ||
                path.startsWith("/api/domains")) {
                return "read";
            }
        }

        // Write operations (POST/PUT/PATCH/DELETE non-auth)
        if ("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method) ||
            "PATCH".equalsIgnoreCase(method) || "DELETE".equalsIgnoreCase(method)) {
            if (!path.startsWith("/api/auth/")) {
                return "write";
            }
        }

        return "default";
    }

    private Bucket createBucket(String group) {
        int limit;
        int window;

        switch (group) {
            case "auth-strict" -> { limit = authLimit;      window = authWindow; }
            case "auth"        -> { limit = 10;              window = authWindow; }
            case "read"        -> { limit = readLimit;      window = readWindow; }
            case "write"       -> { limit = writeLimit;     window = writeWindow; }
            default            -> { limit = defaultLimit;   window = defaultWindow; }
        }

        Bandwidth bandwidth = Bandwidth.classic(
            limit,
            Refill.intervally(limit, Duration.ofSeconds(window))
        );
        return Bucket.builder().addLimit(bandwidth).build();
    }

    private int getWindowSeconds(String group) {
        return switch (group) {
            case "auth-strict" -> authLimit;
            case "auth"        -> authWindow;
            case "read"        -> readWindow;
            case "write"       -> writeWindow;
            default            -> defaultWindow;
        };
    }

    private boolean isWhitelisted(String path) {
        return whitelistPaths.stream().anyMatch(path::startsWith);
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {}

    @Override
    public void destroy() {
        cache.clear();
    }
}
```

## Tóm tắt limits

| Group | Ví dụ endpoint | Limit/Window | Mục đích |
|-------|----------------|-------------|-----------|
| `auth-strict` | `/api/auth/login`, `/api/auth/register` | **5 req/min** | Chống brute-force |
| `auth` | `/api/auth/**` (khác) | 10 req/min | Auth helpers |
| `read` | `GET /api/jobs/**`, `GET /api/companies/**` | 200 req/min | Browse thoải mái |
| `write` | `POST /api/applications`, `POST /api/jobs` | 20 req/min | Ngăn spam |
| `default` | Các endpoint còn lại | 100 req/min | Fallback |
