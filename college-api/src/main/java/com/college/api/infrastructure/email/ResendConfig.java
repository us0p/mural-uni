package com.college.api.infrastructure.email;

import com.college.api.domain.email.EmailPort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ResendConfig {

    @Value("${resend.api-key:}")
    private String apiKey;

    @Value("${resend.from-email:noreply@example.com}")
    private String fromEmail;

    @Bean
    @ConditionalOnExpression("!'${resend.api-key:}'.isBlank()")
    public EmailPort resendEmailAdapter() {
        return new ResendEmailAdapter(apiKey, fromEmail);
    }

    @Bean
    @ConditionalOnMissingBean(EmailPort.class)
    public EmailPort noOpEmailAdapter() {
        return new NoOpEmailAdapter();
    }
}
