package com.example.bankend_hovan_J2.domain.cv.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCV {
    private Long id;
    private Long userId;
    private String title;           // Tên CV (VD: "CV Software Engineer", "CV Marketing")
    private String fileUrl;         // URL file PDF
    private String fileName;        // Tên file gốc
    private Long fileSize;          // Kích thước file (bytes)
    private Boolean isDefault;      // CV mặc định
    private String visibility;      // private, public, application_only
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
