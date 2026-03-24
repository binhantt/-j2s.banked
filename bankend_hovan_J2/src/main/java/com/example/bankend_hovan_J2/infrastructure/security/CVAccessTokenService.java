package com.example.bankend_hovan_J2.infrastructure.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class CVAccessTokenService {
    
    private final ConcurrentHashMap<String, TokenInfo> activeTokens = new ConcurrentHashMap<>();
    private static final long TOKEN_VALIDITY_SECONDS = 30; // Giảm xuống 30 giây - rất ngắn
    private static final long HR_TOKEN_VALIDITY_SECONDS = 120; // Giảm xuống 2 phút
    
    public String generateToken(Long cvId, Long userId) {
        try {
            // Tạo timestamp hiện tại
            long currentTime = Instant.now().getEpochSecond();
            String data = cvId + ":" + userId + ":" + currentTime;
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes());
            String token = Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
            
            // Store token with expiry và generation time
            TokenInfo tokenInfo = new TokenInfo(cvId, userId, Instant.now().plusSeconds(TOKEN_VALIDITY_SECONDS));
            tokenInfo.setGenerationTime(Instant.now());
            activeTokens.put(token, tokenInfo);
            
            // Clean expired tokens
            cleanExpiredTokens();
            
            log.info("Generated access token for CV {} and user {} (expires in {} seconds)", 
                    cvId, userId, TOKEN_VALIDITY_SECONDS);
            return token;
        } catch (Exception e) {
            log.error("Error generating token", e);
            throw new RuntimeException("Failed to generate access token");
        }
    }
    
    // Generate HR token for application-only CVs with enhanced security
    public String generateHRToken(Long cvId, Long hrId, Long candidateUserId) {
        try {
            String data = "HR:" + cvId + ":" + hrId + ":" + candidateUserId + ":" + Instant.now().getEpochSecond();
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes());
            String token = Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
            
            // Store HR token with longer expiry and additional metadata
            TokenInfo tokenInfo = new TokenInfo(cvId, hrId, candidateUserId, 
                    Instant.now().plusSeconds(HR_TOKEN_VALIDITY_SECONDS), TokenType.HR_ACCESS);
            activeTokens.put(token, tokenInfo);
            
            // Clean expired tokens
            cleanExpiredTokens();
            
            log.info("Generated HR access token for CV {} (candidate: {}) and HR {} - expires in {} minutes", 
                    cvId, candidateUserId, hrId, HR_TOKEN_VALIDITY_SECONDS / 60);
            return token;
        } catch (Exception e) {
            log.error("Error generating HR token", e);
            throw new RuntimeException("Failed to generate HR access token");
        }
    }
    
    // Generate embed token for secure CV viewing within application
    public String generateEmbedToken(Long cvId, Long viewerId, String accessType) {
        try {
            String data = "EMBED:" + accessType + ":" + cvId + ":" + viewerId + ":" + Instant.now().getEpochSecond();
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes());
            String token = Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
            
            long validity = "HR".equals(accessType) ? HR_TOKEN_VALIDITY_SECONDS : TOKEN_VALIDITY_SECONDS;
            TokenInfo tokenInfo = new TokenInfo(cvId, viewerId, null, 
                    Instant.now().plusSeconds(validity), TokenType.EMBED_ACCESS);
            tokenInfo.setAccessType(accessType);
            activeTokens.put(token, tokenInfo);
            
            cleanExpiredTokens();
            
            log.info("Generated embed token for CV {} and viewer {} (type: {}) - expires in {} minutes", 
                    cvId, viewerId, accessType, validity / 60);
            return token;
        } catch (Exception e) {
            log.error("Error generating embed token", e);
            throw new RuntimeException("Failed to generate embed access token");
        }
    }
    
    public boolean validateToken(String token, Long cvId, Long userId) {
        TokenInfo tokenInfo = activeTokens.get(token);
        
        if (tokenInfo == null) {
            log.warn("Token not found: {}", token);
            return false;
        }
        
        if (tokenInfo.isExpired()) {
            log.warn("Token expired: {}", token);
            activeTokens.remove(token);
            return false;
        }

        // Kiểm tra token đã được sử dụng chưa (one-time use)
        if (tokenInfo.isUsed()) {
            log.warn("Token has already been used: {}", token);
            return false;
        }
        
        // Kiểm tra token có quá cũ không (có thể bị copy paste)
        if (tokenInfo.getGenerationTime() != null) {
            long secondsSinceGeneration = Instant.now().getEpochSecond() - tokenInfo.getGenerationTime().getEpochSecond();
            if (secondsSinceGeneration > 60) { // Nếu token được tạo cách đây hơn 1 phút
                log.warn("Token too old ({}s), possible copy-paste: {}", secondsSinceGeneration, token);
                activeTokens.remove(token);
                return false;
            }
        }
        
        if (!tokenInfo.getCvId().equals(cvId) || !tokenInfo.getUserId().equals(userId)) {
            log.warn("Token validation failed: cvId or userId mismatch. Expected: cvId={}, userId={}, Got: cvId={}, userId={}", 
                    cvId, userId, tokenInfo.getCvId(), tokenInfo.getUserId());
            return false;
        }
        
        // Đánh dấu token đã được sử dụng
        tokenInfo.markAsUsed();
        
        log.info("Token validated and marked as used for CV {} and user {} (type: {})", 
                cvId, userId, tokenInfo.getTokenType());
        return true;
    }
    
    // Enhanced validation for HR tokens with candidate check
    public boolean validateHRToken(String token, Long cvId, Long hrId, Long candidateUserId) {
        TokenInfo tokenInfo = activeTokens.get(token);
        
        if (tokenInfo == null) {
            log.warn("HR token not found: {}", token);
            return false;
        }
        
        if (tokenInfo.isExpired()) {
            log.warn("HR token expired: {}", token);
            activeTokens.remove(token);
            return false;
        }

        if (tokenInfo.isUsed()) {
            log.warn("HR token has already been used: {}", token);
            return false;
        }
        
        if (!tokenInfo.getCvId().equals(cvId) || 
            !tokenInfo.getUserId().equals(hrId) ||
            (tokenInfo.getCandidateUserId() != null && !tokenInfo.getCandidateUserId().equals(candidateUserId))) {
            log.warn("HR token validation failed: cvId, hrId, or candidateUserId mismatch");
            return false;
        }
        
        // Đánh dấu token đã được sử dụng
        tokenInfo.markAsUsed();
        
        log.info("HR token validated and marked as used for CV {} (candidate: {}) and HR {}", 
                cvId, candidateUserId, hrId);
        return true;
    }
    
    // Get token info for additional validation
    public TokenInfo getTokenInfo(String token) {
        TokenInfo tokenInfo = activeTokens.get(token);
        if (tokenInfo != null && tokenInfo.isExpired()) {
            activeTokens.remove(token);
            return null;
        }
        return tokenInfo;
    }
    
    public void invalidateToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            log.warn("Cannot invalidate null or empty token");
            return;
        }
        
        activeTokens.remove(token);
        log.info("Token invalidated: {}", token.substring(0, Math.min(10, token.length())) + "...");
    }
    
    // Invalidate token by CV ID (khi user chuyển tab)
    public void invalidateTokenByCvId(Long cvId, Long userId) {
        activeTokens.entrySet().removeIf(entry -> {
            TokenInfo tokenInfo = entry.getValue();
            boolean shouldRemove = tokenInfo.getCvId().equals(cvId) && tokenInfo.getUserId().equals(userId);
            if (shouldRemove) {
                log.info("Token invalidated for CV {} and user {} due to tab change", cvId, userId);
            }
            return shouldRemove;
        });
    }
    
    // Invalidate all tokens for a user (khi user logout hoặc chuyển tab nhiều)
    public void invalidateAllTokensForUser(Long userId) {
        activeTokens.entrySet().removeIf(entry -> {
            TokenInfo tokenInfo = entry.getValue();
            boolean shouldRemove = tokenInfo.getUserId().equals(userId);
            if (shouldRemove) {
                log.info("Token invalidated for user {} due to session change", userId);
            }
            return shouldRemove;
        });
    }
    
    private void cleanExpiredTokens() {
        activeTokens.entrySet().removeIf(entry -> entry.getValue().isExpired());
    }
    
    // Token types for different access patterns
    public enum TokenType {
        OWNER_ACCESS,
        HR_ACCESS,
        EMBED_ACCESS
    }
    
    public static class TokenInfo {
        private final Long cvId;
        private final Long userId;
        private final Long candidateUserId; // For HR tokens
        private final Instant expiryTime;
        private final TokenType tokenType;
        private String accessType; // OWNER, HR, etc.
        private boolean isUsed; // Track whether one-time token has been used
        private Instant generationTime; // Thời gian tạo token
        
        // Constructor for owner tokens
        public TokenInfo(Long cvId, Long userId, Instant expiryTime) {
            this(cvId, userId, null, expiryTime, TokenType.OWNER_ACCESS);
        }
        
        // Constructor for HR and embed tokens
        public TokenInfo(Long cvId, Long userId, Long candidateUserId, Instant expiryTime, TokenType tokenType) {
            this.cvId = cvId;
            this.userId = userId;
            this.candidateUserId = candidateUserId;
            this.expiryTime = expiryTime;
            this.tokenType = tokenType;
            this.isUsed = false;
            this.generationTime = Instant.now();
        }
        
        public Long getCvId() { return cvId; }
        public Long getUserId() { return userId; }
        public Long getCandidateUserId() { return candidateUserId; }
        public TokenType getTokenType() { return tokenType; }
        public String getAccessType() { return accessType; }
        public void setAccessType(String accessType) { this.accessType = accessType; }
        public boolean isUsed() { return isUsed; }
        public void markAsUsed() { this.isUsed = true; }
        public boolean isExpired() { return Instant.now().isAfter(expiryTime); }
        public Instant getExpiryTime() { return expiryTime; }
        public Instant getGenerationTime() { return generationTime; }
        public void setGenerationTime(Instant generationTime) { this.generationTime = generationTime; }
    }
}