package com.example.bankend_hovan_J2.presentation.job;

import com.example.bankend_hovan_J2.infrastructure.persistence.job.SavedJobEntityJpa;
import com.example.bankend_hovan_J2.infrastructure.persistence.job.SavedJobJpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/saved-jobs")
@CrossOrigin(origins = "*")
public class SavedJobController {

    private final SavedJobJpaRepository savedJobRepository;

    public SavedJobController(SavedJobJpaRepository savedJobRepository) {
        this.savedJobRepository = savedJobRepository;
    }

    // Save a job
    @PostMapping
    public ResponseEntity<?> saveJob(@RequestBody SaveJobRequest request) {
        try {
            System.out.println("=== Save Job Request ===");
            System.out.println("User ID: " + request.getUserId());
            System.out.println("Job ID: " + request.getJobId());

            // Check if already saved
            if (savedJobRepository.existsByUserIdAndJobId(request.getUserId(), request.getJobId())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Job already saved"));
            }

            SavedJobEntityJpa savedJob = new SavedJobEntityJpa();
            savedJob.setUserId(request.getUserId());
            savedJob.setJobId(request.getJobId());

            SavedJobEntityJpa saved = savedJobRepository.save(savedJob);
            System.out.println("=== Job saved successfully ===");
            
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.out.println("ERROR saving job: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to save job"));
        }
    }

    // Get user's saved jobs
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SavedJobEntityJpa>> getUserSavedJobs(@PathVariable Long userId) {
        List<SavedJobEntityJpa> savedJobs = savedJobRepository.findByUserId(userId);
        return ResponseEntity.ok(savedJobs);
    }

    // Check if job is saved
    @GetMapping("/check/{userId}/{jobId}")
    public ResponseEntity<Boolean> checkSaved(@PathVariable Long userId, @PathVariable Long jobId) {
        boolean saved = savedJobRepository.existsByUserIdAndJobId(userId, jobId);
        return ResponseEntity.ok(saved);
    }

    // Unsave a job
    @DeleteMapping("/{userId}/{jobId}")
    @Transactional
    public ResponseEntity<?> unsaveJob(@PathVariable Long userId, @PathVariable Long jobId) {
        try {
            System.out.println("=== Unsave Job Request ===");
            System.out.println("User ID: " + userId);
            System.out.println("Job ID: " + jobId);

            savedJobRepository.deleteByUserIdAndJobId(userId, jobId);
            System.out.println("=== Job unsaved successfully ===");
            
            return ResponseEntity.ok(Map.of("message", "Job unsaved successfully"));
        } catch (Exception e) {
            System.out.println("ERROR unsaving job: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to unsave job"));
        }
    }
}

class SaveJobRequest {
    private Long userId;
    private Long jobId;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }
}
