package com.example.bankend_hovan_J2.infrastructure.persistence.user;

import com.example.bankend_hovan_J2.domain.user.entity.User;
import com.example.bankend_hovan_J2.domain.user.repository.UserRepository;
import com.example.bankend_hovan_J2.domain.user.valueobject.Email;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public class UserRepositoryImpl implements UserRepository {
    private final UserJpaRepository jpaRepository;

    public UserRepositoryImpl(UserJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public User save(User user) {
        UserEntityJpa entity = toEntity(user);
        UserEntityJpa saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<User> findByEmail(Email email) {
        return jpaRepository.findByEmail(email.getValue())
                .map(this::toDomain);
    }

    @Override
    public Optional<User> findByProviderAndProviderId(String provider, String providerId) {
        return jpaRepository.findByProviderAndProviderId(provider, providerId)
                .map(this::toDomain);
    }

    @Override
    public Optional<User> findById(Long id) {
        return jpaRepository.findById(id)
                .map(this::toDomain);
    }

    private UserEntityJpa toEntity(User user) {
        UserEntityJpa entity = new UserEntityJpa();
        entity.setId(user.getId());
        entity.setEmail(user.getEmail().getValue());
        entity.setName(user.getName());
        entity.setAvatarUrl(user.getAvatarUrl());
        entity.setProvider(user.getProvider());
        entity.setProviderId(user.getProviderId());
        entity.setUserType(user.getUserType());
        entity.setCreatedAt(user.getCreatedAt());
        entity.setUpdatedAt(user.getUpdatedAt());
        return entity;
    }

    private User toDomain(UserEntityJpa entity) {
        User user = new User(
            new Email(entity.getEmail()),
            entity.getName(),
            entity.getProvider(),
            entity.getProviderId(),
            entity.getUserType()
        );
        user.setId(entity.getId());
        user.setAvatarUrl(entity.getAvatarUrl());
        user.setCreatedAt(entity.getCreatedAt());
        user.setUpdatedAt(entity.getUpdatedAt());
        return user;
    }
}
