package com.example.bankend_hovan_J2.infrastructure.persistence.freelance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FreelanceProjectJpaRepository extends JpaRepository<FreelanceProjectEntityJpa, Long> {
    List<FreelanceProjectEntityJpa> findByClientId(Long clientId);
    List<FreelanceProjectEntityJpa> findByFreelancerId(Long freelancerId);
}
