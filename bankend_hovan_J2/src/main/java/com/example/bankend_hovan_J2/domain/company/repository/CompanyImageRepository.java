package com.example.bankend_hovan_J2.domain.company.repository;

import com.example.bankend_hovan_J2.domain.company.entity.CompanyImage;

import java.util.List;
import java.util.Optional;

public interface CompanyImageRepository {
    List<CompanyImage> findByCompanyId(Long companyId);
    Optional<CompanyImage> findById(Long id);
    CompanyImage save(CompanyImage companyImage);
    void deleteById(Long id);
}
