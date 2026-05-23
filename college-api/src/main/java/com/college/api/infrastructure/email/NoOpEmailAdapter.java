package com.college.api.infrastructure.email;

import com.college.api.domain.email.EmailPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class NoOpEmailAdapter implements EmailPort {

    private static final Logger log = LoggerFactory.getLogger(NoOpEmailAdapter.class);

    @Override
    public void sendSetPasswordEmail(String toEmail, String username, String setPasswordUrl) {
        log.warn("SES not configured — skipping set-password email to '{}'. URL: {}", toEmail, setPasswordUrl);
    }

    @Override
    public void sendPasswordResetEmail(String toEmail, String username, String resetUrl) {
        log.warn("SES not configured — skipping password-reset email to '{}'. URL: {}", toEmail, resetUrl);
    }
}
