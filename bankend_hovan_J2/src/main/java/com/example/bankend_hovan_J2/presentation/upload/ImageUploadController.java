package com.example.bankend_hovan_J2.presentation.upload;

import com.example.bankend_hovan_J2.infrastructure.service.ImageUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class ImageUploadController {

    private final ImageUploadService imageUploadService;

    @PostMapping("/image")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }

            // Check file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("error", "File must be an image"));
            }

            // Check file size (max 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "File size must be less than 5MB"));
            }

            // Upload image
            String imageUrl = imageUploadService.uploadImage(file);

            Map<String, String> response = new HashMap<>();
            response.put("url", imageUrl);
            response.put("message", "Image uploaded successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to upload image: " + e.getMessage()));
        }
    }
}
