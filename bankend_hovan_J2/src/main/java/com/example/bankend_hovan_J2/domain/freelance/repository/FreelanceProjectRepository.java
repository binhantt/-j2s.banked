package com.example.bankend_hovan_J2.domain.freelance.repository;

import com.example.bankend_hovan_J2.domain.freelance.entity.FreelanceProject;

import java.util.List;
import java.util.Optional;

public interface FreelanceProjectRepository {
    FreelanceProject save(FreelanceProject project);
    Optional<FreelanceProject> findById(Long id);
    List<FreelanceProject> findByClientId(Long clientId);
    List<FreelanceProject> findByFreelancerId(Long freelancerId);
    List<FreelanceProject> findAll();
    void deleteById(Long id);
}
