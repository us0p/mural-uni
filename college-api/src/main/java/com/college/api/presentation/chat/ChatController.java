package com.college.api.presentation.chat;

import com.college.api.application.chat.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Chat", description = "RAG-powered LLM chat grounded in the knowledge base")
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService service;

    @Operation(
            summary = "Ask a question",
            description = "Retrieves the most relevant document chunks from the knowledge base, injects them as context into a system prompt, and forwards the question to the configured LLM.")
    @ApiResponse(responseCode = "200", description = "LLM answer with source attribution")
    @ApiResponse(responseCode = "400", description = "Validation error",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @PreAuthorize("hasAuthority('admin')")
    @PostMapping
    public ChatResponse chat(@RequestBody @Valid ChatRequest request) {
        int chunks = request.contextChunks() != null ? request.contextChunks() : 5;
        return ChatResponse.from(service.ask(request.question(), chunks));
    }
}
