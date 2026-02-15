package com.example.bankend_hovan_J2.domain.profile.repository;

import com.example.bankend_hovan_J2.domain.profile.entity.HRProfile;

import java.util.Optional;

public interface HRProfileRepository {
    HRProfile save(HRProfile profile);
    Optional<HRProfile> findById(Long id);
    Optional<HRProfile> findByUserId(Long userId);
    void deleteById(Long id);
}
