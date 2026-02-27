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

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.Optional; 

@Slf4j
@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CVFileController {

    private static final String UPLOAD_DIR = "uploads/cv/";
    private final UserCVRepository cvRepository;
    private final com.example.bankend_hovan_J2.domain.application.repository.JobApplicationRepository applicationRepository;
    private final com.example.bankend_hovan_J2.domain.job.repository.JobPostingRepository jobRepository;
    private final ImageUploadService imageUploadService;

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
            @RequestParam(required = false) Long viewerId) {
        try {
            log.info("Serving CV file: {}, viewerId: {}", filename, viewerId);
            
            // Find CV by filename
            String fileUrl = "/uploads/cv/" + filename;
            Optional<UserCV> cvOpt = cvRepository.findByFileUrl(fileUrl);
            
            if (cvOpt.isEmpty()) {
                log.warn("CV record not found for filename: {}", filename);
                // Check if file exists
                Path filePath = Paths.get(UPLOAD_DIR).resolve(filename).normalize();
                if (!Files.exists(filePath)) {
                    return ResponseEntity.notFound().build();
                }
                // File exists but no CV record - deny access for security
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access denied: CV record not found");
            }
            
            UserCV cv = cvOpt.get();
            log.info("Found CV: id={}, userId={}, visibility={}", cv.getId(), cv.getUserId(), cv.getVisibility());
            
            // Check visibility based on who is viewing
            if ("private".equals(cv.getVisibility())) {
                // Private: ONLY owner can view
                // viewerId must equal cv owner
                if (viewerId == null || !viewerId.equals(cv.getUserId())) {
                    log.warn("Access denied: Private CV. viewerId: {}, cvUserId: {}", viewerId, cv.getUserId());
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body("Access denied: This CV is private and only the owner can view it");
                }
                log.info("Access granted: Owner viewing private CV");
            } else if ("application_only".equals(cv.getVisibility())) {
                // Application only: Owner or HR who received application can view
                boolean isOwner = viewerId != null && viewerId.equals(cv.getUserId());
                boolean isHRWithApplication = viewerId != null && !viewerId.equals(cv.getUserId()) 
                        && hasApplicationFromUser(viewerId, cv.getUserId());
                
                if (!isOwner && !isHRWithApplication) {
                    log.warn("Access denied: Application-only CV. viewerId: {}, cvUserId: {}", viewerId, cv.getUserId());
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body("Access denied: This CV is only visible when applying for jobs");
                }
                log.info("Access granted: isOwner={}, isHRWithApplication={}", isOwner, isHRWithApplication);
            }
            // "public" - anyone can view
            
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
}
