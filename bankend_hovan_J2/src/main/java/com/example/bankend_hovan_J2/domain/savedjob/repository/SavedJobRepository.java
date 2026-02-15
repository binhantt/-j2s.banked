package com.example.bankend_hovan_J2.domain.savedjob.repository;

import com.example.bankend_hovan_J2.domain.savedjob.entity.SavedJob;
import java.util.List;
import java.util.Optional;

public interface SavedJobRepository {
    SavedJob save(SavedJob savedJob);
    Optional<SavedJob> findByUserIdAndJobPostingId(Long userId, Long jobPostingId);
    List<SavedJob> findByUserId(Long userId);
    void deleteById(Long id);
    void deleteByUserIdAndJobPostingId(Long userId, Long jobPostingId);
}
