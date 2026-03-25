package com.example.bankend_hovan_J2.infrastructure.connection;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  CONNECTION LIMITER — Giới hạn request đồng thời theo user              ║
 * ║                                                                      ║
 * ║  Redis key: "conn:{userId}"                                          ║
 * ║  INCR → count++                                                        ║
 * ║  count > MAX_CONCURRENT_PER_USER (5) → REJECT (429)                  ║
 * ║  Request xong → DECR                                                   ║
 * ║  Key tự EXPIRE sau TTL_SECONDS (30s) — safety net                     ║
 * ║                                                                      ║
 * ║  Fail-open: Redis lỗi → cho phép request đi qua                       ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
@Service
public class ConnectionLimiterService {

    private static final Logger log = LoggerFactory.getLogger(ConnectionLimiterService.class);

    private final StringRedisTemplate redisTemplate;
    private final boolean redisEnabled;

    private static final int MAX_CONCURRENT_PER_USER = 5;
    private static final int TTL_SECONDS = 30; // Safety net: key tự xóa nếu app crash

    public ConnectionLimiterService(
            StringRedisTemplate redisTemplate,
            @Value("${spring.data.redis.host:localhost}") String redisHost) {
        this.redisTemplate = redisTemplate;
        // Redis được bật khi StringRedisTemplate được inject + host không phải localhost mặc định
        this.redisEnabled = redisTemplate != null && !"localhost".equals(redisHost);
        log.info("[ConnectionLimit] Redis mode: {}", redisEnabled ? "ENABLED" : "DISABLED (allowing all)");
    }

    /**
     * Thử chiếm 1 connection slot cho user.
     *
     * @param userId ID của user
     * @return true = được phép request, false = đã đạt giới hạn đồng thời
     */
    public boolean tryAcquire(Long userId) {
        if (!redisEnabled) {
            return true; // Dev: bỏ qua limit khi Redis không bật
        }

        String key = "conn:" + userId;
        try {
            Long count = redisTemplate.opsForValue().increment(key);

            if (count == null) {
                log.warn("[ConnectionLimit] Redis INCR returned null for userId={}, allowing request", userId);
                return true;
            }

            // Đặt TTL khi đây là request đầu tiên trong chuỗi
            if (count == 1) {
                redisTemplate.expire(key, Duration.ofSeconds(TTL_SECONDS));
            }

            if (count > MAX_CONCURRENT_PER_USER) {
                log.debug("[ConnectionLimit] REJECT userId={} count={} max={}",
                          userId, count, MAX_CONCURRENT_PER_USER);
                redisTemplate.opsForValue().decrement(key);
                return false;
            }

            log.debug("[ConnectionLimit] ALLOW userId={} count={}", userId, count);
            return true;

        } catch (Exception e) {
            log.warn("[ConnectionLimit] Redis error for userId={}: {}, allowing request",
                     userId, e.getMessage());
            return true; // Fail-open: cho qua nếu Redis lỗi
        }
    }

    /**
     * Giải phóng 1 connection slot khi request hoàn thành.
     * Luôn gọi trong finally block.
     *
     * @param userId ID của user
     */
    public void release(Long userId) {
        if (!redisEnabled) return;

        String key = "conn:" + userId;
        try {
            redisTemplate.opsForValue().decrement(key);
            log.debug("[ConnectionLimit] RELEASE userId={}", userId);
        } catch (Exception e) {
            log.warn("[ConnectionLimit] release error for userId={}: {}", userId, e.getMessage());
        }
    }

    /**
     * Lấy số request đang active của user (dùng cho monitoring/debug).
     *
     * @param userId ID của user
     * @return Số request đang đồng thời, hoặc 0 nếu không rõ
     */
    public int getActiveCount(Long userId) {
        if (!redisEnabled) return 0;

        String key = "conn:" + userId;
        try {
            String val = redisTemplate.opsForValue().get(key);
            return val != null ? Integer.parseInt(val) : 0;
        } catch (Exception e) {
            log.warn("[ConnectionLimit] getActiveCount error for userId={}: {}", userId, e.getMessage());
            return 0;
        }
    }

    /**
     * @return Giới hạn đồng thời mỗi user
     */
    public int getMaxConcurrent() {
        return MAX_CONCURRENT_PER_USER;
    }
}
