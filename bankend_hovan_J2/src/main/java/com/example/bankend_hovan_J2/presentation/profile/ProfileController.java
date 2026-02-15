package com.example.bankend_hovan_J2.presentation.profile;

import com.example.bankend_hovan_J2.infrastructure.persistence.profile.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final JobSeekerProfileJpaRepository jobSeekerProfileRepository;
    private final HRProfileJpaRepository hrProfileRepository;
    private final SkillJpaRepository skillRepository;
    private final ExperienceJpaRepository experienceRepository;
    private final EducationJpaRepository educationRepository;
    private final CVJpaRepository cvRepository;

    public ProfileController(
            JobSeekerProfileJpaRepository jobSeekerProfileRepository,
            HRProfileJpaRepository hrProfileRepository,
            SkillJpaRepository skillRepository,
            ExperienceJpaRepository experienceRepository,
            EducationJpaRepository educationRepository,
            CVJpaRepository cvRepository) {
        this.jobSeekerProfileRepository = jobSeekerProfileRepository;
        this.hrProfileRepository = hrProfileRepository;
        this.skillRepository = skillRepository;
        this.experienceRepository = experienceRepository;
        this.educationRepository = educationRepository;
        this.cvRepository = cvRepository;
    }

    // ========== Job Seeker Profile APIs ==========
    @GetMapping("/job-seeker/{userId}")
    public ResponseEntity<JobSeekerProfileEntityJpa> getJobSeekerProfile(@PathVariable Long userId) {
        return jobSeekerProfileRepository.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    // Create empty profile if doesn't exist
                    JobSeekerProfileEntityJpa newProfile = new JobSeekerProfileEntityJpa();
                    newProfile.setUserId(userId);
                    JobSeekerProfileEntityJpa saved = jobSeekerProfileRepository.save(newProfile);
                    return ResponseEntity.ok(saved);
                });
    }

    @PostMapping("/job-seeker")
    public ResponseEntity<JobSeekerProfileEntityJpa> createJobSeekerProfile(
            @RequestBody JobSeekerProfileEntityJpa profile) {
        JobSeekerProfileEntityJpa saved = jobSeekerProfileRepository.save(profile);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/job-seeker/{id}")
    public ResponseEntity<JobSeekerProfileEntityJpa> updateJobSeekerProfile(
            @PathVariable Long id,
            @RequestBody JobSeekerProfileEntityJpa profile) {
        return jobSeekerProfileRepository.findById(id)
                .map(existing -> {
                    existing.setPhone(profile.getPhone());
                    existing.setLocation(profile.getLocation());
                    existing.setBio(profile.getBio());
                    return ResponseEntity.ok(jobSeekerProfileRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ========== HR Profile APIs ==========
    @GetMapping("/hr/{userId}")
    public ResponseEntity<HRProfileEntityJpa> getHRProfile(@PathVariable Long userId) {
        return hrProfileRepository.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    // Create empty profile if doesn't exist
                    HRProfileEntityJpa newProfile = new HRProfileEntityJpa();
                    newProfile.setUserId(userId);
                    HRProfileEntityJpa saved = hrProfileRepository.save(newProfile);
                    return ResponseEntity.ok(saved);
                });
    }

    @PostMapping("/hr")
    public ResponseEntity<HRProfileEntityJpa> createHRProfile(@RequestBody HRProfileEntityJpa profile) {
        HRProfileEntityJpa saved = hrProfileRepository.save(profile);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/hr/{id}")
    public ResponseEntity<HRProfileEntityJpa> updateHRProfile(
            @PathVariable Long id,
            @RequestBody HRProfileEntityJpa profile) {
        return hrProfileRepository.findById(id)
                .map(existing -> {
                    existing.setCompanyName(profile.getCompanyName());
                    existing.setCompanySize(profile.getCompanySize());
                    existing.setIndustry(profile.getIndustry());
                    existing.setWebsite(profile.getWebsite());
                    existing.setAddress(profile.getAddress());
                    existing.setDescription(profile.getDescription());
                    return ResponseEntity.ok(hrProfileRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ========== Skills APIs ==========
    @GetMapping("/skills/{userId}")
    public ResponseEntity<List<SkillEntityJpa>> getSkills(@PathVariable Long userId) {
        List<SkillEntityJpa> skills = skillRepository.findByUserId(userId);
        return ResponseEntity.ok(skills);
    }

    @PostMapping("/skills")
    public ResponseEntity<SkillEntityJpa> createSkill(@RequestBody SkillEntityJpa skill) {
        SkillEntityJpa saved = skillRepository.save(skill);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/skills/{id}")
    public ResponseEntity<Void> deleteSkill(@PathVariable Long id) {
        skillRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ========== Experience APIs ==========
    @GetMapping("/experience/{userId}")
    public ResponseEntity<List<ExperienceEntityJpa>> getExperiences(@PathVariable Long userId) {
        List<ExperienceEntityJpa> experiences = experienceRepository.findByUserId(userId);
        return ResponseEntity.ok(experiences);
    }

    @PostMapping("/experience")
    public ResponseEntity<ExperienceEntityJpa> createExperience(@RequestBody ExperienceEntityJpa experience) {
        ExperienceEntityJpa saved = experienceRepository.save(experience);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/experience/{id}")
    public ResponseEntity<ExperienceEntityJpa> updateExperience(
            @PathVariable Long id,
            @RequestBody ExperienceEntityJpa experience) {
        return experienceRepository.findById(id)
                .map(existing -> {
                    existing.setTitle(experience.getTitle());
                    existing.setCompany(experience.getCompany());
                    existing.setLocation(experience.getLocation());
                    existing.setStartDate(experience.getStartDate());
                    existing.setEndDate(experience.getEndDate());
                    existing.setIsCurrent(experience.getIsCurrent());
                    existing.setDescription(experience.getDescription());
                    return ResponseEntity.ok(experienceRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/experience/{id}")
    public ResponseEntity<Void> deleteExperience(@PathVariable Long id) {
        experienceRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ========== Education APIs ==========
    @GetMapping("/education/{userId}")
    public ResponseEntity<List<EducationEntityJpa>> getEducations(@PathVariable Long userId) {
        List<EducationEntityJpa> educations = educationRepository.findByUserId(userId);
        return ResponseEntity.ok(educations);
    }

    @PostMapping("/education")
    public ResponseEntity<EducationEntityJpa> createEducation(@RequestBody EducationEntityJpa education) {
        EducationEntityJpa saved = educationRepository.save(education);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/education/{id}")
    public ResponseEntity<EducationEntityJpa> updateEducation(
            @PathVariable Long id,
            @RequestBody EducationEntityJpa education) {
        return educationRepository.findById(id)
                .map(existing -> {
                    existing.setDegree(education.getDegree());
                    existing.setSchool(education.getSchool());
                    existing.setFieldOfStudy(education.getFieldOfStudy());
                    existing.setStartDate(education.getStartDate());
                    existing.setEndDate(education.getEndDate());
                    existing.setGpa(education.getGpa());
                    existing.setDescription(education.getDescription());
                    return ResponseEntity.ok(educationRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/education/{id}")
    public ResponseEntity<Void> deleteEducation(@PathVariable Long id) {
        educationRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ========== CV APIs ==========
    @GetMapping("/cv/{userId}")
    public ResponseEntity<List<CVEntityJpa>> getCVs(@PathVariable Long userId) {
        List<CVEntityJpa> cvs = cvRepository.findByUserId(userId);
        return ResponseEntity.ok(cvs);
    }

    @PostMapping("/cv")
    public ResponseEntity<CVEntityJpa> createCV(@RequestBody CVEntityJpa cv) {
        CVEntityJpa saved = cvRepository.save(cv);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/cv/{id}")
    public ResponseEntity<CVEntityJpa> updateCV(
            @PathVariable Long id,
            @RequestBody CVEntityJpa cv) {
        return cvRepository.findById(id)
                .map(existing -> {
                    existing.setFileName(cv.getFileName());
                    existing.setFileUrl(cv.getFileUrl());
                    existing.setFileSize(cv.getFileSize());
                    existing.setIsActive(cv.getIsActive());
                    return ResponseEntity.ok(cvRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/cv/{id}/set-active")
    public ResponseEntity<CVEntityJpa> setActiveCV(@PathVariable Long id) {
        return cvRepository.findById(id)
                .map(cv -> {
                    // Deactivate all other CVs for this user
                    List<CVEntityJpa> userCVs = cvRepository.findByUserId(cv.getUserId());
                    userCVs.forEach(c -> {
                        c.setIsActive(false);
                        cvRepository.save(c);
                    });
                    
                    // Activate this CV
                    cv.setIsActive(true);
                    return ResponseEntity.ok(cvRepository.save(cv));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/cv/{id}")
    public ResponseEntity<Void> deleteCV(@PathVariable Long id) {
        cvRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
