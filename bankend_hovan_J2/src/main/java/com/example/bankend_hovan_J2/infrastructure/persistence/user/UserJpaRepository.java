package com.example.bankend_hovan_J2.infrastructure.persistence.user;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserJpaRepository extends JpaRepository<UserEntityJpa, Long> {
    Optional<UserEntityJpa> findByEmail(String email);
    Optional<UserEntityJpa> findByProviderAndProviderId(String provider, String providerId);
}
