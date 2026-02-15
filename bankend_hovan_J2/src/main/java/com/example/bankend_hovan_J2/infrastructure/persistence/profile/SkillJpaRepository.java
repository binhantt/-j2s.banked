package com.example.bankend_hovan_J2.infrastructure.persistence.profile;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillJpaRepository extends JpaRepository<SkillEntityJpa, Long> {
    List<SkillEntityJpa> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}
