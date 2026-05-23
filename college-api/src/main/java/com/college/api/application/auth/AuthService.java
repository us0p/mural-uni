package com.college.api.application.auth;

import com.college.api.application.exception.InvalidCredentialsException;
import com.college.api.application.exception.InvalidTokenException;
import com.college.api.domain.email.EmailPort;
import com.college.api.domain.passwordreset.PasswordResetToken;
import com.college.api.domain.passwordreset.PasswordResetTokenRepository;
import com.college.api.domain.role.RolePermissionRepository;
import com.college.api.domain.user.User;
import com.college.api.domain.user.UserRepository;
import com.college.api.domain.util.TokenHashUtil;
import com.college.api.infrastructure.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RolePermissionRepository rolePermissionRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailPort emailPort;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${app.password-reset-token-expiry-hours:24}")
    private int tokenExpiryHours;

    public record LoginResult(
            String token,
            Integer userId,
            String username,
            String email,
            String phoneNumber,
            String ra,
            Integer roleId,
            String roleName,
            List<String> permissions
    ) {}

    public String reissueToken(String username, Integer userId, String role, List<String> permissions, int tokenVersion) {
        return jwtService.generateToken(username, userId, role, permissions, tokenVersion);
    }

    @Transactional(readOnly = true)
    public LoginResult login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(InvalidCredentialsException::new);
        if (user.getPasswordHash() == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }
        List<String> permissions = rolePermissionRepository.findByRoleId(user.getRole().getId())
                .stream()
                .map(rp -> rp.getPermission().getName())
                .toList();
        String token = jwtService.generateToken(
                user.getUsername(), user.getId(), user.getRole().getName(), permissions, user.getTokenVersion());
        return new LoginResult(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRa(),
                user.getRole().getId(),
                user.getRole().getName(),
                permissions
        );
    }

    @Transactional
    public void setPassword(String tokenValue, String newPassword) {
        String tokenHash = TokenHashUtil.sha256Hex(tokenValue);
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(tokenHash)
                .orElseThrow(InvalidTokenException::new);

        if (resetToken.getUsedAt() != null || resetToken.getExpiresAt().isBefore(Instant.now())) {
            throw new InvalidTokenException();
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        userRepository.incrementTokenVersion(user.getId());

        resetToken.setUsedAt(Instant.now());
        passwordResetTokenRepository.save(resetToken);
    }

    @Transactional
    public void requestPasswordReset(String email) {
        Optional<User> maybeUser = userRepository.findByEmail(email);
        if (maybeUser.isEmpty()) {
            return;
        }
        User user = maybeUser.get();

        try {
            passwordResetTokenRepository.invalidateUnusedByUserId(user.getId());

            String rawToken = generateRawToken();
            passwordResetTokenRepository.save(PasswordResetToken.builder()
                    .user(user)
                    .token(TokenHashUtil.sha256Hex(rawToken))
                    .expiresAt(Instant.now().plus(tokenExpiryHours, ChronoUnit.HOURS))
                    .build());

            String resetUrl = frontendUrl + "/redefinir-senha?token=" + rawToken;
            emailPort.sendPasswordResetEmail(email, user.getUsername(), resetUrl);
        } catch (Exception e) {
            log.warn("Failed to send password-reset email to '{}': {}", email, e.getClass().getSimpleName());
        }
    }

    @Transactional
    public void invalidateSessions(Integer userId) {
        userRepository.incrementTokenVersion(userId);
    }

    private static String generateRawToken() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }
}
