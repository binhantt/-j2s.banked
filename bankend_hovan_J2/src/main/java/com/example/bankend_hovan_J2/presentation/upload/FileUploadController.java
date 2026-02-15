package com.example.bankend_hovan_J2.presentation.upload;

import com.example.bankend_hovan_J2.domain.cv.entity.UserCV;
import com.example.bankend_hovan_J2.domain.cv.repository.UserCVRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class FileUploadController {

    private final UserCVRepository cvRepository;
    private static final String UPLOAD_DIR = "uploads/cv/";
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    @PostMapping(value = "/cv", produces = "application/json", consumes = "multipart/form-data")
    @Transactional
    public ResponseEntity<?> uploadCV(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId,
            @RequestParam(value = "title", required = false) String title) {
        try {
            // Validate
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File trống"));
            }

            if (file.getSize() > MAX_FILE_SIZE) {
                return ResponseEntity.badRequest().body(Map.of("error", "File quá lớn (max 10MB)"));
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.equals("application/pdf")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Chỉ chấp nhận file PDF"));
            }

            // Create folder
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                : ".pdf";
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
    public ResponseEntity<?> viewCV(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR + filename);
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }
            
            byte[] fileContent = Files.readAllBytes(filePath);
            
            return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "inline; filename=\"" + filename + "\"")
                .body(fileContent);
        } catch (IOException e) {
            log.error("Error reading file: ", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Lỗi đọc file: " + e.getMessage()));
        }
    }
}
