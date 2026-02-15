package com.example.bankend_hovan_J2.application.savedjob;

import com.example.bankend_hovan_J2.domain.savedjob.entity.SavedJob;
import com.example.bankend_hovan_J2.domain.savedjob.repository.SavedJobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SaveJobUseCase {
    private final SavedJobRepository savedJobRepository;

    @Transactional
    public SavedJob execute(SavedJob savedJob) {
        // Business logic: Check if already saved
        boolean alreadySaved = savedJobRepository
                .findByUserIdAndJobPostingId(savedJob.getUserId(), savedJob.getJobPostingId())
                .isPresent();

        if (alreadySaved) {
            throw new RuntimeException("Job already saved");
        }

        return savedJobRepository.save(savedJob);
    }
}
