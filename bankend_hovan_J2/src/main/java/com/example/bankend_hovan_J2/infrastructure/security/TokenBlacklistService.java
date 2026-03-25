package com.example.bankend_hovan_J2.infrastructure.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {

    private final StringRedisTemplate redisTemplate;
    private final boolean redisEnabled;

    // Fallback in-memory blacklist khi Redis không khả dụng
    private final Set<String> inMemoryBlacklist = ConcurrentHashMap.newKeySet();

    public TokenBlacklistService(
            StringRedisTemplate redisTemplate,
            @Value("${spring.data.redis.host:localhost}") String redisHost) {
        this.redisTemplate = redisTemplate;
        // Redis被视为enabled nếu host không phải localhost mặc định
        this.redisEnabled = redisTemplate != null && !"localhost".equals(redisHost);
    }

    /**
     * Thêm JTI vào blacklist với TTL = thời gian còn lại của token.
     */
    public void blacklistToken(String jti, long expiryTimestampSeconds) {
        long ttlSeconds = expiryTimestampSeconds - (System.currentTimeMillis() / 1000);
        if (ttlSeconds <= 0) return; // Token đã hết hạn, không cần blacklist

        if (redisEnabled && redisTemplate != null) {
            redisTemplate.opsForValue().set("blacklist:" + jti, "1", Duration.ofSeconds(ttlSeconds));
        } else {
            inMemoryBlacklist.add(jti);
        }
    }

    public boolean isBlacklisted(String jti) {
        if (redisEnabled && redisTemplate != null) {
            return Boolean.TRUE.equals(redisTemplate.hasKey("blacklist:" + jti));
        } else {
            return inMemoryBlacklist.contains(jti);
        }
    }

    public void removeFromBlacklist(String jti) {
        if (redisEnabled && redisTemplate != null) {
            redisTemplate.delete("blacklist:" + jti);
        } else {
            inMemoryBlacklist.remove(jti);
        }
    }
}
