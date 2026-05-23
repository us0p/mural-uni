package com.college.api.infrastructure.persistence.passwordreset;

import com.college.api.domain.passwordreset.PasswordResetToken;
import com.college.api.domain.passwordreset.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class PasswordResetTokenRepositoryAdapter implements PasswordResetTokenRepository {

    private final JpaPasswordResetTokenRepository jpa;

    @Override
    public PasswordResetToken save(PasswordResetToken token) {
        return jpa.save(token);
    }

    @Override
    public Optional<PasswordResetToken> findByToken(String token) {
        return jpa.findByToken(token);
    }

    @Override
    public void invalidateUnusedByUserId(Integer userId) {
        jpa.invalidateUnusedByUserId(userId, java.time.Instant.now());
    }
}
