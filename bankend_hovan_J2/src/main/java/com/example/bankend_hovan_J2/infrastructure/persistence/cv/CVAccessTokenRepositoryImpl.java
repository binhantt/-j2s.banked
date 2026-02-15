package com.example.bankend_hovan_J2.infrastructure.persistence.cv;

import com.example.bankend_hovan_J2.domain.cv.entity.CVAccessToken;
import com.example.bankend_hovan_J2.domain.cv.repository.CVAccessTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class CVAccessTokenRepositoryImpl implements CVAccessTokenRepository {
    
    private final CVAccessTokenJpaRepository jpaRepository;
    
    @Override
    public CVAccessToken save(CVAccessToken token) {
        CVAccessTokenEntityJpa entity = toEntity(token);
        CVAccessTokenEntityJpa saved = jpaRepository.save(entity);
        return toDomain(saved);
    }
    
    @Override
    public Optional<CVAccessToken> findValidToken(String token) {
        return jpaRepository.findValidToken(token, LocalDateTime.now())
                .map(this::toDomain);
    }
    
    @Override
    @Transactional
    public void markAsUsed(String token) {
        jpaRepository.findByToken(token).ifPresent(entity -> {
            entity.setUsed(true);
            jpaRepository.save(entity);
        });
    }
    
    private CVAccessTokenEntityJpa toEntity(CVAccessToken token) {
        return CVAccessTokenEntityJpa.builder()
                .id(token.getId())
                .token(token.getToken())
                .cvId(token.getCvId())
                .viewerId(token.getViewerId())
                .viewerType(token.getViewerType())
                .expiredAt(token.getExpiredAt())
                .createdAt(token.getCreatedAt())
                .used(token.getUsed() != null ? token.getUsed() : false)
                .build();
    }
    
    private CVAccessToken toDomain(CVAccessTokenEntityJpa entity) {
        return CVAccessToken.builder()
                .id(entity.getId())
                .token(entity.getToken())
                .cvId(entity.getCvId())
                .viewerId(entity.getViewerId())
                .viewerType(entity.getViewerType())
                .expiredAt(entity.getExpiredAt())
                .createdAt(entity.getCreatedAt())
                .used(entity.getUsed())
                .build();
    }
}
