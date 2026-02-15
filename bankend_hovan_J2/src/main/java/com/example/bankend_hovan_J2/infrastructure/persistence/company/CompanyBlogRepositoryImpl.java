package com.example.bankend_hovan_J2.infrastructure.persistence.company;

import com.example.bankend_hovan_J2.domain.company.entity.CompanyBlog;
import com.example.bankend_hovan_J2.domain.company.repository.CompanyBlogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class CompanyBlogRepositoryImpl implements CompanyBlogRepository {
    private final CompanyBlogJpaRepository jpaRepository;

    @Override
    public CompanyBlog save(CompanyBlog blog) {
        CompanyBlogEntityJpa entity = toEntity(blog);
        CompanyBlogEntityJpa saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<CompanyBlog> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<CompanyBlog> findByCompanyId(Long companyId) {
        return jpaRepository.findByCompanyId(companyId)
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<CompanyBlog> findByStatus(String status) {
        return jpaRepository.findByStatus(status)
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<CompanyBlog> findByHrId(Long hrId) {
        return jpaRepository.findByHrId(hrId)
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<CompanyBlog> findAll() {
        return jpaRepository.findAll()
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    private CompanyBlogEntityJpa toEntity(CompanyBlog blog) {
        return CompanyBlogEntityJpa.builder()
                .id(blog.getId())
                .companyId(blog.getCompanyId())
                .title(blog.getTitle())
                .content(blog.getContent())
                .imageUrl(blog.getImageUrl())
                .authorName(blog.getAuthorName())
                .status(blog.getStatus())
                .views(blog.getViews())
                .publishedAt(blog.getPublishedAt())
                .createdAt(blog.getCreatedAt())
                .updatedAt(blog.getUpdatedAt())
                .build();
    }

    private CompanyBlog toDomain(CompanyBlogEntityJpa entity) {
        return CompanyBlog.builder()
                .id(entity.getId())
                .companyId(entity.getCompanyId())
                .title(entity.getTitle())
                .content(entity.getContent())
                .imageUrl(entity.getImageUrl())
                .authorName(entity.getAuthorName())
                .status(entity.getStatus())
                .views(entity.getViews())
                .publishedAt(entity.getPublishedAt())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
