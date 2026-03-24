package com.example.bankend_hovan_J2.presentation.upload;

import com.example.bankend_hovan_J2.domain.cv.entity.UserCV;
import com.example.bankend_hovan_J2.domain.cv.repository.UserCVRepository;
import com.example.bankend_hovan_J2.infrastructure.service.ImageUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.Optional; 

@Slf4j
@RestController
@CrossOrigin(originPatterns = "*")
@RequiredArgsConstructor
public class CVFileController {

    private static final String UPLOAD_DIR = "uploads/cv/";
    private final UserCVRepository cvRepository;
    private final com.example.bankend_hovan_J2.domain.application.repository.JobApplicationRepository applicationRepository;
    private final com.example.bankend_hovan_J2.domain.job.repository.JobPostingRepository jobRepository;
    private final ImageUploadService imageUploadService;
    private final com.example.bankend_hovan_J2.infrastructure.security.CVAccessTokenService tokenService;
    private final com.example.bankend_hovan_J2.infrastructure.security.JwtProvider jwtProvider;

    // Upload image endpoint
    @PostMapping("/api/upload/image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            log.info("=== Upload Image Request ===");
            log.info("File: {}, Size: {}", file.getOriginalFilename(), file.getSize());

            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "File is empty"));
            }

            // Check file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "File must be an image"));
            }

            // Upload image
            String imageUrl = imageUploadService.uploadImage(file);
            log.info("Image uploaded successfully: {}", imageUrl);

            return ResponseEntity.ok(Map.of("url", imageUrl));
        } catch (Exception e) {
            log.error("Error uploading image: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to upload image: " + e.getMessage()));
        }
    }

    @GetMapping("/uploads/cv/{filename:.+}")
    public ResponseEntity<?> serveFile(
            @PathVariable String filename,
            @RequestParam(required = false) Long viewerId,
            @RequestParam(required = false, defaultValue = "false") boolean embed,
            @RequestParam(required = false, defaultValue = "false") boolean allowShare,
            @RequestParam(required = false) String token,
            @RequestParam(required = false, name = "auth_token") String authTokenParam,
            HttpServletRequest request) {
        try {
            log.info("=== CV File Access Request ===");
            log.info("Filename: {}, viewerId: {}, embed: {}, allowShare: {}, token: {}", 
                    filename, viewerId, embed, allowShare, token != null ? token.substring(0, Math.min(10, token.length())) + "..." : "null");
            
            // Extract Auth Token
            String authToken = authTokenParam;
            if (authToken == null || authToken.isEmpty()) {
                String authHeader = request.getHeader("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    authToken = authHeader.substring(7);
                }
            }

            Long authenticatedUserId = null;
            if (authToken != null && !authToken.isEmpty()) {
                try {
                    if (jwtProvider.validateToken(authToken)) {
                        authenticatedUserId = jwtProvider.getUserIdFromToken(authToken);
                        log.info("SECURITY: Authenticated user ID {} extracted from token", authenticatedUserId);
                    }
                } catch (Exception e) {
                    log.warn("SECURITY: Error validating JWT: {}", e.getMessage());
                }
            }
            
            // Find CV by filename
            String fileUrl = "/uploads/cv/" + filename;
            Optional<UserCV> cvOpt = cvRepository.findByFileUrl(fileUrl);
            
            if (cvOpt.isEmpty()) {
                log.warn("SECURITY: CV record not found for filename: {}", filename);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access denied: CV record not found");
            }
            
            UserCV cv = cvOpt.get();
            log.info("Found CV: id={}, userId={}, visibility={}", cv.getId(), cv.getUserId(), cv.getVisibility());
            String visibility = cv.getVisibility();

            // Allow public access without viewing parameters
            if ("public".equals(visibility) && allowShare && (viewerId == null && token == null)) {
                log.info("SECURITY: Public CV access granted for share link");
                Path filePath = Paths.get(UPLOAD_DIR).resolve(filename).normalize();
                return serveFileResource(filePath);
            }

            // Require viewerId for all other access
            if (viewerId == null) {
                log.warn("SECURITY: Access denied - viewerId is required");
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access denied: Authentication required");
            }
            
            // Kiểm tra Referer để chặn copy paste
            String referer = request.getHeader("Referer");
            boolean isDirectAccess = (referer == null || referer.trim().isEmpty());
            boolean isValidReferer = referer != null && (referer.contains("localhost:3000") || referer.contains("localhost:8080"));
            
            log.info("SECURITY CHECK: referer={}, isDirectAccess={}", referer, isDirectAccess);
            
            // Kiểm tra xem có phải chủ sở hữu CV không
            boolean isOwner = viewerId.equals(cv.getUserId());
            
            // CHẶN COPY PASTE - cho phép lần đầu, chặn lần 2
            boolean hasValidAccess = false;
            String accessMethod = "";
            
            if (token != null && !token.trim().isEmpty()) {
                // Có token - kiểm tra xem token có hợp lệ không
                boolean tokenValid = false;
                
                if (isOwner) {
                    tokenValid = tokenService.validateToken(token, cv.getId(), viewerId);
                    if (tokenValid) {
                        hasValidAccess = true;
                        accessMethod = "Valid owner token (first use)";
                    }
                } else {
                    tokenValid = tokenService.validateHRToken(token, cv.getId(), viewerId, cv.getUserId());
                    if (tokenValid) {
                        hasValidAccess = true;
                        accessMethod = "Valid HR token (first use)";
                    }
                }
                
                if (!tokenValid) {
                    log.warn("SECURITY: Token invalid, expired, or already used");
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body("Access denied: Token has been used or expired. Please generate a new token from the application.");
                }
            } else if (isValidReferer && authenticatedUserId != null && authenticatedUserId.equals(viewerId)) {
                // Truy cập từ ứng dụng với JWT (không có token)
                hasValidAccess = true;
                accessMethod = "Valid referer + JWT (app access)";
            } else {
                log.warn("SECURITY: No valid access method - missing token or invalid referer");
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access denied: Please access CV through the application.");
            }
            
            // Kiểm tra visibility permissions
            if (hasValidAccess) {
                if ("private".equals(visibility) && !isOwner) {
                    log.warn("SECURITY: Private CV access denied for non-owner");
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body("Access denied: This CV is private");
                }
                
                if ("application_only".equals(visibility) && !isOwner) {
                    // Tạm thời cho phép HR xem application_only CV
                    log.info("SECURITY: Application-only CV access granted for HR (temporarily allowed)");
                }
            }
            
            if (!hasValidAccess) {
                log.warn("SECURITY: Access denied - no valid access method. referer: {}, hasToken: {}, hasJWT: {}", 
                        referer, token != null, authenticatedUserId != null);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access denied: Invalid or expired token. Please generate a new token from the application.");
            }
            
            log.info("SECURITY: Access granted via: {}", accessMethod);
            
            // Invalidate token if used
            if (token != null && !token.trim().isEmpty()) {
                log.info("SECURITY: Invalidating one-time token");
                tokenService.invalidateToken(token);
            }

            // Serve file
            Path filePath = Paths.get(UPLOAD_DIR).resolve(filename).normalize();
            return serveFileResource(filePath);
                    
        } catch (Exception e) {
            log.error("Error serving file: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    private ResponseEntity<Resource> serveFileResource(Path filePath) throws Exception {
        Resource resource = new UrlResource(filePath.toUri());
        
        if (!resource.exists() || !resource.isReadable()) {
            log.error("File not found or not readable: {}", filePath);
            return ResponseEntity.notFound().build();
        }

        String contentType = Files.probeContentType(filePath);
        if (contentType == null) {
            contentType = "application/pdf";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}