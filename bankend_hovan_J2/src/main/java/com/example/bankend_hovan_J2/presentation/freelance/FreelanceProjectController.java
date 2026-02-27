package com.example.bankend_hovan_J2.presentation.freelance;

import com.example.bankend_hovan_J2.domain.freelance.entity.FreelanceProject;
import com.example.bankend_hovan_J2.domain.freelance.repository.FreelanceProjectRepository;
import com.example.bankend_hovan_J2.domain.user.entity.User;
import com.example.bankend_hovan_J2.domain.user.repository.UserRepository;
import com.example.bankend_hovan_J2.presentation.freelance.dto.ProjectWithClientDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/freelance/projects")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class FreelanceProjectController {
    private final FreelanceProjectRepository projectRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<?>> getAllProjects() {
        List<FreelanceProject> projects = projectRepository.findAll();
        
        // Map projects to DTOs with client info
        List<ProjectWithClientDTO> projectDTOs = projects.stream()
                .map(project -> {
                    Optional<User> clientOpt = userRepository.findById(project.getClientId());
                    if (clientOpt.isPresent()) {
                        User client = clientOpt.get();
                        String email = client.getEmail() != null ? client.getEmail().getValue() : null;
                        return ProjectWithClientDTO.fromProject(
                            project,
                            client.getName(),
                            email,
                            client.getAvatarUrl()
                        );
                    }
                    // Fallback without client info
                    return ProjectWithClientDTO.fromProject(project, null, null, null);
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(projectDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProject(@PathVariable Long id) {
        Optional<FreelanceProject> projectOpt = projectRepository.findById(id);
        if (projectOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        FreelanceProject project = projectOpt.get();
        
        // Get client info
        Optional<User> clientOpt = userRepository.findById(project.getClientId());
        if (clientOpt.isPresent()) {
            User client = clientOpt.get();
            String email = client.getEmail() != null ? client.getEmail().getValue() : null;
            ProjectWithClientDTO dto = ProjectWithClientDTO.fromProject(
                project,
                client.getName(),
                email,
                client.getAvatarUrl()
            );
            return ResponseEntity.ok(dto);
        }
        
        // Fallback to project without client info
        return ResponseEntity.ok(project);
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<FreelanceProject>> getProjectsByClient(@PathVariable Long clientId) {
        List<FreelanceProject> projects = projectRepository.findByClientId(clientId);
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/client/{clientId}/stats")
    public ResponseEntity<Map<String, Object>> getClientStats(@PathVariable Long clientId) {
        List<FreelanceProject> projects = projectRepository.findByClientId(clientId);
        
        BigDecimal totalBudget = projects.stream()
                .map(FreelanceProject::getBudget)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalDeposit = projects.stream()
                .map(FreelanceProject::getDepositAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal paidDeposit = projects.stream()
                .filter(p -> "paid".equals(p.getDepositStatus()))
                .map(FreelanceProject::getDepositAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal pendingDeposit = projects.stream()
                .filter(p -> "pending".equals(p.getDepositStatus()))
                .map(FreelanceProject::getDepositAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        long totalProjects = projects.size();
        long draftProjects = projects.stream().filter(p -> "draft".equals(p.getStatus())).count();
        long openProjects = projects.stream().filter(p -> "open".equals(p.getStatus())).count();
        long inProgressProjects = projects.stream().filter(p -> "in_progress".equals(p.getStatus())).count();
        long completedProjects = projects.stream().filter(p -> "completed".equals(p.getStatus())).count();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProjects", totalProjects);
        stats.put("totalBudget", totalBudget);
        stats.put("totalDeposit", totalDeposit);
        stats.put("paidDeposit", paidDeposit);
        stats.put("pendingDeposit", pendingDeposit);
        stats.put("draftProjects", draftProjects);
        stats.put("openProjects", openProjects);
        stats.put("inProgressProjects", inProgressProjects);
        stats.put("completedProjects", completedProjects);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/freelancer/{freelancerId}")
    public ResponseEntity<List<FreelanceProject>> getProjectsByFreelancer(@PathVariable Long freelancerId) {
        List<FreelanceProject> projects = projectRepository.findByFreelancerId(freelancerId);
        return ResponseEntity.ok(projects);
    }

    @PostMapping
    public ResponseEntity<FreelanceProject> createProject(@RequestBody Map<String, Object> request) {
        try {
            FreelanceProject project = FreelanceProject.builder()
                    .clientId(getLong(request, "clientId"))
                    .title(getString(request, "title"))
                    .description(getString(request, "description"))
                    .budget(getBigDecimal(request, "budget"))
                    .depositAmount(getBigDecimal(request, "budget").multiply(new BigDecimal("0.2"))) // 20%
                    .depositStatus("pending")
                    .status("draft")
                    .progress(0)
                    .deadline(getLocalDate(request, "deadline"))
                    .build();

            FreelanceProject saved = projectRepository.save(project);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            log.error("Error creating project", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<FreelanceProject> updateProject(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        return projectRepository.findById(id)
                .map(project -> {
                    if (request.containsKey("title")) project.setTitle(getString(request, "title"));
                    if (request.containsKey("description")) project.setDescription(getString(request, "description"));
                    if (request.containsKey("budget")) project.setBudget(getBigDecimal(request, "budget"));
                    if (request.containsKey("status")) project.setStatus(getString(request, "status"));
                    if (request.containsKey("progress")) project.setProgress(getInteger(request, "progress"));
                    if (request.containsKey("freelancerId")) project.setFreelancerId(getLong(request, "freelancerId"));
                    if (request.containsKey("deadline")) project.setDeadline(getLocalDate(request, "deadline"));
                    
                    FreelanceProject updated = projectRepository.save(project);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/deposit")
    public ResponseEntity<Map<String, Object>> payDeposit(@PathVariable Long id) {
        return projectRepository.findById(id)
                .map(project -> {
                    project.setDepositStatus("paid");
                    project.setStatus("open");
                    projectRepository.save(project);
                    Map<String, Object> response = Map.of(
                            "success", true,
                            "message", "Thanh toán thành công"
                    );
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/progress")
    public ResponseEntity<Map<String, Object>> updateProgress(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        return projectRepository.findById(id)
                .map(project -> {
                    Integer progress = getInteger(request, "progressPercentage");
                    project.setProgress(progress);
                    if (progress >= 100) {
                        project.setStatus("completed");
                    }
                    projectRepository.save(project);
                    Map<String, Object> response = Map.of(
                            "success", true,
                            "progress", progress
                    );
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // Helper methods
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

    private Integer getInteger(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return null;
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return Integer.valueOf(value.toString());
    }

    private BigDecimal getBigDecimal(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return null;
        if (value instanceof Number) {
            return new BigDecimal(value.toString());
        }
        return new BigDecimal(value.toString());
    }

    private LocalDate getLocalDate(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return null;
        return LocalDate.parse(value.toString());
    }
}
