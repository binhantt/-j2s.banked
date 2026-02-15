package com.example.bankend_hovan_J2.application.profile;

import com.example.bankend_hovan_J2.domain.profile.entity.HRProfile;
import com.example.bankend_hovan_J2.domain.profile.repository.HRProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CreateHRProfileUseCase {
    private final HRProfileRepository hrProfileRepository;

    @Transactional
    public HRProfile execute(HRProfile profile) {
        // Business logic: Check if user already has profile
        hrProfileRepository.findByUserId(profile.getUserId())
                .ifPresent(existing -> {
                    throw new RuntimeException("User already has HR profile");
                });

        return hrProfileRepository.save(profile);
    }
}
