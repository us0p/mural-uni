package com.college.api.infrastructure.email;

import com.college.api.domain.email.EmailPort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.ses.SesClient;

@Configuration
public class SesConfig {

    @Value("${aws.ses.region:}")
    private String region;

    @Value("${aws.ses.from-email:noreply@example.com}")
    private String fromEmail;

    @Bean
    @ConditionalOnExpression("!'${aws.ses.region:}'.isBlank()")
    public SesClient sesClient() {
        return SesClient.builder()
                .region(Region.of(region))
                .build();
    }

    @Bean
    @ConditionalOnExpression("!'${aws.ses.region:}'.isBlank()")
    public EmailPort sesEmailAdapter(SesClient sesClient) {
        return new SesEmailAdapter(sesClient, fromEmail);
    }

    @Bean
    @ConditionalOnMissingBean(EmailPort.class)
    public EmailPort noOpEmailAdapter() {
        return new NoOpEmailAdapter();
    }
}
