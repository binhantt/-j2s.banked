package com.example.bankend_hovan_J2.domain.company.repository;

import com.example.bankend_hovan_J2.domain.company.entity.CompanyImage;

import java.util.List;
import java.util.Optional;

public interface CompanyImageRepository {
    CompanyImage save(CompanyImage image);
    Optional<CompanyImage> findById(Long id);
    List<CompanyImage> findByCompanyId(Long companyId);
    void deleteById(Long id);
    void deleteByCompanyId(Long companyId);
}
