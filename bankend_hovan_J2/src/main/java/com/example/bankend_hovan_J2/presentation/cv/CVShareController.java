package com.example.bankend_hovan_J2.presentation.cv;

import com.example.bankend_hovan_J2.domain.cv.entity.UserCV;
import com.example.bankend_hovan_J2.domain.cv.repository.UserCVRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/cv")
@CrossOrigin(originPatterns = "*")
@RequiredArgsConstructor
public class CVShareController {
    
    private final UserCVRepository cvRepository;
    private final com.example.bankend_hovan_J2.infrastructure.security.CVAccessTokenService tokenService;
    private final com.example.bankend_hovan_J2.domain.application.repository.JobApplicationRepository applicationRepository;
    private final com.example.bankend_hovan_J2.domain.job.repository.JobPostingRepository jobRepository;
    
    // Generate share link for public CVs only
    @PostMapping("/generate-share-link")
    public ResponseEntity<?> generateShareLink(HttpServletRequest servletRequest, @RequestBody Map<String, Object> request) {
        try {
            log.info("=== Generate Share Link Request ===");
            log.info("Request body: {}", request);
            
            Long cvId = Long.valueOf(request.get("cvId").toString());
            Long userId = Long.valueOf(request.get("userId").toString());
            
            log.info("Generating share link for CV: {}, user: {}", cvId, userId);
            
            Optional<UserCV> cvOpt = cvRepository.findById(cvId);
            if (cvOpt.isEmpty()) {
                log.warn("CV not found: {}", cvId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "CV not found"));
            }
            
            UserCV cv = cvOpt.get();
            log.info("Found CV: id={}, userId={}, visibility={}", cv.getId(), cv.getUserId(), cv.getVisibility());
            
            // Chỉ chủ sở hữu mới có thể tạo share link
            if (!cv.getUserId().equals(userId)) {
                log.warn("Access denied: userId {} is not owner of CV {}", userId, cvId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only CV owner can generate share links"));
            }
            
            // Chỉ CV công khai mới có thể chia sẻ
            if (!"public".equals(cv.getVisibility())) {
                log.warn("CV is not public: visibility={}", cv.getVisibility());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only public CVs can be shared. Please change CV visibility to public first."));
            }
            
            // Tạo share URL
            String filename = cv.getFileUrl().substring(cv.getFileUrl().lastIndexOf('/') + 1);
            String shareUrl = String.format("/uploads/cv/%s?allowShare=true", filename);
            String fullUrl = buildFullUrl(servletRequest, shareUrl);
            
            log.info("Share link generated successfully: {}", fullUrl);
            
            return ResponseEntity.ok(Map.of(
                "shareUrl", shareUrl,
                "fullUrl", fullUrl,
                "message", "Share link generated successfully"
            ));
            
        } catch (Exception e) {
            log.error("Error generating share link: ", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to generate share link: " + e.getMessage()));
        }
    }
    
    // Generate access token for private CV viewing
    @PostMapping("/generate-access-token")
    public ResponseEntity<?> generateAccessToken(@RequestBody Map<String, Object> request) {
        try {
            log.info("=== Generate Access Token Request ===");
            log.info("Request body: {}", request);
            
            Long cvId = Long.valueOf(request.get("cvId").toString());
            Long userId = Long.valueOf(request.get("userId").toString());
            
            log.info("Generating access token for CV: {}, user: {}", cvId, userId);
            
            Optional<UserCV> cvOpt = cvRepository.findById(cvId);
            if (cvOpt.isEmpty()) {
                log.warn("CV not found: {}", cvId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "CV not found"));
            }
            
            UserCV cv = cvOpt.get();
            log.info("Found CV: id={}, userId={}, visibility={}", cv.getId(), cv.getUserId(), cv.getVisibility());
            
            // Verify CV belongs to user
            if (!cv.getUserId().equals(userId)) {
                log.warn("CV ownership mismatch: CV {} does not belong to user {}", cvId, userId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "CV does not belong to specified user"));
            }
            
            // Generate access token
            String token = tokenService.generateToken(cvId, userId);
            
            log.info("Access token generated successfully for CV {}", cvId);
            
            return ResponseEntity.ok(Map.of(
                "token", token,
                "expiresIn", 30, // 30 seconds
                "message", "Access token generated successfully"
            ));
            
        } catch (Exception e) {
            log.error("Error generating access token: ", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to generate access token: " + e.getMessage()));
        }
    }
    
    // Generate access token for CV owner
    @PostMapping("/generate-owner-token")
    public ResponseEntity<?> generateOwnerToken(HttpServletRequest servletRequest, @RequestBody Map<String, Object> request) {
        try {
            log.info("=== Generate Owner Token Request ===");
            log.info("Request body: {}", request);
            
            Long cvId = Long.valueOf(request.get("cvId").toString());
            Long userId = Long.valueOf(request.get("userId").toString());
            
            log.info("Generating owner token for CV: {}, user: {}", cvId, userId);
            
            Optional<UserCV> cvOpt = cvRepository.findById(cvId);
            if (cvOpt.isEmpty()) {
                log.warn("CV not found: {}", cvId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "CV not found"));
            }
            
            UserCV cv = cvOpt.get();
            log.info("Found CV: id={}, userId={}, visibility={}", cv.getId(), cv.getUserId(), cv.getVisibility());
            
            // Verify CV belongs to user
            if (!cv.getUserId().equals(userId)) {
                log.warn("CV ownership mismatch: CV {} does not belong to user {}", cvId, userId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "CV does not belong to specified user"));
            }
            
            // Generate owner token
            String token = tokenService.generateToken(cvId, userId);
            
            // Generate secure URL with token
            String filename = cv.getFileUrl().substring(cv.getFileUrl().lastIndexOf('/') + 1);
            String secureUrl = String.format("/uploads/cv/%s?viewerId=%d&embed=true&token=%s", 
                    filename, userId, token);
            String fullUrl = buildFullUrl(servletRequest, secureUrl);
            
            log.info("Owner token generated successfully for CV {}", cvId);
            
            return ResponseEntity.ok(Map.of(
                "token", token,
                "secureUrl", secureUrl,
                "fullUrl", fullUrl,
                "expiresIn", 300, // 5 minutes
                "message", "Owner access token generated successfully"
            ));
            
        } catch (Exception e) {
            log.error("Error generating owner token: ", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to generate owner token: " + e.getMessage()));
        }
    }
    
    // Generate HR access token for viewing candidate CVs
    @PostMapping("/generate-hr-token")
    public ResponseEntity<?> generateHRAccessToken(HttpServletRequest servletRequest, @RequestBody Map<String, Object> request) {
        try {
            log.info("=== Generate HR Access Token Request ===");
            log.info("Request body: {}", request);
            
            Long cvId = Long.valueOf(request.get("cvId").toString());
            Long hrId = Long.valueOf(request.get("hrId").toString());
            Long candidateUserId = Long.valueOf(request.get("candidateUserId").toString());
            
            log.info("Generating HR access token for CV: {}, HR: {}, candidate: {}", cvId, hrId, candidateUserId);
            
            Optional<UserCV> cvOpt = cvRepository.findById(cvId);
            if (cvOpt.isEmpty()) {
                log.warn("CV not found: {}", cvId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "CV not found"));
            }
            
            UserCV cv = cvOpt.get();
            log.info("Found CV: id={}, userId={}, visibility={}, fileUrl={}", 
                    cv.getId(), cv.getUserId(), cv.getVisibility(), cv.getFileUrl());
            
            // Verify CV belongs to candidate
            if (!cv.getUserId().equals(candidateUserId)) {
                log.warn("CV ownership mismatch: CV {} does not belong to candidate {}", cvId, candidateUserId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "CV does not belong to specified candidate"));
            }
            
            // Check if CV allows HR access (application_only or public)
            if ("private".equals(cv.getVisibility())) {
                log.warn("HR cannot access private CV: {}", cvId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "HR cannot access private CVs"));
            }
            
            // For application_only CVs, verify HR has received application from candidate
            if ("application_only".equals(cv.getVisibility())) {
                if (!hasApplicationFromUser(hrId, candidateUserId)) {
                    log.warn("HR {} has not received application from candidate {}", hrId, candidateUserId);
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "HR can only access CVs from candidates who applied to their jobs"));
                }
            }
            
            // Generate HR token
            String token = tokenService.generateHRToken(cvId, hrId, candidateUserId);
            
            // Generate secure URL with token
            String filename = cv.getFileUrl().substring(cv.getFileUrl().lastIndexOf('/') + 1);
            String secureUrl = String.format("/uploads/cv/%s?viewerId=%d&embed=true&token=%s", 
                    filename, hrId, token);
            String fullUrl = buildFullUrl(servletRequest, secureUrl);
            
            log.info("HR access token generated successfully for CV {}. Full URL: {}", cvId, fullUrl);
            
            return ResponseEntity.ok(Map.of(
                "token", token,
                "secureUrl", secureUrl,
                "fullUrl", fullUrl,
                "expiresIn", 1800, // 30 minutes
                "message", "HR access token generated successfully"
            ));
            
        } catch (Exception e) {
            log.error("Error generating HR access token: ", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to generate HR access token: " + e.getMessage()));
        }
    }
    
    // Generate embed token for secure viewing within application
    @PostMapping("/generate-embed-token")
    public ResponseEntity<?> generateEmbedToken(@RequestBody Map<String, Object> request) {
        try {
            log.info("=== Generate Embed Token Request ===");
            log.info("Request body: {}", request);
            
            Long cvId = Long.valueOf(request.get("cvId").toString());
            Long viewerId = Long.valueOf(request.get("viewerId").toString());
            String accessType = request.getOrDefault("accessType", "OWNER").toString();
            
            log.info("Generating embed token for CV: {}, viewer: {}, type: {}", cvId, viewerId, accessType);
            
            Optional<UserCV> cvOpt = cvRepository.findById(cvId);
            if (cvOpt.isEmpty()) {
                log.warn("CV not found: {}", cvId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "CV not found"));
            }
            
            UserCV cv = cvOpt.get();
            
            // Validate access based on type
            if ("OWNER".equals(accessType)) {
                if (!cv.getUserId().equals(viewerId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "Only CV owner can generate owner embed tokens"));
                }
            } else if ("HR".equals(accessType)) {
                if ("private".equals(cv.getVisibility())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "HR cannot access private CVs"));
                }
                if ("application_only".equals(cv.getVisibility()) && !hasApplicationFromUser(viewerId, cv.getUserId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "HR can only access CVs from candidates who applied"));
                }
            }
            
            String token = tokenService.generateEmbedToken(cvId, viewerId, accessType);
            
            String filename = cv.getFileUrl().substring(cv.getFileUrl().lastIndexOf('/') + 1);
            String embedUrl = String.format("/uploads/cv/%s?viewerId=%d&embed=true&token=%s", 
                    filename, viewerId, token);
            
            return ResponseEntity.ok(Map.of(
                "token", token,
                "embedUrl", embedUrl,
                "expiresIn", "HR".equals(accessType) ? 1800 : 300,
                "message", "Embed token generated successfully"
            ));
            
        } catch (Exception e) {
            log.error("Error generating embed token: ", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to generate embed token: " + e.getMessage()));
        }
    }
    
    private boolean hasApplicationFromUser(Long hrId, Long candidateUserId) {
        try {
            // Check if candidate has applied to ANY job posted by this HR
            var applications = applicationRepository.findByUserId(candidateUserId);
            
            if (applications.isEmpty()) {
                return false;
            }
            
            // For each application, check if the job belongs to this HR
            for (var app : applications) {
                try {
                    // Get job posting to check owner
                    var jobOpt = jobRepository.findById(app.getJobPostingId());
                    if (jobOpt.isPresent() && jobOpt.get().getUserId().equals(hrId)) {
                        log.info("Access granted: Candidate {} applied to job {} owned by HR {}", 
                                candidateUserId, app.getJobPostingId(), hrId);
                        return true;
                    }
                } catch (Exception e) {
                    log.error("Error checking job ownership", e);
                }
            }
            
            log.warn("Access denied: Candidate {} has not applied to any job owned by HR {}", 
                    candidateUserId, hrId);
            return false;
        } catch (Exception e) {
            log.error("Error checking applications", e);
            return false;
        }
    }

    private String buildFullUrl(HttpServletRequest request, String path) {
        String scheme = request.getScheme();
        String host = request.getServerName();
        int port = request.getServerPort();

        boolean standardPort = ("http".equalsIgnoreCase(scheme) && port == 80)
                || ("https".equalsIgnoreCase(scheme) && port == 443);

        String baseUrl = standardPort
                ? scheme + "://" + host
                : scheme + "://" + host + ":" + port;

        return baseUrl + path;
    }
    
    // Invalidate token when user changes tab (called by frontend)
    @PostMapping("/invalidate-token")
    public ResponseEntity<?> invalidateToken(@RequestBody Map<String, Object> request) {
        try {
            log.info("=== Invalidate Token Request ===");
            log.info("Request body: {}", request);
            
            String token = (String) request.get("token");
            Long cvId = request.get("cvId") != null ? Long.valueOf(request.get("cvId").toString()) : null;
            Long userId = request.get("userId") != null ? Long.valueOf(request.get("userId").toString()) : null;
            
            if (token != null && !token.trim().isEmpty()) {
                // Invalidate specific token
                tokenService.invalidateToken(token);
                log.info("Token invalidated: {}", token.substring(0, Math.min(10, token.length())) + "...");
            } else if (cvId != null && userId != null) {
                // Invalidate by CV ID and user ID
                tokenService.invalidateTokenByCvId(cvId, userId);
                log.info("Tokens invalidated for CV {} and user {}", cvId, userId);
            } else if (userId != null) {
                // Invalidate all tokens for user
                tokenService.invalidateAllTokensForUser(userId);
                log.info("All tokens invalidated for user {}", userId);
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Token, cvId+userId, or userId is required"));
            }
            
            return ResponseEntity.ok(Map.of(
                "message", "Token(s) invalidated successfully",
                "timestamp", System.currentTimeMillis()
            ));
            
        } catch (Exception e) {
            log.error("Error invalidating token: ", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to invalidate token: " + e.getMessage()));
        }
    }
    
    // Check token status
    @PostMapping("/check-token")
    public ResponseEntity<?> checkToken(@RequestBody Map<String, Object> request) {
        try {
            String token = (String) request.get("token");
            Long cvId = Long.valueOf(request.get("cvId").toString());
            Long userId = Long.valueOf(request.get("userId").toString());
            
            if (token == null || token.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Token is required"));
            }
            
            var tokenInfo = tokenService.getTokenInfo(token);
            boolean isValid = tokenInfo != null && !tokenInfo.isExpired() && !tokenInfo.isUsed();
            
            return ResponseEntity.ok(Map.of(
                "valid", isValid,
                "expired", tokenInfo != null ? tokenInfo.isExpired() : true,
                "used", tokenInfo != null ? tokenInfo.isUsed() : true,
                "message", isValid ? "Token is valid" : "Token is invalid, expired, or used"
            ));
            
        } catch (Exception e) {
            log.error("Error checking token: ", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to check token: " + e.getMessage()));
        }
    }
    
    // Test endpoint
    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok(Map.of(
            "message", "CV Share Controller is working",
            "timestamp", System.currentTimeMillis()
        ));
    }
    
    // Debug endpoint to list all CVs
    @GetMapping("/debug/list-cvs")
    public ResponseEntity<?> listAllCVs() {
        try {
            // Since we don't have findAll(), let's try to get CVs from common user IDs
            List<Map<String, Object>> allCVs = new ArrayList<>();
            
            // Try users 1-10
            for (Long userId = 1L; userId <= 10L; userId++) {
                try {
                    List<UserCV> userCVs = cvRepository.findByUserId(userId);
                    for (UserCV cv : userCVs) {
                        allCVs.add(Map.of(
                            "id", cv.getId(),
                            "userId", cv.getUserId(),
                            "title", cv.getTitle(),
                            "fileName", cv.getFileName(),
                            "fileUrl", cv.getFileUrl(),
                            "visibility", cv.getVisibility(),
                            "isDefault", cv.getIsDefault()
                        ));
                    }
                } catch (Exception e) {
                    // User might not exist, continue
                }
            }
            
            return ResponseEntity.ok(Map.of(
                "total", allCVs.size(),
                "cvs", allCVs
            ));
        } catch (Exception e) {
            log.error("Error listing CVs: ", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to list CVs: " + e.getMessage()));
        }
    }
    
    // Debug endpoint to create test CV
    @PostMapping("/debug/create-test-cv")
    public ResponseEntity<?> createTestCV(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.getOrDefault("userId", 1).toString());
            String visibility = request.getOrDefault("visibility", "application_only").toString();
            
            // Create a test CV entry (assuming you have UserCV entity)
            // This is just for testing - in real app, CV should be uploaded properly
            
            return ResponseEntity.ok(Map.of(
                "message", "Test CV creation endpoint - implement based on your UserCV entity",
                "userId", userId,
                "visibility", visibility
            ));
        } catch (Exception e) {
            log.error("Error creating test CV: ", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to create test CV: " + e.getMessage()));
        }
    }
}