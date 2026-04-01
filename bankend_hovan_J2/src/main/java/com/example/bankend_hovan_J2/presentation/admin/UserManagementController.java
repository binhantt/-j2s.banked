package com.example.bankend_hovan_J2.presentation.admin;

import com.example.bankend_hovan_J2.domain.user.entity.User;
import com.example.bankend_hovan_J2.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(originPatterns = "*")
@RequiredArgsConstructor
public class UserManagementController {

    private final UserRepository userRepository;
    private final com.example.bankend_hovan_J2.infrastructure.persistence.user.UserJpaRepository userJpaRepository;
    private final com.example.bankend_hovan_J2.infrastructure.security.AesGcmCryptoService aesGcmCryptoService;

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createBackendUser(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String name = request.get("name");
            String password = request.get("password");
            String userType = request.get("userType"); // admin, super_admin, moderator, support

            // Check if email already exists
            if (userJpaRepository.findByEmail(email).isPresent()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Email đã tồn tại");
                return ResponseEntity.status(400).body(error);
            }

            // Create new user
            com.example.bankend_hovan_J2.infrastructure.persistence.user.UserEntityJpa newUser =
                new com.example.bankend_hovan_J2.infrastructure.persistence.user.UserEntityJpa();
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setProvider("local");
            newUser.setProviderId(email);
            newUser.setUserType(userType);
            newUser.setIsActive(true);
            newUser.setCreatedAt(java.time.LocalDateTime.now());
            newUser.setUpdatedAt(java.time.LocalDateTime.now());

            // Encrypt password
            if (password != null && !password.isBlank()) {
                newUser.setEncryptedPassword(aesGcmCryptoService.encrypt(password));
            }

            userJpaRepository.save(newUser);

            return ResponseEntity.ok(convertToResponse(newUser));
        } catch (Exception e) {
            log.error("Error creating backend user", e);
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Không thể tạo tài khoản");
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String userType,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
            Pageable pageable = PageRequest.of(page, size, sort);

            Page<com.example.bankend_hovan_J2.infrastructure.persistence.user.UserEntityJpa> userPage;
            if (userType != null && !userType.isBlank()) {
                userPage = userJpaRepository.findByUserType(userType, pageable);
            } else {
                userPage = userJpaRepository.findAll(pageable);
            }

            List<Map<String, Object>> content = userPage.getContent().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("content", content);
            response.put("totalElements", userPage.getTotalElements());
            response.put("totalPages", userPage.getTotalPages());
            response.put("page", userPage.getNumber());
            response.put("size", userPage.getSize());
            response.put("first", userPage.isFirst());
            response.put("last", userPage.isLast());
            response.put("hasNext", userPage.hasNext());
            response.put("hasPrevious", userPage.hasPrevious());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching users", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable Long id) {
        try {
            return userJpaRepository.findById(id)
                .map(user -> ResponseEntity.ok(convertToResponse(user)))
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching user", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<Map<String, Object>> toggleUserStatus(@PathVariable Long id) {
        try {
            return userJpaRepository.findById(id)
                .map(user -> {
                    // Prevent locking super_admin accounts
                    if ("super_admin".equalsIgnoreCase(user.getUserType())) {
                        Map<String, Object> error = new HashMap<>();
                        error.put("error", "Không thể khóa tài khoản Super Admin");
                        return ResponseEntity.status(400).body(error);
                    }
                    
                    Boolean currentStatus = user.getIsActive();
                    user.setIsActive(currentStatus == null || !currentStatus);
                    userJpaRepository.save(user);
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("id", user.getId());
                    response.put("isActive", user.getIsActive());
                    response.put("message", user.getIsActive() ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản");
                    
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error toggling user status", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}/update-role")
    public ResponseEntity<Map<String, Object>> updateUserRole(
            @PathVariable Long id, 
            @RequestBody Map<String, String> request) {
        try {
            String newRole = request.get("userType");
            
            return userJpaRepository.findById(id)
                .map(user -> {
                    user.setUserType(newRole);
                    user.setUpdatedAt(java.time.LocalDateTime.now());
                    userJpaRepository.save(user);
                    return ResponseEntity.ok(convertToResponse(user));
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error updating user role", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}/update-credentials")
    public ResponseEntity<Map<String, Object>> updateUserCredentials(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            return userJpaRepository.findById(id)
                .map(user -> {
                    String newEmail = request.get("email");
                    String newPassword = request.get("password");
                    
                    if (newEmail != null && !newEmail.equals(user.getEmail())) {
                        // Check if new email already exists
                        if (userJpaRepository.findByEmail(newEmail).isPresent()) {
                            Map<String, Object> error = new HashMap<>();
                            error.put("error", "Email đã tồn tại");
                            return ResponseEntity.status(400).body(error);
                        }
                        user.setEmail(newEmail);
                    }
                    
                    if (newPassword != null && !newPassword.isBlank()) {
                        user.setEncryptedPassword(aesGcmCryptoService.encrypt(newPassword));
                    }
                    
                    user.setUpdatedAt(java.time.LocalDateTime.now());
                    userJpaRepository.save(user);
                    
                    return ResponseEntity.ok(convertToResponse(user));
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error updating user credentials", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<Map<String, Object>> activateUser(@PathVariable Long id) {
        try {
            return userJpaRepository.findById(id)
                .map(user -> {
                    user.setIsActive(true);
                    userJpaRepository.save(user);
                    return ResponseEntity.ok(convertToResponse(user));
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error activating user", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<Map<String, Object>> deactivateUser(@PathVariable Long id) {
        try {
            return userJpaRepository.findById(id)
                .map(user -> {
                    user.setIsActive(false);
                    userJpaRepository.save(user);
                    return ResponseEntity.ok(convertToResponse(user));
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error deactivating user", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private Map<String, Object> convertToResponse(com.example.bankend_hovan_J2.infrastructure.persistence.user.UserEntityJpa user) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("name", user.getName());
        response.put("avatarUrl", user.getAvatarUrl());
        response.put("provider", user.getProvider());
        response.put("userType", user.getUserType());
        response.put("phone", user.getPhone());
        response.put("currentPosition", user.getCurrentPosition());
        response.put("hometown", user.getHometown());
        response.put("currentLocation", user.getCurrentLocation());
        response.put("isActive", user.getIsActive() != null ? user.getIsActive() : true);
        response.put("createdAt", user.getCreatedAt());
        response.put("updatedAt", user.getUpdatedAt());
        return response;
    }
}
