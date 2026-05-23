package com.college.api.domain.email;

public interface EmailPort {
    void sendSetPasswordEmail(String toEmail, String username, String setPasswordUrl);
    void sendPasswordResetEmail(String toEmail, String username, String resetUrl);
}
