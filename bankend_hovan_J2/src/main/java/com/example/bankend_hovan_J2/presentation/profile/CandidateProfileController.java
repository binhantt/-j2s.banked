package com.example.bankend_hovan_J2.presentation.profile;

import com.example.bankend_hovan_J2.infrastructure.persistence.profile.*;
import com.example.bankend_hovan_J2.infrastructure.persistence.user.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/candidate-profile")
@RequiredArgsConstructor
public class CandidateProfileController {

    private final JobSeekerProfileJpaRepository jobSeekerProfileRepository;
    private final SkillJpaRepository skillRepository;
    private final ExperienceJpaRepository experienceRepository;
    private final EducationJpaRepository educationRepository;
    private final UserJpaRepository userRepository;

    /**
     * Get full candidate profile for HR to view
     * Includes: personal info, skills, experiences, educations
     */
    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getCandidateProfile(@PathVariable Long userId) {
        Map<String, Object> profile = new HashMap<>();
        
        // Get user info (name, email, currentPosition, certificateImages, cvUrl, location data)
        userRepository.findById(userId).ifPresent(u -> {
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("name", u.getName());
            userInfo.put("email", u.getEmail());
            userInfo.put("currentPosition", u.getCurrentPosition());
            userInfo.put("certificateImages", u.getCertificateImages());
            userInfo.put("cvUrl", u.getCvUrl());
            userInfo.put("avatarUrl", u.getAvatarUrl());
            userInfo.put("currentLocation", u.getCurrentLocation());
            userInfo.put("currentLatitude", u.getCurrentLatitude());
            userInfo.put("currentLongitude", u.getCurrentLongitude());
            userInfo.put("locationUpdatedAt", u.getLocationUpdatedAt());
            profile.put("userInfo", userInfo);
        });
        
        // Get personal info
        jobSeekerProfileRepository.findByUserId(userId).ifPresent(p -> {
            Map<String, Object> personalInfo = new HashMap<>();
            personalInfo.put("id", p.getId());
            personalInfo.put("userId", p.getUserId());
            personalInfo.put("phone", p.getPhone());
            personalInfo.put("location", p.getLocation());
            personalInfo.put("bio", p.getBio());
            personalInfo.put("createdAt", p.getCreatedAt());
            personalInfo.put("updatedAt", p.getUpdatedAt());
            profile.put("personalInfo", personalInfo);
        });
        
        // Get skills
        List<SkillEntityJpa> skills = skillRepository.findByUserId(userId);
        profile.put("skills", skills);
        
        // Get experiences
        List<ExperienceEntityJpa> experiences = experienceRepository.findByUserId(userId);
        profile.put("experiences", experiences);
        
        // Get educations
        List<EducationEntityJpa> educations = educationRepository.findByUserId(userId);
        profile.put("educations", educations);
        
        return ResponseEntity.ok(profile);
    }
}
