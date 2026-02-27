package com.example.bankend_hovan_J2.presentation.user;

import com.example.bankend_hovan_J2.infrastructure.persistence.user.UserEntityJpa;
import com.example.bankend_hovan_J2.infrastructure.persistence.user.UserJpaRepository;
import com.example.bankend_hovan_J2.infrastructure.service.ImageUploadService;
import com.example.bankend_hovan_J2.presentation.user.dto.LocationUpdateRequest;
import com.example.bankend_hovan_J2.presentation.user.dto.LocationResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
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
                    if (request.getCurrentPosition() != null) {
                        user.setCurrentPosition(request.getCurrentPosition());
                    }
                    if (request.getHometown() != null) {
                        user.setHometown(request.getHometown());
                    }
                    if (request.getCurrentLocation() != null) {
                        user.setCurrentLocation(request.getCurrentLocation());
                    }
                    if (request.getPhone() != null) {
                        user.setPhone(request.getPhone());
                    }
                    if (request.getBio() != null) {
                        user.setBio(request.getBio());
                    }
                    if (request.getCvUrl() != null) {
                        user.setCvUrl(request.getCvUrl());
                    }
                    if (request.getCertificateImages() != null) {
                        user.setCertificateImages(request.getCertificateImages());
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
            String imageUrl = imageUploadService.uploadImage(file);
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

    // Update current location with GPS coordinates
    @PostMapping("/{id}/location")
    public ResponseEntity<?> updateLocation(
            @PathVariable Long id,
            @RequestBody LocationUpdateRequest request) {
        try {
            return userRepository.findById(id)
                    .map(user -> {
                        user.setCurrentLatitude(request.getLatitude());
                        user.setCurrentLongitude(request.getLongitude());
                        user.setCurrentLocation(request.getAddress());
                        user.setLocationUpdatedAt(LocalDateTime.now());
                        userRepository.save(user);

                        LocationResponse response = LocationResponse.builder()
                                .latitude(user.getCurrentLatitude())
                                .longitude(user.getCurrentLongitude())
                                .address(user.getCurrentLocation())
                                .updatedAt(user.getLocationUpdatedAt())
                                .build();

                        return ResponseEntity.ok(response);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to update location: " + e.getMessage()));
        }
    }

    // Get current location
    @GetMapping("/{id}/location")
    public ResponseEntity<?> getLocation(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    LocationResponse response = LocationResponse.builder()
                            .latitude(user.getCurrentLatitude())
                            .longitude(user.getCurrentLongitude())
                            .address(user.getCurrentLocation())
                            .updatedAt(user.getLocationUpdatedAt())
                            .build();
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

class UserUpdateRequest {
    private String name;
    private String avatarUrl;
    private String currentPosition;
    private String hometown;
    private String currentLocation;
    private String phone;
    private String bio;
    private String cvUrl;
    private String certificateImages;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    
    public String getCurrentPosition() { return currentPosition; }
    public void setCurrentPosition(String currentPosition) { this.currentPosition = currentPosition; }
    
    public String getHometown() { return hometown; }
    public void setHometown(String hometown) { this.hometown = hometown; }
    
    public String getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(String currentLocation) { this.currentLocation = currentLocation; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    
    public String getCvUrl() { return cvUrl; }
    public void setCvUrl(String cvUrl) { this.cvUrl = cvUrl; }
    
    public String getCertificateImages() { return certificateImages; }
    public void setCertificateImages(String certificateImages) { this.certificateImages = certificateImages; }
}
