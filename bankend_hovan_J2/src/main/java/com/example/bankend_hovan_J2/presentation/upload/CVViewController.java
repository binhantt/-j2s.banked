package com.example.bankend_hovan_J2.presentation.upload;

import com.example.bankend_hovan_J2.domain.cv.entity.UserCV;
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
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/cv")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CVViewController {

    private static final String UPLOAD_DIR = "uploads/cv/";
    private final UserCVRepository cvRepository;
    private final com.example.bankend_hovan_J2.domain.application.repository.JobApplicationRepository applicationRepository;
    private final com.example.bankend_hovan_J2.domain.job.repository.JobPostingRepository jobRepository;

    @GetMapping("/check-access")
    public ResponseEntity<?> checkCVAccess(
            @RequestParam String cvUrl,
            @RequestParam Long userId,
            @RequestParam(required = false) Long hrId) {
        try {
            log.info("Checking CV access: cvUrl={}, userId={}, hrId={}", cvUrl, userId, hrId);
            
            Optional<UserCV> cvOpt = cvRepository.findByUserId(userId)
                    .stream()
                    .filter(cv -> cv.getFileUrl().equals(cvUrl))
                    .findFirst();
            
            if (cvOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("canAccess", false, "message", "CV not found"));
            }
            
            UserCV cv = cvOpt.get();
            
            // Check visibility
            if ("private".equals(cv.getVisibility())) {
                // Private: ONLY owner can view (hrId must be null or equal to userId)
                // If hrId is present and different from userId, it means someone else is trying to view
                if (hrId != null && !hrId.equals(userId)) {
                    return ResponseEntity.ok(Map.of(
                        "canAccess", false, 
                        "message", "CV này ở chế độ riêng tư. Chỉ chủ nhân mới có thể xem."
                    ));
                }
            } else if ("application_only".equals(cv.getVisibility())) {
                // Application only: Owner or HR with application
                boolean isOwner = hrId == null || hrId.equals(userId);
                boolean isHRWithApplication = hrId != null && !hrId.equals(userId) && hasApplicationFromUser(hrId, cv.getUserId());
                
                if (!isOwner && !isHRWithApplication) {
                    return ResponseEntity.ok(Map.of(
                        "canAccess", false,
                        "message", "CV này chỉ hiển thị khi ứng viên apply vào công việc."
                    ));
                }
            }
            
            return ResponseEntity.ok(Map.of("canAccess", true));
            
        } catch (Exception e) {
            log.error("Error checking CV access", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("canAccess", false, "message", "Có lỗi xảy ra"));
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
