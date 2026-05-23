package com.college.api.domain.passwordreset;

import java.util.Optional;

public interface PasswordResetTokenRepository {
    PasswordResetToken save(PasswordResetToken token);
    Optional<PasswordResetToken> findByToken(String token);
    void invalidateUnusedByUserId(Integer userId);
}
