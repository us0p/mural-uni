package com.college.api.application.bootstrap;

import com.college.api.domain.role.Role;
import com.college.api.domain.role.RoleRepository;
import com.college.api.domain.user.User;
import com.college.api.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class AdminUserBootstrap {

    private static final Logger log = LoggerFactory.getLogger(AdminUserBootstrap.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username}")
    private String adminUsername;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @EventListener(ApplicationReadyEvent.class)
    public void seed() {
        try {
            if (userRepository.findByUsername(adminUsername).isPresent()) {
                return;
            }
            Role adminRole = roleRepository.findByName("admin")
                    .orElseThrow(() -> new IllegalStateException("Admin role not found — ensure migrations have run."));
            userRepository.save(User.builder()
                    .username(adminUsername)
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .email(adminEmail)
                    .role(adminRole)
                    .build());
            log.info("Admin user '{}' created.", adminUsername);
        } catch (Exception e) {
            log.error("Admin bootstrap skipped: {}", e.getMessage());
        }
    }
}
