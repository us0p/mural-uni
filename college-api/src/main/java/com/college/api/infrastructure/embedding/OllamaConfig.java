package com.college.api.infrastructure.embedding;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class OllamaConfig {

    @Bean
    public RestTemplate ollamaRestTemplate() {
        return new RestTemplate();
    }
}
