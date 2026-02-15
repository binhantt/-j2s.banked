package com.example.bankend_hovan_J2.application.application;

import com.example.bankend_hovan_J2.application.notification.CreateNotificationUseCase;
import com.example.bankend_hovan_J2.domain.application.entity.JobApplication;
import com.example.bankend_hovan_J2.domain.application.repository.JobApplicationRepository;
import com.example.bankend_hovan_J2.domain.job.entity.JobPosting;
import com.example.bankend_hovan_J2.domain.job.repository.JobPostingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UpdateApplicationStatusUseCase {
    
    private final JobApplicationRepository applicationRepository;
    private final CreateNotificationUseCase createNotificationUseCase;
    private final JobPostingRepository jobPostingRepository;

    @Transactional
    public JobApplication execute(Long applicationId, String newStatus) {
        log.info("Updating application {} to status: {}", applicationId, newStatus);
        
        JobApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        
        String oldStatus = application.getStatus();
        log.info("Old status: {}, New status: {}", oldStatus, newStatus);
        
        application.updateStatus(newStatus);
        JobApplication updated = applicationRepository.save(application);
        
        // Create notification if status changed to accepted or rejected
        if (!oldStatus.equals(newStatus) && ("accepted".equals(newStatus) || "rejected".equals(newStatus))) {
            log.info("Creating notification for user {} with status {}", updated.getUserId(), newStatus);
            createNotification(updated, newStatus);
        } else {
            log.info("No notification created. Old status: {}, New status: {}", oldStatus, newStatus);
        }
        
        return updated;
    }
    
    @Transactional
    public void executeRoundUpdate(Long applicationId, Integer newRound, Integer totalRounds, String jobTitle) {
        log.info("Updating application {} to round {}/{}", applicationId, newRound, totalRounds);
        
        JobApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        
        createRoundNotification(application, newRound, totalRounds, jobTitle);
    }
    
    private void createNotification(JobApplication application, String status) {
        try {
            log.info("Starting notification creation for application {}", application.getId());
            
            // Get job posting info
            JobPosting job = jobPostingRepository.findById(application.getJobPostingId())
                    .orElse(null);
            
            if (job != null) {
                log.info("Found job posting: {}", job.getTitle());
            } else {
                log.warn("Job posting not found for ID: {}", application.getJobPostingId());
            }
            
            String title;
            String message;
            String type;
            
            if ("accepted".equals(status)) {
                type = "application_accepted";
                title = "Congratulations! Your application has been accepted";
                message = job != null 
                    ? String.format("Your application for position '%s' has been accepted. The company will contact you soon.", job.getTitle())
                    : "Your application has been accepted. The company will contact you soon.";
            } else {
                type = "application_rejected";
                title = "Application Status Update";
                message = job != null
                    ? String.format("Unfortunately, your application for position '%s' was not selected this time. Don't give up and keep trying!", job.getTitle())
                    : "Unfortunately, your application was not selected this time. Don't give up and keep trying!";
            }
            
            log.info("Creating notification: userId={}, type={}, title={}", application.getUserId(), type, title);
            
            createNotificationUseCase.execute(
                application.getUserId(),
                type,
                title,
                message,
                "job_application",
                application.getId()
            );
            
            log.info("Notification created successfully for user {}", application.getUserId());
        } catch (Exception e) {
            // Log error but don't fail the transaction
            log.error("Error creating notification for application {}: {}", application.getId(), e.getMessage(), e);
        }
    }
    
    private void createRoundNotification(JobApplication application, Integer newRound, Integer totalRounds, String jobTitle) {
        try {
            log.info("Creating round notification for application {}, round {}/{}", application.getId(), newRound, totalRounds);
            
            String type = "interview_round";
            String title = String.format("Congratulations! You passed round %d", newRound - 1);
            String message;
            
            if (newRound >= totalRounds) {
                message = String.format("Congratulations! You completed round %d/%d for position '%s'. This is the final round, the company will announce the results soon.", 
                    newRound, totalRounds, jobTitle);
            } else {
                message = String.format("Congratulations! You passed round %d and advanced to round %d/%d for position '%s'. Prepare well for the next round!", 
                    newRound - 1, newRound, totalRounds, jobTitle);
            }
            
            createNotificationUseCase.execute(
                application.getUserId(),
                type,
                title,
                message,
                "job_application",
                application.getId()
            );
            
            log.info("Round notification created successfully");
        } catch (Exception e) {
            log.error("Error creating round notification: {}", e.getMessage(), e);
        }
    }
}
