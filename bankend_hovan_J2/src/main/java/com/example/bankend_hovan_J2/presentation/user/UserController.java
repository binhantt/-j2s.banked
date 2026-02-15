package com.example.bankend_hovan_J2.presentation.user;

import com.example.bankend_hovan_J2.infrastructure.persistence.user.UserEntityJpa;
import com.example.bankend_hovan_J2.infrastructure.persistence.user.UserJpaRepository;
import com.example.bankend_hovan_J2.infrastructure.service.ImageUploadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserJpaRepository userRepository;
    private final ImageUploadService imageUploadService;

    public UserController(UserJpaRepository userRepository, ImageUploadService imageUploadService) {
        this.userRepository = userRepository;
        this.imageUploadService = imageUploadService;
    }

    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<UserEntityJpa> getUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update user profile
    @PutMapping("/{id}")
    public ResponseEntity<UserEntityJpa> updateUser(
            @PathVariable Long id,
            @RequestBody UserUpdateRequest request) {
        return userRepository.findById(id)
                .map(user -> {
                    if (request.getName() != null) {
                        user.setName(request.getName());
                    }
                    if (request.getAvatarUrl() != null) {
                        user.setAvatarUrl(request.getAvatarUrl());
                    }
                    UserEntityJpa updated = userRepository.save(user);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Upload avatar
    @PostMapping("/{id}/avatar")
    public ResponseEntity<?> uploadAvatar(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            System.out.println("=== Upload Avatar Request ===");
            System.out.println("User ID: " + id);
            System.out.println("File: " + file.getOriginalFilename());
            System.out.println("Size: " + file.getSize());

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

            // Check file size (max 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "File size must be less than 5MB"));
            }

            // Upload to Google Drive
            String imageUrl = imageUploadService.uploadImage(file, "avatars");
            System.out.println("Uploaded avatar URL: " + imageUrl);

            // Update user avatar
            return userRepository.findById(id)
                    .map(user -> {
                        user.setAvatarUrl(imageUrl);
                        userRepository.save(user);
                        System.out.println("=== Avatar updated successfully ===");
                        return ResponseEntity.ok(Map.of(
                                "avatarUrl", imageUrl,
                                "message", "Avatar updated successfully"
                        ));
                    })
                    .orElse(ResponseEntity.notFound().build());

        } catch (Exception e) {
            System.out.println("ERROR uploading avatar: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to upload avatar: " + e.getMessage()));
        }
    }

    // Delete avatar
    @DeleteMapping("/{id}/avatar")
    public ResponseEntity<?> deleteAvatar(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setAvatarUrl(null);
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of("message", "Avatar deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

class UserUpdateRequest {
    private String name;
    private String avatarUrl;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
}
