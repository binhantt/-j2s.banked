package com.example.bankend_hovan_J2.domain.company.repository;

import com.example.bankend_hovan_J2.domain.company.entity.CompanyBlog;

import java.util.List;
import java.util.Optional;

public interface CompanyBlogRepository {
    CompanyBlog save(CompanyBlog blog);
    Optional<CompanyBlog> findById(Long id);
    List<CompanyBlog> findByCompanyId(Long companyId);
    List<CompanyBlog> findByHrId(Long hrId);
    List<CompanyBlog> findByStatus(String status);
    List<CompanyBlog> findAll();
    void deleteById(Long id);
}
