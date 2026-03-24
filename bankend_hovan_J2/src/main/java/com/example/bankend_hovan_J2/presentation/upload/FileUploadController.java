package com.example.bankend_hovan_J2.presentation.upload;

import com.example.bankend_hovan_J2.domain.cv.entity.UserCV;
import com.example.bankend_hovan_J2.domain.cv.repository.UserCVRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = "http://localhost:3000")
public class FileUploadController {

    private final UserCVRepository cvRepository;
    private final com.example.bankend_hovan_J2.domain.application.repository.JobApplicationRepository applicationRepository;
    private final com.example.bankend_hovan_J2.domain.job.repository.JobPostingRepository jobRepository;
    private static final String UPLOAD_DIR = "uploads/cv/";
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    @PostMapping(value = "/cv", produces = "application/json", consumes = "multipart/form-data")
    @Transactional
    public ResponseEntity<?> uploadCV(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId,
            @RequestParam(value = "title", required = false) String title) {
        try {
            log.info("=== Upload CV Request ===");
            log.info("File name: {}", file.getOriginalFilename());
            log.info("File type: {}", file.getContentType());
            log.info("File size: {} bytes", file.getSize());
            log.info("User ID: {}", userId);
            log.info("Title: {}", title);
            
            // Validate
            if (file.isEmpty()) {
                log.error("File is empty");
                return ResponseEntity.badRequest().body(Map.of("error", "File trống"));
            }

            if (file.getSize() > MAX_FILE_SIZE) {
                log.error("File too large: {} bytes", file.getSize());
                return ResponseEntity.badRequest().body(Map.of("error", "File quá lớn (max 10MB)"));
            }

            String contentType = file.getContentType();
            String originalFilename = file.getOriginalFilename();
            
            log.info("Validating file type...");
            log.info("Content-Type: {}", contentType);
            log.info("Original filename: {}", originalFilename);
            
            // Accept PDF, DOC, and DOCX files
            boolean isValidType = false;
            if (contentType != null) {
                isValidType = contentType.equals("application/pdf") ||
                             contentType.equals("application/msword") ||  // .doc
                             contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document"); // .docx
            }
            
            // Also check by file extension as fallback
            if (!isValidType && originalFilename != null) {
                String lowerFilename = originalFilename.toLowerCase();
                isValidType = lowerFilename.endsWith(".pdf") || 
                             lowerFilename.endsWith(".doc") || 
                             lowerFilename.endsWith(".docx");
                log.info("Validation by extension: {}", isValidType);
            }
            
            if (!isValidType) {
                log.error("Invalid file type. Content-Type: {}, Filename: {}", contentType, originalFilename);
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Chỉ chấp nhận file PDF, DOC, hoặc DOCX",
                    "contentType", contentType != null ? contentType : "null",
                    "filename", originalFilename != null ? originalFilename : "null"
                ));
            }
            
            log.info("File type validation passed");

            // Create folder
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate filename
            String extension = ".pdf"; // default
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;

            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // File URL
            String fileUrl = "/uploads/cv/" + filename;
            
            // Auto-save to database
            log.info("=== Saving CV to database ===");
            log.info("User ID: {}", userId);
            log.info("Title: {}", (title != null ? title : originalFilename));
            log.info("File URL: {}", fileUrl);
            log.info("File Name: {}", originalFilename);
            log.info("File Size: {}", file.getSize());
            
            UserCV cv = UserCV.builder()
                    .userId(userId)
                    .title(title != null ? title : originalFilename)
                    .fileUrl(fileUrl)
                    .fileName(originalFilename)
                    .fileSize(file.getSize())
                    .isDefault(false)
                    .visibility("private") // Mặc định là private
                    .build();
            
            UserCV savedCV = cvRepository.save(cv);
            log.info("=== CV saved successfully with ID: {} ===", savedCV.getId());
            
            if (savedCV.getId() == null) {
                log.error("ERROR: CV ID is null after save!");
                throw new RuntimeException("Failed to save CV to database");
            }

            // Return response
            Map<String, Object> response = new HashMap<>();
            response.put("id", savedCV.getId());
            response.put("url", fileUrl);
            response.put("filename", originalFilename);
            response.put("size", file.getSize());
            response.put("title", savedCV.getTitle());

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            log.error("Error uploading file: ", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Lỗi upload: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Error saving CV to database: ", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Lỗi lưu database: " + e.getMessage()));
        }
    }

    @DeleteMapping("/cv")
    public ResponseEntity<?> deleteCV(@RequestParam("filename") String filename) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR + filename);
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                return ResponseEntity.ok(Map.of("message", "Đã xóa file"));
            }
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Lỗi xóa file: " + e.getMessage()));
        }
    }
    
    @GetMapping("/cv/view/{filename}")
    public ResponseEntity<?> viewCV(
            @PathVariable String filename,
            @RequestParam(required = false) Long viewerId,
            @RequestParam(required = false, defaultValue = "false") boolean embed) {
        try {
            log.info("Viewing CV file: {}, viewerId: {}, embed: {}", filename, viewerId, embed);
            
            // Find CV by filename
            String fileUrl = "/uploads/cv/" + filename;
            Optional<UserCV> cvOpt = cvRepository.findByFileUrl(fileUrl);
            
            if (cvOpt.isEmpty()) {
                log.warn("CV record not found for filename: {}", filename);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access denied: CV record not found");
            }
            
            UserCV cv = cvOpt.get();
            log.info("Found CV: id={}, userId={}, visibility={}", cv.getId(), cv.getUserId(), cv.getVisibility());
            
            // Check visibility based on who is viewing
            if ("private".equals(cv.getVisibility())) {
                // Private CV: Chỉ cho phép chủ nhân xem khi embed=true (trong ứng dụng)
                if (!embed || viewerId == null || !viewerId.equals(cv.getUserId())) {
                    log.warn("Access denied: Private CV. viewerId: {}, cvUserId: {}, embed: {}", 
                            viewerId, cv.getUserId(), embed);
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body("Access denied: Private CV can only be viewed by owner within the application");
                }
                log.info("Access granted: Owner viewing private CV in embed mode");
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
            
            Path filePath = Paths.get(UPLOAD_DIR + filename);
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }
            
            byte[] fileContent = Files.readAllBytes(filePath);
            
            // Determine content type based on file extension
            String contentType = "application/octet-stream"; // default
            String lowerFilename = filename.toLowerCase();
            if (lowerFilename.endsWith(".pdf")) {
                contentType = "application/pdf";
            } else if (lowerFilename.endsWith(".doc")) {
                contentType = "application/msword";
            } else if (lowerFilename.endsWith(".docx")) {
                contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            }
            
            return ResponseEntity.ok()
                .header("Content-Type", contentType)
                .header("Content-Disposition", "inline; filename=\"" + filename + "\"")
                .body(fileContent);
        } catch (IOException e) {
            log.error("Error reading file: ", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Lỗi đọc file: " + e.getMessage()));
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
}
