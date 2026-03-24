package com.example.bankend_hovan_J2.presentation.job;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for saved job with full job details included.
 * Frontend expects: item.id, item.jobId, item.createdAt, item.job.title, item.job.companyName, etc.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedJobResponse {
    private Long id;
    private Long userId;
    private Long jobId;
    private LocalDateTime createdAt;

    // Full job details (wrapped under "job" for frontend compatibility)
    private JobDetails job;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobDetails {
        private Long id;
        private Long userId;
        private String title;
        private String location;
        private Long salaryMin;
        private Long salaryMax;
        private String jobType;
        private String level;
        private String experience;
        private String status;
        private LocalDateTime createdAt;
        // Company info
        private Long companyId;
        private String companyName;
        private String companyLogoUrl;
    }
}
