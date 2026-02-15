package com.example.bankend_hovan_J2.domain.company.repository;

import com.example.bankend_hovan_J2.domain.company.entity.Company;

import java.util.List;
import java.util.Optional;

public interface CompanyRepository {
    Company save(Company company);
    Optional<Company> findById(Long id);
    Optional<Company> findByHrId(Long hrId);
    List<Company> findAll();
    void deleteById(Long id);
}
