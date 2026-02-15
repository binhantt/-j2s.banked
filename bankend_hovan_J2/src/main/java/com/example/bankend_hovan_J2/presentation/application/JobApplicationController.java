package com.example.bankend_hovan_J2.presentation.application;

import com.example.bankend_hovan_J2.infrastructure.persistence.application.JobApplicationEntityJpa;
import com.example.bankend_hovan_J2.infrastructure.persistence.application.JobApplicationJpaRepository;
import com.example.bankend_hovan_J2.infrastructure.persistence.job.JobPostingJpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {

    private final JobApplicationJpaRepository applicationRepository;
    private final JobPostingJpaRepository jobPostingRepository;
    private final com.example.bankend_hovan_J2.application.application.UpdateApplicationStatusUseCase updateApplicationStatusUseCase;

    public JobApplicationController(JobApplicationJpaRepository applicationRepository,
                                   JobPostingJpaRepository jobPostingRepository,
                                   com.example.bankend_hovan_J2.application.application.UpdateApplicationStatusUseCase updateApplicationStatusUseCase) {
        this.applicationRepository = applicationRepository;
        this.jobPostingRepository = jobPostingRepository;
        this.updateApplicationStatusUseCase = updateApplicationStatusUseCase;
    }

    // Apply for a job
    @PostMapping
    public ResponseEntity<JobApplicationEntityJpa> applyJob(@RequestBody JobApplicationEntityJpa application) {
        System.out.println("=== Apply Job Request ===");
        System.out.println("Job ID: " + application.getJobPostingId());
        System.out.println("User ID: " + application.getUserId());
        System.out.println("CV URL: " + application.getCvUrl());
        System.out.println("Cover Letter: " + (application.getCoverLetter() != null ? application.getCoverLetter().substring(0, Math.min(50, application.getCoverLetter().length())) : "null"));
        
        // Validate required fields
        if (application.getJobPostingId() == null) {
            System.out.println("ERROR: Job ID is null");
            return ResponseEntity.badRequest().build();
        }
        
        if (application.getUserId() == null) {
            System.out.println("ERROR: User ID is null");
            return ResponseEntity.badRequest().build();
        }
        
        // Check if already applied
        if (applicationRepository.findByJobPostingIdAndUserId(
                application.getJobPostingId(), 
                application.getUserId()
        ).isPresent()) {
            System.out.println("User already applied!");
            return ResponseEntity.badRequest().build();
        }
        
        try {
            JobApplicationEntityJpa saved = applicationRepository.save(application);
            System.out.println("=== Application saved with ID: " + saved.getId() + " ===");
            System.out.println("Saved CV URL: " + saved.getCvUrl());
            
            // Update application count
            jobPostingRepository.findById(application.getJobPostingId()).ifPresent(job -> {
                job.setApplications(job.getApplications() + 1);
                
                // Auto-close job if reached max applicants
                if (job.getMaxApplicants() != null && job.getApplications() >= job.getMaxApplicants()) {
                    job.setStatus("closed");
                    System.out.println("=== Job auto-closed: reached max applicants (" + job.getMaxApplicants() + ") ===");
                }
                
                jobPostingRepository.save(job);
                System.out.println("Updated job application count: " + job.getApplications() + 
                                 (job.getMaxApplicants() != null ? "/" + job.getMaxApplicants() : ""));
            });
            
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.out.println("ERROR saving application: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get applications for a job (HR view)
    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<JobApplicationEntityJpa>> getJobApplications(@PathVariable Long jobId) {
        List<JobApplicationEntityJpa> applications = applicationRepository.findByJobPostingId(jobId);
        return ResponseEntity.ok(applications);
    }
    
    // Get application by ID
    @GetMapping("/{id}")
    public ResponseEntity<JobApplicationEntityJpa> getApplication(@PathVariable Long id) {
        return applicationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get user's applications (Job seeker view)
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<JobApplicationEntityJpa>> getUserApplications(@PathVariable Long userId) {
        List<JobApplicationEntityJpa> applications = applicationRepository.findByUserId(userId);
        return ResponseEntity.ok(applications);
    }

    // Check if user applied
    @GetMapping("/check/{jobId}/{userId}")
    public ResponseEntity<Boolean> checkApplied(@PathVariable Long jobId, @PathVariable Long userId) {
        boolean applied = applicationRepository.findByJobPostingIdAndUserId(jobId, userId).isPresent();
        return ResponseEntity.ok(applied);
    }

    // Update application status (HR only)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request) {
        try {
            System.out.println("=== Update Status Request ===");
            System.out.println("Application ID: " + id);
            System.out.println("New Status: " + request.getStatus());
            
            return applicationRepository.findById(id)
                    .map(app -> {
                        app.setStatus(request.getStatus());
                        JobApplicationEntityJpa saved = applicationRepository.save(app);
                        
                        // Call UseCase for notification (only on final acceptance/rejection)
                        if ("accepted".equals(request.getStatus()) || "rejected".equals(request.getStatus())) {
                            updateApplicationStatusUseCase.execute(id, request.getStatus());
                        }
                        
                        System.out.println("Status updated successfully");
                        return ResponseEntity.ok(saved);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.out.println("ERROR updating status: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Update interview round (HR only) - Pass candidate to next round
    @PutMapping("/{id}/round")
    public ResponseEntity<?> updateRound(
            @PathVariable Long id,
            @RequestBody RoundUpdateRequest request) {
        try {
            System.out.println("=== Update Round Request ===");
            System.out.println("Application ID: " + id);
            System.out.println("Action: " + request.getAction());
            
            return applicationRepository.findById(id)
                    .map(app -> {
                        return jobPostingRepository.findById(app.getJobPostingId())
                                .map(job -> {
                                    int currentRound = app.getCurrentRound() != null ? app.getCurrentRound() : 0;
                                    int totalRounds = job.getInterviewRounds() != null ? job.getInterviewRounds() : 1;
                                    
                                    if ("pass".equals(request.getAction())) {
                                        if (currentRound >= totalRounds) {
                                            return ResponseEntity.badRequest()
                                                    .body(Map.of("error", "Ứng viên đã hoàn thành tất cả vòng phỏng vấn"));
                                        }
                                        
                                        int newRound = currentRound + 1;
                                        app.setCurrentRound(newRound);
                                        app.setStatus("reviewing"); // Keep in reviewing status
                                        
                                        JobApplicationEntityJpa saved = applicationRepository.save(app);
                                        
                                        // Create notification for passing round
                                        updateApplicationStatusUseCase.executeRoundUpdate(
                                            id, Integer.valueOf(newRound), Integer.valueOf(totalRounds), job.getTitle()
                                        );
                                        
                                        System.out.println("=== Candidate passed to round " + newRound + "/" + totalRounds + " ===");
                                        return ResponseEntity.ok(saved);
                                        
                                    } else if ("fail".equals(request.getAction())) {
                                        app.setStatus("rejected");
                                        JobApplicationEntityJpa saved = applicationRepository.save(app);
                                        
                                        // Create notification for failing round
                                        updateApplicationStatusUseCase.execute(id, "rejected");
                                        
                                        System.out.println("=== Candidate failed at round " + currentRound + " ===");
                                        return ResponseEntity.ok(saved);
                                    }
                                    
                                    return ResponseEntity.badRequest()
                                            .body(Map.of("error", "Invalid action"));
                                })
                                .orElse(ResponseEntity.notFound().build());
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.out.println("ERROR updating round: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // User confirm going to work
    @PutMapping("/{id}/confirm")
    public ResponseEntity<?> confirmApplication(@PathVariable Long id) {
        try {
            return applicationRepository.findById(id)
                    .map(app -> {
                        if (!"accepted".equals(app.getStatus())) {
                            return ResponseEntity.badRequest()
                                    .body(Map.of("error", "Chỉ có thể xác nhận khi đơn đã được chấp nhận"));
                        }
                        
                        app.setUserConfirmed(true);
                        applicationRepository.save(app);
                        
                        // Close job when user confirms
                        jobPostingRepository.findById(app.getJobPostingId()).ifPresent(job -> {
                            job.setStatus("closed");
                            jobPostingRepository.save(job);
                            System.out.println("=== Job closed: user confirmed ===");
                        });
                        
                        return ResponseEntity.ok(app);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.out.println("ERROR confirming application: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Delete application
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        applicationRepository.findById(id).ifPresent(app -> {
            // Decrease application count
            jobPostingRepository.findById(app.getJobPostingId()).ifPresent(job -> {
                job.setApplications(Math.max(0, job.getApplications() - 1));
                jobPostingRepository.save(job);
            });
            applicationRepository.deleteById(id);
        });
        return ResponseEntity.ok().build();
    }
}

class StatusUpdateRequest {
    private String status;
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}

class RoundUpdateRequest {
    private String action; // "pass" or "fail"
    
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
}
