package com.college.api.domain.chat;

public interface ChatPort {
    String chat(String systemPrompt, String userMessage);
}
