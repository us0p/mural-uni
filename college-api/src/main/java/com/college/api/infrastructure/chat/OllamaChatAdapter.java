package com.college.api.infrastructure.chat;

import com.college.api.domain.chat.ChatPort;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Component
@ConditionalOnProperty(name = "ollama.enabled", havingValue = "true", matchIfMissing = true)
public class OllamaChatAdapter implements ChatPort {

    private final RestTemplate restTemplate;
    private final String baseUrl;
    private final String model;

    public OllamaChatAdapter(
            @Qualifier("ollamaRestTemplate") RestTemplate restTemplate,
            @Value("${ollama.base-url}") String baseUrl,
            @Value("${ollama.chat-model}") String model) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
        this.model = model;
    }

    @Override
    public String chat(String systemPrompt, String userMessage) {
        ChatRequest request = new ChatRequest(model, List.of(
                new Message("system", systemPrompt),
                new Message("user", userMessage)
        ), false);
        ChatResponse response = restTemplate.postForObject(
                baseUrl + "/api/chat",
                request,
                ChatResponse.class);
        return response.message().content();
    }

    record Message(String role, String content) {}

    record ChatRequest(String model, List<Message> messages, boolean stream) {}

    record ChatResponse(Message message, boolean done) {}
}
