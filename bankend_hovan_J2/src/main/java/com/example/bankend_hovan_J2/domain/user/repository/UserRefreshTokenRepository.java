package com.example.bankend_hovan_J2.domain.user.repository;

import com.example.bankend_hovan_J2.domain.user.entity.UserRefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRefreshTokenRepository extends JpaRepository<UserRefreshToken, Long> {

    Optional<UserRefreshToken> findByTokenHash(String tokenHash);

    List<UserRefreshToken> findByUserId(Long userId);

    List<UserRefreshToken> findByUserIdAndIsRevokedFalse(Long userId);

    void deleteByUserId(Long userId);
}
