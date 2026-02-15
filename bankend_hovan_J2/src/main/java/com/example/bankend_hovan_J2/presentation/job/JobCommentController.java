package com.example.bankend_hovan_J2.presentation.job;

import com.example.bankend_hovan_J2.domain.job.entity.JobComment;
import com.example.bankend_hovan_J2.domain.job.repository.JobCommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/job-comments")
@RequiredArgsConstructor
public class JobCommentController {
    private final JobCommentRepository commentRepository;

    @PostMapping
    public ResponseEntity<JobComment> createComment(@RequestBody Map<String, Object> request) {
        JobComment comment = JobComment.builder()
                .jobPostingId(getLong(request, "jobPostingId"))
                .userId(getLong(request, "userId"))
                .userName(getString(request, "userName"))
                .userAvatar(getString(request, "userAvatar"))
                .content(getString(request, "content"))
                .parentId(getLong(request, "parentId"))
                .build();
        
        JobComment saved = commentRepository.save(comment);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/job/{jobPostingId}")
    public ResponseEntity<List<JobComment>> getCommentsByJob(@PathVariable Long jobPostingId) {
        List<JobComment> comments = commentRepository.findByJobPostingId(jobPostingId);
        return ResponseEntity.ok(comments);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        commentRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    private String getString(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }

    private Long getLong(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return null;
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        return Long.valueOf(value.toString());
    }
}
