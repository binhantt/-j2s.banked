package com.example.bankend_hovan_J2.domain.cv.repository;

import com.example.bankend_hovan_J2.domain.cv.entity.CVAccessToken;

import java.util.Optional;

public interface CVAccessTokenRepository {
    CVAccessToken save(CVAccessToken token);
    Optional<CVAccessToken> findValidToken(String token);
    void markAsUsed(String token);
}
