package com.college.api.infrastructure.chat;

import com.college.api.domain.chat.ChatPort;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "ollama.enabled", havingValue = "false")
public class NoOpChatAdapter implements ChatPort {

    @Override
    public String chat(String systemPrompt, String userMessage) {
        throw new UnsupportedOperationException("Chat is unavailable: Ollama is disabled on this server.");
    }
}
