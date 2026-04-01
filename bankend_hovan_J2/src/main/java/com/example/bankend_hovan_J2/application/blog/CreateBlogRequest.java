package com.example.bankend_hovan_J2.application.blog;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBlogRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    private String excerpt;

    @NotBlank(message = "Nội dung không được để trống")
    private String content;

    @NotBlank(message = "Tác giả không được để trống")
    private String author;

    private String authorAvatar;

    @NotBlank(message = "Danh mục không được để trống")
    private String category;

    private String image;

    private String readTime;

    private String tags;

    @NotNull(message = "Nguồn blog không được để trống")
    private String source; // "platform" or "company"

    private Long companyId; // Required for company blogs

    private String facebookLink;
    private String instagramLink;
    private String zaloLink;
}