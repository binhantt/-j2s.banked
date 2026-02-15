package com.example.bankend_hovan_J2.infrastructure.persistence.job;

import com.example.bankend_hovan_J2.domain.job.entity.JobComment;
import com.example.bankend_hovan_J2.domain.job.repository.JobCommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class JobCommentRepositoryImpl implements JobCommentRepository {
    private final JobCommentJpaRepository jpaRepository;

    @Override
    public JobComment save(JobComment comment) {
        JobCommentEntityJpa entity = toEntity(comment);
        JobCommentEntityJpa saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<JobComment> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<JobComment> findByJobPostingId(Long jobPostingId) {
        return jpaRepository.findByJobPostingIdOrderByCreatedAtDesc(jobPostingId)
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    private JobCommentEntityJpa toEntity(JobComment comment) {
        return JobCommentEntityJpa.builder()
                .id(comment.getId())
                .jobPostingId(comment.getJobPostingId())
                .userId(comment.getUserId())
                .userName(comment.getUserName())
                .userAvatar(comment.getUserAvatar())
                .content(comment.getContent())
                .parentId(comment.getParentId())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }

    private JobComment toDomain(JobCommentEntityJpa entity) {
        return JobComment.builder()
                .id(entity.getId())
                .jobPostingId(entity.getJobPostingId())
                .userId(entity.getUserId())
                .userName(entity.getUserName())
                .userAvatar(entity.getUserAvatar())
                .content(entity.getContent())
                .parentId(entity.getParentId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
