package com.college.api.presentation.chat;

import com.college.api.application.chat.ChatService;

import java.util.List;

public record ChatResponse(String answer, List<SourceChunk> sources) {

    public record SourceChunk(Integer documentId, String fileName, int chunkIndex) {}

    public static ChatResponse from(ChatService.ChatAnswer result) {
        return new ChatResponse(
                result.answer(),
                result.sources().stream()
                        .map(s -> new SourceChunk(s.documentId(), s.fileName(), s.chunkIndex()))
                        .toList());
    }
}
