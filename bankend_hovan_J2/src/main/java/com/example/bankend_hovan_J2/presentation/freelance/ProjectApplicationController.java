package com.example.bankend_hovan_J2.presentation.freelance;

import com.example.bankend_hovan_J2.domain.freelance.entity.ProjectApplication;
import com.example.bankend_hovan_J2.domain.freelance.repository.ProjectApplicationRepository;
import com.example.bankend_hovan_J2.domain.freelance.repository.FreelanceProjectRepository;
import com.example.bankend_hovan_J2.domain.user.repository.UserRepository;
import com.example.bankend_hovan_J2.presentation.freelance.dto.ApplicantDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/freelance/applications")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ProjectApplicationController {
    private final ProjectApplicationRepository applicationRepository;
    private final FreelanceProjectRepository projectRepository;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<Map<String, Object>> applyToProject(@RequestBody Map<String, Object> request) {
        try {
            Long projectId = getLong(request, "projectId");
            Long freelancerId = getLong(request, "freelancerId");

            // Check if already applied
            var existingApp = applicationRepository.findByProjectIdAndFreelancerId(projectId, freelancerId);
            if (existingApp.isPresent()) {
                var app = existingApp.get();
                
                // If rejected, allow reapply by updating the existing application
                if ("rejected".equals(app.getStatus())) {
                    app.setCoverLetter(getString(request, "coverLetter"));
                    app.setAchievements(getString(request, "achievements"));
                    app.setCvUrl(getString(request, "cvUrl"));
                    app.setProposedPrice(getBigDecimal(request, "proposedPrice"));
                    app.setEstimatedDuration(getInteger(request, "estimatedDuration"));
                    app.setStatus("pending"); // Reset to pending
                    
                    ProjectApplication updated = applicationRepository.save(app);
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", "Ứng tuyển lại thành công!");
                    response.put("application", updated);
                    return ResponseEntity.ok(response);
                } else {
                    // Already applied with pending or accepted status
                    Map<String, Object> error = new HashMap<>();
                    error.put("success", false);
                    error.put("message", "Bạn đã ứng tuyển dự án này rồi");
                    return ResponseEntity.badRequest().body(error);
                }
            }

            // Check if project exists and deposit is paid
            var projectOpt = projectRepository.findById(projectId);
            if (projectOpt.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Dự án không tồn tại");
                return ResponseEntity.badRequest().body(error);
            }

            var project = projectOpt.get();
            if (!"paid".equals(project.getDepositStatus())) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Dự án chưa mở ứng tuyển");
                return ResponseEntity.badRequest().body(error);
            }

            ProjectApplication application = ProjectApplication.builder()
                    .projectId(projectId)
                    .freelancerId(freelancerId)
                    .coverLetter(getString(request, "coverLetter"))
                    .achievements(getString(request, "achievements"))
                    .cvUrl(getString(request, "cvUrl"))
                    .proposedPrice(getBigDecimal(request, "proposedPrice"))
                    .estimatedDuration(getInteger(request, "estimatedDuration"))
                    .status("pending")
                    .build();

            ProjectApplication saved = applicationRepository.save(application);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Ứng tuyển thành công!");
            response.put("application", saved);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error applying to project", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Có lỗi xảy ra: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ProjectApplication>> getApplicationsByProject(@PathVariable Long projectId) {
        List<ProjectApplication> applications = applicationRepository.findByProjectId(projectId);
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/project/{projectId}/applicants")
    public ResponseEntity<?> getApplicantsWithDetails(@PathVariable Long projectId) {
        try {
            // Get all applications for this project
            List<ProjectApplication> applications = applicationRepository.findByProjectId(projectId);
            
            // Map to ApplicantDTO with user details
            List<ApplicantDTO> applicants = applications.stream()
                    .map(app -> {
                        var userOpt = userRepository.findById(app.getFreelancerId());
                        if (userOpt.isEmpty()) return null;
                        
                        var user = userOpt.get();
                        return ApplicantDTO.builder()
                                .applicationId(app.getId())
                                .freelancerId(user.getId())
                                .freelancerName(user.getName())
                                .freelancerEmail(user.getEmail().getValue())
                                .avatarUrl(user.getAvatarUrl())
                                .currentPosition(user.getCurrentPosition())
                                .hometown(user.getHometown())
                                .currentLocation(user.getCurrentLocation())
                                .cvUrl(app.getCvUrl() != null ? app.getCvUrl() : user.getCvUrl()) // Use application CV first, fallback to user CV
                                .certificateImages(user.getCertificateImages())
                                .phone(user.getPhone())
                                .bio(user.getBio())
                                .status(app.getStatus())
                                .coverLetter(app.getCoverLetter())
                                .achievements(app.getAchievements())
                                .proposedPrice(app.getProposedPrice())
                                .estimatedDuration(app.getEstimatedDuration())
                                .appliedAt(app.getCreatedAt())
                                .build();
                    })
                    .filter(dto -> dto != null)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(applicants);
        } catch (Exception e) {
            log.error("Error getting applicants", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Có lỗi xảy ra: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{applicationId}/status")
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable Long applicationId,
            @RequestBody Map<String, Object> request) {
        try {
            String status = getString(request, "status");
            
            var appOpt = applicationRepository.findById(applicationId);
            if (appOpt.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Đơn ứng tuyển không tồn tại");
                return ResponseEntity.badRequest().body(error);
            }
            
            var application = appOpt.get();
            application.setStatus(status);
            applicationRepository.save(application);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cập nhật trạng thái thành công");
            response.put("application", application);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating application status", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Có lỗi xảy ra: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/project/{projectId}/count")
    public ResponseEntity<Map<String, Object>> getApplicationCount(@PathVariable Long projectId) {
        long count = applicationRepository.countByProjectId(projectId);
        Map<String, Object> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/freelancer/{freelancerId}")
    public ResponseEntity<List<ProjectApplication>> getApplicationsByFreelancer(@PathVariable Long freelancerId) {
        List<ProjectApplication> applications = applicationRepository.findByFreelancerId(freelancerId);
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkApplication(
            @RequestParam Long projectId,
            @RequestParam Long freelancerId) {
        boolean hasApplied = applicationRepository
                .findByProjectIdAndFreelancerId(projectId, freelancerId)
                .isPresent();
        
        Map<String, Object> response = new HashMap<>();
        response.put("hasApplied", hasApplied);
        return ResponseEntity.ok(response);
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

    private Integer getInteger(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return null;
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return Integer.valueOf(value.toString());
    }

    private BigDecimal getBigDecimal(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return null;
        if (value instanceof Number) {
            return new BigDecimal(value.toString());
        }
        return new BigDecimal(value.toString());
    }
}
