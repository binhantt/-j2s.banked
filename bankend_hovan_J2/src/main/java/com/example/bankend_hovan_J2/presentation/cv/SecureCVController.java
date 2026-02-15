package com.example.bankend_hovan_J2.presentation.cv;

import com.example.bankend_hovan_J2.application.cv.CVAccessService;
import com.example.bankend_hovan_J2.domain.cv.entity.CVAccessToken;
import com.example.bankend_hovan_J2.domain.cv.entity.UserCV;
import com.example.bankend_hovan_J2.domain.cv.repository.CVAccessTokenRepository;
import com.example.bankend_hovan_J2.domain.cv.repository.UserCVRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/cv")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class SecureCVController {
    
    private static final String UPLOAD_DIR = "uploads/cv/";
    private final CVAccessService accessService;
    private final CVAccessTokenRepository tokenRepository;
    private final UserCVRepository cvRepository;
    
    /**
     * Generate access token for CV viewing
     * POST /api/cv/generate-token
     * Body: { cvId: 1, viewerId: 5 }
     */
    @PostMapping("/generate-token")
    public ResponseEntity<?> generateToken(@RequestBody Map<String, Object> request) {
        try {
            Long cvId = getLong(request, "cvId");
            Long viewerId = getLong(request, "viewerId");
            
            String token = accessService.generateAccessToken(cvId, viewerId);
            
            return ResponseEntity.ok(Map.of(
                "token", token,
                "url", "/api/cv/view/" + token,
                "expiresIn", 600 // 10 minutes in seconds
            ));
        } catch (Exception e) {
            log.error("Error generating token", e);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * View CV with token
     * GET /api/cv/view/{token}
     * No authentication needed - token is the auth
     * Token is ONE-TIME USE - cannot be shared
     */
    @GetMapping("/view/{token}")
    public ResponseEntity<?> viewCV(@PathVariable String token) {
        try {
            log.info("Viewing CV with token: {}", token);
            
            // Verify token (must be valid and not used)
            CVAccessToken accessToken = tokenRepository.findValidToken(token)
                    .orElseThrow(() -> new RuntimeException("Invalid, expired, or already used token"));
            
            // Check if already used
            if (accessToken.isUsed()) {
                log.warn("Token already used: {}", token);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("This link has already been used and cannot be accessed again");
            }
            
            log.info("Token valid: cvId={}, viewerId={}, viewerType={}", 
                    accessToken.getCvId(), accessToken.getViewerId(), accessToken.getViewerType());
            
            // Mark token as used (one-time use)
            tokenRepository.markAsUsed(token);
            log.info("Token marked as used: {}", token);
            
            // Get CV
            UserCV cv = cvRepository.findById(accessToken.getCvId())
                    .orElseThrow(() -> new RuntimeException("CV not found"));
            
            // Extract filename from fileUrl
            String filename = cv.getFileUrl().substring(cv.getFileUrl().lastIndexOf("/") + 1);
            Path filePath = Paths.get(UPLOAD_DIR).resolve(filename).normalize();
            
            // Serve file
            Resource resource = new UrlResource(filePath.toUri());
            
            if (!resource.exists() || !resource.isReadable()) {
                log.error("File not found or not readable: {}", filename);
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
                    
        } catch (Exception e) {
            log.error("Error viewing CV", e);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }
    
    private Long getLong(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return null;
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        return Long.valueOf(value.toString());
    }
}
