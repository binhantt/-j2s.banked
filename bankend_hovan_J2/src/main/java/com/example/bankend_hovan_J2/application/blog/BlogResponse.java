package com.example.bankend_hovan_J2.application.blog;

import com.example.bankend_hovan_J2.domain.blog.Blog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlogResponse {
    private String id;
    private String title;
    private String excerpt;
    private String content;
    private String author;
    private String authorAvatar;
    private String category;
    private String image;
    private String readTime;
    private Integer views;
    private String source;
    private List<String> tags;
    private Long companyId;
    private String date;

    public static BlogResponse from(Blog blog) {
        List<String> tagList = blog.getTags() != null && !blog.getTags().isEmpty() 
            ? Arrays.asList(blog.getTags().split(","))
            : List.of();

        return BlogResponse.builder()
                .id(blog.getId().toString())
                .title(blog.getTitle())
                .excerpt(blog.getExcerpt())
                .content(blog.getContent())
                .author(blog.getAuthor())
                .authorAvatar(blog.getAuthorAvatar())
                .category(blog.getCategory())
                .image(blog.getImage())
                .readTime(blog.getReadTime())
                .views(blog.getViews())
                .source(blog.getSource().name().toLowerCase())
                .tags(tagList)
                .companyId(blog.getCompanyId())
                .date(formatDate(blog.getCreatedAt()))
                .build();
    }

    private static String formatDate(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        return dateTime.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
    }
}