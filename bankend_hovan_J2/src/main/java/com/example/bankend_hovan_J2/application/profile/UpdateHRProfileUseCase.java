package com.example.bankend_hovan_J2.application.profile;

import com.example.bankend_hovan_J2.domain.profile.entity.HRProfile;
import com.example.bankend_hovan_J2.domain.profile.repository.HRProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UpdateHRProfileUseCase {
    private final HRProfileRepository hrProfileRepository;

    @Transactional
    public HRProfile execute(Long id, HRProfile profile) {
        HRProfile existing = hrProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("HR profile not found"));

        // Update fields
        existing.setCompanyName(profile.getCompanyName());
        existing.setCompanySize(profile.getCompanySize());
        existing.setIndustry(profile.getIndustry());
        existing.setWebsite(profile.getWebsite());
        existing.setAddress(profile.getAddress());
        existing.setDescription(profile.getDescription());

        return hrProfileRepository.save(existing);
    }
}
