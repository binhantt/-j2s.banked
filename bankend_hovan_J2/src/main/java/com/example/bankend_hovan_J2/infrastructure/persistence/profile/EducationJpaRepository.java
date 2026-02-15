package com.example.bankend_hovan_J2.infrastructure.persistence.profile;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EducationJpaRepository extends JpaRepository<EducationEntityJpa, Long> {
    List<EducationEntityJpa> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}
