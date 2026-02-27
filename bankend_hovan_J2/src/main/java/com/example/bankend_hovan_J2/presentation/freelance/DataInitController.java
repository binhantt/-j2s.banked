package com.example.bankend_hovan_J2.presentation.freelance;

import com.example.bankend_hovan_J2.domain.freelance.entity.FreelanceProject;
import com.example.bankend_hovan_J2.domain.freelance.entity.ProjectMilestone;
import com.example.bankend_hovan_J2.domain.freelance.repository.FreelanceProjectRepository;
import com.example.bankend_hovan_J2.domain.freelance.repository.ProjectMilestoneRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/freelance/init")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class DataInitController {
    private final FreelanceProjectRepository projectRepository;
    private final ProjectMilestoneRepository milestoneRepository;

    @PostMapping("/sample-data")
    public ResponseEntity<Map<String, Object>> initSampleData() {
        try {
            // Project 1: Website bán hàng - draft
            FreelanceProject project1 = FreelanceProject.builder()
                    .clientId(1L)
                    .title("Thiết kế website bán hàng")
                    .description("Cần thiết kế một website bán hàng online với đầy đủ tính năng:\n\n" +
                            "• Giao diện hiện đại, responsive trên mọi thiết bị\n" +
                            "• Hệ thống giỏ hàng và thanh toán online\n" +
                            "• Quản lý sản phẩm, danh mục\n" +
                            "• Tích hợp thanh toán VNPay, Momo\n" +
                            "• Dashboard quản trị viên\n" +
                            "• Tối ưu SEO\n\n" +
                            "Công nghệ yêu cầu: React, Node.js, MongoDB")
                    .budget(new BigDecimal("20000000"))
                    .depositAmount(new BigDecimal("4000000"))
                    .depositStatus("pending")
                    .status("draft")
                    .progress(0)
                    .deadline(LocalDate.of(2024, 12, 31))
                    .build();
            project1 = projectRepository.save(project1);

            // Milestones for Project 1
            milestoneRepository.save(ProjectMilestone.builder()
                    .projectId(project1.getId())
                    .title("Phân tích yêu cầu và thiết kế UI/UX")
                    .percentage(25)
                    .status("pending")
                    .dueDate(LocalDate.of(2024, 4, 15))
                    .build());
            milestoneRepository.save(ProjectMilestone.builder()
                    .projectId(project1.getId())
                    .title("Phát triển Frontend")
                    .percentage(35)
                    .status("pending")
                    .dueDate(LocalDate.of(2024, 5, 30))
                    .build());
            milestoneRepository.save(ProjectMilestone.builder()
                    .projectId(project1.getId())
                    .title("Phát triển Backend & API")
                    .percentage(30)
                    .status("pending")
                    .dueDate(LocalDate.of(2024, 7, 15))
                    .build());
            milestoneRepository.save(ProjectMilestone.builder()
                    .projectId(project1.getId())
                    .title("Testing và Deploy")
                    .percentage(10)
                    .status("pending")
                    .dueDate(LocalDate.of(2024, 8, 31))
                    .build());

            // Project 2: Mobile app - in progress
            FreelanceProject project2 = FreelanceProject.builder()
                    .clientId(2L)
                    .title("Phát triển ứng dụng mobile quản lý công việc")
                    .description("Xây dựng ứng dụng mobile quản lý công việc cá nhân và nhóm:\n\n" +
                            "• Tạo và quản lý task, project\n" +
                            "• Phân công công việc cho thành viên\n" +
                            "• Thông báo realtime\n" +
                            "• Báo cáo tiến độ\n" +
                            "• Tích hợp calendar\n" +
                            "• Chat nhóm\n\n" +
                            "Yêu cầu: React Native, Firebase, Node.js")
                    .budget(new BigDecimal("35000000"))
                    .depositAmount(new BigDecimal("7000000"))
                    .depositStatus("paid")
                    .status("in_progress")
                    .progress(45)
                    .deadline(LocalDate.of(2024, 6, 30))
                    .build();
            project2 = projectRepository.save(project2);

            // Milestones for Project 2
            milestoneRepository.save(ProjectMilestone.builder()
                    .projectId(project2.getId())
                    .title("Thiết kế UI/UX")
                    .percentage(20)
                    .status("completed")
                    .dueDate(LocalDate.of(2024, 2, 28))
                    .build());
            milestoneRepository.save(ProjectMilestone.builder()
                    .projectId(project2.getId())
                    .title("Phát triển tính năng quản lý task")
                    .percentage(30)
                    .status("completed")
                    .dueDate(LocalDate.of(2024, 3, 31))
                    .build());
            milestoneRepository.save(ProjectMilestone.builder()
                    .projectId(project2.getId())
                    .title("Phát triển tính năng chat và notification")
                    .percentage(25)
                    .status("in_progress")
                    .dueDate(LocalDate.of(2024, 5, 15))
                    .build());
            milestoneRepository.save(ProjectMilestone.builder()
                    .projectId(project2.getId())
                    .title("Tích hợp Firebase và testing")
                    .percentage(15)
                    .status("pending")
                    .dueDate(LocalDate.of(2024, 6, 15))
                    .build());
            milestoneRepository.save(ProjectMilestone.builder()
                    .projectId(project2.getId())
                    .title("Deploy và launch")
                    .percentage(10)
                    .status("pending")
                    .dueDate(LocalDate.of(2024, 6, 30))
                    .build());

            // Project 3: Logo design - completed
            FreelanceProject project3 = FreelanceProject.builder()
                    .clientId(1L)
                    .title("Thiết kế logo và bộ nhận diện thương hiệu")
                    .description("Thiết kế logo và bộ nhận diện thương hiệu cho startup công nghệ:\n\n" +
                            "• Logo chính và các biến thể\n" +
                            "• Bộ màu thương hiệu\n" +
                            "• Typography\n" +
                            "• Business card, letterhead\n" +
                            "• Social media templates\n" +
                            "• Brand guideline\n\n" +
                            "Phong cách: Hiện đại, tối giản, công nghệ")
                    .budget(new BigDecimal("8000000"))
                    .depositAmount(new BigDecimal("1600000"))
                    .depositStatus("paid")
                    .status("completed")
                    .progress(100)
                    .deadline(LocalDate.of(2024, 3, 15))
                    .build();
            project3 = projectRepository.save(project3);

            // Milestones for Project 3
            milestoneRepository.save(ProjectMilestone.builder()
                    .projectId(project3.getId())
                    .title("Research và concept")
                    .percentage(20)
                    .status("completed")
                    .dueDate(LocalDate.of(2024, 2, 1))
                    .build());
            milestoneRepository.save(ProjectMilestone.builder()
                    .projectId(project3.getId())
                    .title("Thiết kế logo và các biến thể")
                    .percentage(40)
                    .status("completed")
                    .dueDate(LocalDate.of(2024, 2, 20))
                    .build());
            milestoneRepository.save(ProjectMilestone.builder()
                    .projectId(project3.getId())
                    .title("Thiết kế bộ nhận diện")
                    .percentage(30)
                    .status("completed")
                    .dueDate(LocalDate.of(2024, 3, 10))
                    .build());
            milestoneRepository.save(ProjectMilestone.builder()
                    .projectId(project3.getId())
                    .title("Hoàn thiện brand guideline")
                    .percentage(10)
                    .status("completed")
                    .dueDate(LocalDate.of(2024, 3, 15))
                    .build());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã khởi tạo 3 dự án mẫu với milestones");
            response.put("projectsCreated", 3);
            response.put("milestonesCreated", 13);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error initializing sample data", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi khởi tạo dữ liệu: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
