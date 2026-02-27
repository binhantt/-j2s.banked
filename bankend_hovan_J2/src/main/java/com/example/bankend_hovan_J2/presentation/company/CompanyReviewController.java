package com.example.bankend_hovan_J2.presentation.company;

import com.example.bankend_hovan_J2.domain.company.entity.CompanyReview;
import com.example.bankend_hovan_J2.domain.company.repository.CompanyReviewRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/company-reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CompanyReviewController {
    private final CompanyReviewRepository reviewRepository;

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<CompanyReview>> getReviewsByCompany(@PathVariable Long companyId) {
        List<CompanyReview> reviews = reviewRepository.findByCompanyId(companyId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/company/{companyId}/stats")
    public ResponseEntity<Map<String, Object>> getCompanyStats(@PathVariable Long companyId) {
        Double avgRating = reviewRepository.getAverageRating(companyId);
        Long count = reviewRepository.getReviewCount(companyId);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("averageRating", avgRating);
        stats.put("reviewCount", count);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/company/{companyId}/user/{userId}")
    public ResponseEntity<CompanyReview> getUserReview(
            @PathVariable Long companyId,
            @PathVariable Long userId) {
        return reviewRepository.findByCompanyIdAndUserId(companyId, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<CompanyReview> createOrUpdateReview(@RequestBody ReviewRequest request) {
        CompanyReview review = CompanyReview.builder()
                .id(request.getId())
                .companyId(request.getCompanyId())
                .userId(request.getUserId())
                .rating(request.getRating())
                .comment(request.getComment())
                .userName(request.getUserName())
                .build();
        
        CompanyReview saved = reviewRepository.save(review);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @Data
    static class ReviewRequest {
        private Long id;
        private Long companyId;
        private Long userId;
        private Integer rating;
        private String comment;
        private String userName;
    }
}
