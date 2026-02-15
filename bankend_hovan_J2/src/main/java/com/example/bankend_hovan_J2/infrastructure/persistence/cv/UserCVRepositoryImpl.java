 package com.example.bankend_hovan_J2.infrastructure.persistence.cv;

import com.example.bankend_hovan_J2.domain.cv.entity.UserCV;
import com.example.bankend_hovan_J2.domain.cv.repository.UserCVRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class UserCVRepositoryImpl implements UserCVRepository {
    
    private final UserCVJpaRepository jpaRepository;
    
    @Override
    public UserCV save(UserCV cv) {
        System.out.println("=== UserCVRepositoryImpl.save() called ===");
        System.out.println("Input CV: " + cv);
        System.out.println("User ID: " + cv.getUserId());
        System.out.println("Title: " + cv.getTitle());
        
        UserCVEntityJpa entity = toEntity(cv);
        System.out.println("Entity created: " + entity);
        System.out.println("Entity User ID: " + entity.getUserId());
        
        UserCVEntityJpa saved = jpaRepository.save(entity);
        System.out.println("Entity saved with ID: " + saved.getId());
        
        UserCV result = toDomain(saved);
        System.out.println("Result CV ID: " + result.getId());
        System.out.println("=== Save completed ===");
        
        return result;
    }
    
    @Override
    public Optional<UserCV> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }
    
    @Override
    public List<UserCV> findByUserId(Long userId) {
        return jpaRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }
    
    @Override
    public Optional<UserCV> findDefaultByUserId(Long userId) {
        return jpaRepository.findByUserIdAndIsDefaultTrue(userId)
                .map(this::toDomain);
    }
    
    @Override
    public Optional<UserCV> findByFileUrl(String fileUrl) {
        return jpaRepository.findByFileUrl(fileUrl)
                .map(this::toDomain);
    }
    
    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }
    
    @Override
    @Transactional
    public void setAsDefault(Long userId, Long cvId) {
        // Unset all default CVs for this user
        List<UserCVEntityJpa> userCVs = jpaRepository.findByUserId(userId);
        userCVs.forEach(cv -> {
            cv.setIsDefault(false);
            jpaRepository.save(cv);
        });
        
        // Set the selected CV as default
        jpaRepository.findById(cvId).ifPresent(cv -> {
            if (cv.getUserId().equals(userId)) {
                cv.setIsDefault(true);
                jpaRepository.save(cv);
            }
        });
    }
    
    private UserCVEntityJpa toEntity(UserCV cv) {
        return UserCVEntityJpa.builder()
                .id(cv.getId())
                .userId(cv.getUserId())
                .title(cv.getTitle())
                .fileUrl(cv.getFileUrl())
                .fileName(cv.getFileName())
                .fileSize(cv.getFileSize())
                .isDefault(cv.getIsDefault())
                .visibility(cv.getVisibility() != null ? cv.getVisibility() : "application_only")
                .createdAt(cv.getCreatedAt())
                .updatedAt(cv.getUpdatedAt())
                .build();
    }
    
    private UserCV toDomain(UserCVEntityJpa entity) {
        return UserCV.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .title(entity.getTitle())
                .fileUrl(entity.getFileUrl())
                .fileName(entity.getFileName())
                .fileSize(entity.getFileSize())
                .isDefault(entity.getIsDefault())
                .visibility(entity.getVisibility())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
