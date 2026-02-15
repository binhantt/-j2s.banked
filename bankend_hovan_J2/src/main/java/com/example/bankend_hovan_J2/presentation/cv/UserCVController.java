package com.example.bankend_hovan_J2.presentation.cv;

import com.example.bankend_hovan_J2.domain.cv.entity.UserCV;
import com.example.bankend_hovan_J2.domain.cv.repository.UserCVRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user-cvs")
@RequiredArgsConstructor
public class UserCVController {
    
    private final UserCVRepository cvRepository;
    
    // Create new CV
    @PostMapping
    public ResponseEntity<UserCV> createCV(@RequestBody Map<String, Object> request) {
        UserCV cv = UserCV.builder()
                .userId(getLong(request, "userId"))
                .title(getString(request, "title"))
                .fileUrl(getString(request, "fileUrl"))
                .fileName(getString(request, "fileName"))
                .fileSize(getLong(request, "fileSize"))
                .isDefault(getBoolean(request, "isDefault"))
                .build();
        
        UserCV saved = cvRepository.save(cv);
        
        // If this is set as default, update other CVs
        if (Boolean.TRUE.equals(saved.getIsDefault())) {
            cvRepository.setAsDefault(saved.getUserId(), saved.getId());
        }
        
        return ResponseEntity.ok(saved);
    }
    
    // Get all CVs for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserCV>> getUserCVs(@PathVariable Long userId) {
        List<UserCV> cvs = cvRepository.findByUserId(userId);
        return ResponseEntity.ok(cvs);
    }
    
    // Get default CV for a user
    @GetMapping("/user/{userId}/default")
    public ResponseEntity<UserCV> getDefaultCV(@PathVariable Long userId) {
        return cvRepository.findDefaultByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // Get CV by ID
    @GetMapping("/{id}")
    public ResponseEntity<UserCV> getCV(@PathVariable Long id) {
        return cvRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // Update CV (basic info only, NOT visibility)
    @PutMapping("/{id}")
    public ResponseEntity<UserCV> updateCV(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        return cvRepository.findById(id)
                .map(cv -> {
                    if (request.containsKey("title")) {
                        cv.setTitle(getString(request, "title"));
                    }
                    if (request.containsKey("fileUrl")) {
                        cv.setFileUrl(getString(request, "fileUrl"));
                    }
                    if (request.containsKey("fileName")) {
                        cv.setFileName(getString(request, "fileName"));
                    }
                    if (request.containsKey("fileSize")) {
                        cv.setFileSize(getLong(request, "fileSize"));
                    }
                    // REMOVED: visibility update from here
                    // Use dedicated endpoint /api/user-cvs/{id}/privacy instead
                    UserCV updated = cvRepository.save(cv);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    // Update CV privacy/visibility - ONLY CV OWNER can do this
    // HR cannot change visibility, only view
    @PutMapping("/{id}/privacy")
    public ResponseEntity<?> updatePrivacy(
            @PathVariable Long id, 
            @RequestParam Long userId,
            @RequestParam String visibility) {
        
        // Validate visibility value
        if (!List.of("private", "public", "application_only").contains(visibility)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid visibility. Must be: private, public, or application_only"));
        }
        
        return cvRepository.findById(id)
                .map(cv -> {
                    // Check ownership: ONLY owner can change privacy
                    if (!cv.getUserId().equals(userId)) {
                        return ResponseEntity.status(403)
                                .body(Map.of("error", "Access denied: Only CV owner can change privacy settings"));
                    }
                    
                    cv.setVisibility(visibility);
                    UserCV updated = cvRepository.save(cv);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    // Set CV as default
    @PutMapping("/{id}/set-default")
    public ResponseEntity<Void> setAsDefault(@PathVariable Long id, @RequestParam Long userId) {
        cvRepository.setAsDefault(userId, id);
        return ResponseEntity.ok().build();
    }
    
    // Delete CV
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCV(@PathVariable Long id) {
        cvRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
    
    // Helper methods
    private String getString(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }
    
    private Long getLong(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return null;
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        return Long.valueOf(value.toString());
    }
    
    private Boolean getBoolean(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return false;
        if (value instanceof Boolean) {
            return (Boolean) value;
        }
        return Boolean.valueOf(value.toString());
    }
}
