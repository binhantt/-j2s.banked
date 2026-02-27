package com.example.bankend_hovan_J2.presentation.freelance;

import com.example.bankend_hovan_J2.domain.freelance.entity.ProjectMilestone;
import com.example.bankend_hovan_J2.domain.freelance.repository.ProjectMilestoneRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/freelance/milestones")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ProjectMilestoneController {
    private final ProjectMilestoneRepository milestoneRepository;

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ProjectMilestone>> getMilestonesByProject(@PathVariable Long projectId) {
        List<ProjectMilestone> milestones = milestoneRepository.findByProjectId(projectId);
        return ResponseEntity.ok(milestones);
    }

    @PostMapping
    public ResponseEntity<ProjectMilestone> createMilestone(@RequestBody Map<String, Object> request) {
        try {
            ProjectMilestone milestone = ProjectMilestone.builder()
                    .projectId(getLong(request, "projectId"))
                    .title(getString(request, "title"))
                    .percentage(getInteger(request, "percentage"))
                    .status(getString(request, "status", "pending"))
                    .dueDate(getLocalDate(request, "dueDate"))
                    .build();

            ProjectMilestone saved = milestoneRepository.save(milestone);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            log.error("Error creating milestone", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectMilestone> updateMilestone(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        return milestoneRepository.findById(id)
                .map(milestone -> {
                    if (request.containsKey("title")) milestone.setTitle(getString(request, "title"));
                    if (request.containsKey("percentage")) milestone.setPercentage(getInteger(request, "percentage"));
                    if (request.containsKey("status")) milestone.setStatus(getString(request, "status"));
                    if (request.containsKey("dueDate")) milestone.setDueDate(getLocalDate(request, "dueDate"));
                    
                    ProjectMilestone updated = milestoneRepository.save(milestone);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMilestone(@PathVariable Long id) {
        milestoneRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // Helper methods
    private String getString(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }

    private String getString(Map<String, Object> map, String key, String defaultValue) {
        Object value = map.get(key);
        return value != null ? value.toString() : defaultValue;
    }

    private Long getLong(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return null;
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        return Long.valueOf(value.toString());
    }

    private Integer getInteger(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return null;
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return Integer.valueOf(value.toString());
    }

    private LocalDate getLocalDate(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return null;
        return LocalDate.parse(value.toString());
    }
}
