package com.example.bankend_hovan_J2.application.cv;

import com.example.bankend_hovan_J2.domain.cv.entity.CVAccessToken;
import com.example.bankend_hovan_J2.domain.cv.entity.UserCV;
import com.example.bankend_hovan_J2.domain.cv.repository.CVAccessTokenRepository;
import com.example.bankend_hovan_J2.domain.cv.repository.UserCVRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CVAccessService {
    
    private final CVAccessTokenRepository tokenRepository;
    private final UserCVRepository cvRepository;
    private final com.example.bankend_hovan_J2.domain.application.repository.JobApplicationRepository applicationRepository;
    private final com.example.bankend_hovan_J2.domain.job.repository.JobPostingRepository jobRepository;
    
    /**
     * Generate access token for CV viewing
     * Token expires in 10 minutes
     */
    public String generateAccessToken(Long cvId, Long viewerId) {
        // Find CV
        UserCV cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new RuntimeException("CV not found"));
        
        // Check permission
        String viewerType;
        if (cv.getUserId().equals(viewerId)) {
            // Owner viewing own CV
            viewerType = "owner";
        } else {
            // Check if HR has permission
            if (!canHRViewCV(viewerId, cv.getUserId(), cv.getVisibility())) {
                throw new RuntimeException("Access denied: You don't have permission to view this CV");
            }
            viewerType = "hr";
        }
        
        // Generate token
        String token = UUID.randomUUID().toString();
        
        CVAccessToken accessToken = CVAccessToken.builder()
                .token(token)
                .cvId(cvId)
                .viewerId(viewerId)
                .viewerType(viewerType)
                .expiredAt(LocalDateTime.now().plusMinutes(10))
                .createdAt(LocalDateTime.now())
                .used(false)
                .build();
        
        tokenRepository.save(accessToken);
        
        log.info("Generated CV access token: cvId={}, viewerId={}, viewerType={}, token={}", 
                cvId, viewerId, viewerType, token);
        
        return token;
    }
    
    private boolean canHRViewCV(Long hrId, Long candidateUserId, String visibility) {
        // Private CV - HR cannot view
        if ("private".equals(visibility)) {
            return false;
        }
        
        // Public CV - anyone can view
        if ("public".equals(visibility)) {
            return true;
        }
        
        // Application-only - check if candidate applied to HR's job
        if ("application_only".equals(visibility)) {
            var applications = applicationRepository.findByUserId(candidateUserId);
            
            for (var app : applications) {
                var jobOpt = jobRepository.findById(app.getJobPostingId());
                if (jobOpt.isPresent() && jobOpt.get().getUserId().equals(hrId)) {
                    return true;
                }
            }
            return false;
        }
        
        return false;
    }
}
