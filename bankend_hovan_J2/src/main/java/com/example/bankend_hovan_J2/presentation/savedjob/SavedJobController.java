package com.example.bankend_hovan_J2.presentation.savedjob;

import com.example.bankend_hovan_J2.application.savedjob.SaveJobUseCase;
import com.example.bankend_hovan_J2.application.savedjob.UnsaveJobUseCase;
import com.example.bankend_hovan_J2.domain.savedjob.entity.SavedJob;
import com.example.bankend_hovan_J2.domain.savedjob.repository.SavedJobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/saved-jobs")
@RequiredArgsConstructor
public class SavedJobController {
    private final SavedJobRepository savedJobRepository;
    private final SaveJobUseCase saveJobUseCase;
    private final UnsaveJobUseCase unsaveJobUseCase;

    @PostMapping
    public ResponseEntity<SavedJob> saveJob(@RequestBody SaveJobRequest request) {
        SavedJob savedJob = new SavedJob(request.getUserId(), request.getJobPostingId());
        SavedJob saved = saveJobUseCase.execute(savedJob);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SavedJob>> getUserSavedJobs(@PathVariable Long userId) {
        List<SavedJob> savedJobs = savedJobRepository.findByUserId(userId);
        return ResponseEntity.ok(savedJobs);
    }

    @GetMapping("/check/{userId}/{jobId}")
    public ResponseEntity<Boolean> checkSaved(@PathVariable Long userId, @PathVariable Long jobId) {
        boolean saved = savedJobRepository.findByUserIdAndJobPostingId(userId, jobId).isPresent();
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{userId}/{jobId}")
    public ResponseEntity<Void> unsaveJob(@PathVariable Long userId, @PathVariable Long jobId) {
        unsaveJobUseCase.execute(userId, jobId);
        return ResponseEntity.ok().build();
    }
}

class SaveJobRequest {
    private Long userId;
    private Long jobPostingId;
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public Long getJobPostingId() { return jobPostingId; }
    public void setJobPostingId(Long jobPostingId) { this.jobPostingId = jobPostingId; }
}
