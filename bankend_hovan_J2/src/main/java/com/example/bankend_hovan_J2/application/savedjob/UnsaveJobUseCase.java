package com.example.bankend_hovan_J2.application.savedjob;

import com.example.bankend_hovan_J2.domain.savedjob.repository.SavedJobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UnsaveJobUseCase {
    private final SavedJobRepository savedJobRepository;

    @Transactional
    public void execute(Long userId, Long jobPostingId) {
        // Business logic: Find and delete saved job
        savedJobRepository.findByUserIdAndJobPostingId(userId, jobPostingId)
                .ifPresent(savedJob -> savedJobRepository.deleteById(savedJob.getId()));
    }
}
