package com.example.bankend_hovan_J2.domain.user.repository;

import com.example.bankend_hovan_J2.domain.user.entity.User;
import com.example.bankend_hovan_J2.domain.user.valueobject.Email;
import java.util.Optional;

public interface UserRepository {
    User save(User user);
    Optional<User> findByEmail(Email email);
    Optional<User> findByProviderAndProviderId(String provider, String providerId);
    Optional<User> findById(Long id);
}
