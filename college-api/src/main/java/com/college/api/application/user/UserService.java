package com.college.api.application.user;

import com.college.api.application.exception.ForbiddenOperationException;
import com.college.api.application.exception.ResourceNotFoundException;
import com.college.api.domain.email.EmailPort;
import com.college.api.domain.passwordreset.PasswordResetToken;
import com.college.api.domain.passwordreset.PasswordResetTokenRepository;
import com.college.api.domain.role.Role;
import com.college.api.domain.role.RoleRepository;
import com.college.api.domain.user.User;
import com.college.api.domain.user.UserPage;
import com.college.api.domain.user.UserRepository;
import com.college.api.domain.util.TokenHashUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EmailPort emailPort;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${app.password-reset-token-expiry-hours:24}")
    private int tokenExpiryHours;

    @Transactional(readOnly = true)
    public UserPage findFiltered(String searchParam, int page, int size) {
        return userRepository.findFiltered(searchParam, page, size);
    }

    @Transactional(readOnly = true)
    public User findById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    @Transactional
    public User create(String username, String email, String phoneNumber, Integer roleId, String ra) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", roleId));
        User user = User.builder()
                .username(username)
                .email(email)
                .phoneNumber(phoneNumber)
                .role(role)
                .ra(ra)
                .build();
        return userRepository.save(user);
    }

    // Called after the create transaction commits so a failure never rolls back the saved user.
    @Transactional
    public void sendSetPasswordEmail(Integer userId, String email, String username) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", userId));

            String rawToken = generateRawToken();
            passwordResetTokenRepository.save(PasswordResetToken.builder()
                    .user(user)
                    .token(TokenHashUtil.sha256Hex(rawToken))
                    .expiresAt(Instant.now().plus(tokenExpiryHours, ChronoUnit.HOURS))
                    .build());

            String setPasswordUrl = frontendUrl + "/criar-senha?token=" + rawToken;
            emailPort.sendSetPasswordEmail(email, username, setPasswordUrl);
        } catch (Exception e) {
            log.warn("Failed to send set-password email to '{}': {}", email, e.getClass().getSimpleName());
        }
    }

    @Transactional
    public User update(Integer id, String username, String email, String phoneNumber, Integer roleId, String ra) {
        User user = findById(id);
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", roleId));
        user.setUsername(username);
        user.setEmail(email);
        user.setPhoneNumber(phoneNumber);
        user.setRole(role);
        user.setRa(ra);
        return userRepository.save(user);
    }

    @Transactional
    public void delete(Integer id, Integer requestingUserId) {
        if (id.equals(requestingUserId)) {
            throw new ForbiddenOperationException("Você não pode excluir sua própria conta.");
        }
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User", id);
        }
        userRepository.deleteById(id);
    }

    private static String generateRawToken() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }
}
