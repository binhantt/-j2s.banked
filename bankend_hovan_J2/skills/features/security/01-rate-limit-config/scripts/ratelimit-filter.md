# RateLimitFilter — Đọc config từ application.yml

## Cập nhật `RateLimitFilter.java`

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

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    @Value("${rate-limit.default-limit:200}")
    private int defaultLimit;

    @Value("${rate-limit.window-seconds:60}")
    private int windowSeconds;

    @Value("#{'${rate-limit.whitelist-paths:/api/auth/,/api/upload/,/api/cv/,/uploads/,/api/health,/api/notifications/}'.split(',')}")
    private List<String> whitelistPaths;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String path = httpRequest.getRequestURI();

        if (isWhitelisted(path)) {
            chain.doFilter(request, response);
            return;
        }

        String key = getClientIP(httpRequest);
        Bucket bucket = resolveBucket(key);

        if (bucket.tryConsume(1)) {
            chain.doFilter(request, response);
        } else {
            httpResponse.setStatus(429);
            httpResponse.setContentType("application/json");
            httpResponse.setCharacterEncoding("UTF-8");
            httpResponse.getWriter().write(
                "{\"error\":\"Too many requests. Please try again later.\",\"retryAfter\":" + windowSeconds + "}"
            );
        }
    }

    private boolean isWhitelisted(String path) {
        return whitelistPaths.stream().anyMatch(path::startsWith);
    }

    private Bucket resolveBucket(String key) {
        return cache.computeIfAbsent(key, k -> createNewBucket());
    }

    private Bucket createNewBucket() {
        Bandwidth limit = Bandwidth.classic(
            defaultLimit,
            Refill.intervally(defaultLimit, Duration.ofSeconds(windowSeconds))
        );
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // Không cần init
    }

    @Override
    public void destroy() {
        cache.clear();
    }
}
```
