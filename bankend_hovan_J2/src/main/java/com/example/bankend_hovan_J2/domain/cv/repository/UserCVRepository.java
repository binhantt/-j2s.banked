package com.example.bankend_hovan_J2.domain.cv.repository;

import com.example.bankend_hovan_J2.domain.cv.entity.UserCV;

import java.util.List;
import java.util.Optional;

public interface UserCVRepository {
    UserCV save(UserCV cv);
    Optional<UserCV> findById(Long id);
    List<UserCV> findByUserId(Long userId);
    Optional<UserCV> findDefaultByUserId(Long userId);
    Optional<UserCV> findByFileUrl(String fileUrl);
    void deleteById(Long id);
    void setAsDefault(Long userId, Long cvId);
}
