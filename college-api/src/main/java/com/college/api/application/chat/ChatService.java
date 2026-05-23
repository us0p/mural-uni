package com.college.api.application.chat;

import com.college.api.domain.chat.ChatPort;
import com.college.api.domain.document.DocumentEmbedding;
import com.college.api.domain.document.DocumentEmbeddingRepository;
import com.college.api.domain.document.EmbeddingPort;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private static final String SYSTEM_PROMPT_TEMPLATE = """
            You are a helpful assistant for a college institution.
            Answer the user's question using only the information provided in the context below.
            If the context does not contain enough information, say so clearly — do not speculate or fabricate information.

            Context from knowledge base:
            ---
            %s
            ---
            """;

    private static final String NO_CONTEXT_PROMPT = """
            You are a helpful assistant for a college institution.
            No relevant documents were found in the knowledge base for this question.
            Inform the user that no relevant context is available and suggest they contact the institution directly.
            """;

    private final EmbeddingPort embeddingPort;
    private final DocumentEmbeddingRepository embeddingRepository;
    private final ChatPort chatPort;

    public record SourceChunk(Integer documentId, String fileName, int chunkIndex) {}

    public record ChatAnswer(String answer, List<SourceChunk> sources) {}

    @Transactional(readOnly = true)
    public ChatAnswer ask(String question, int contextChunks) {
        float[] queryEmbedding = embeddingPort.embed(question);
        List<DocumentEmbedding> chunks = embeddingRepository.findSimilarChunks(queryEmbedding, contextChunks);
        log.info("question='{}' retrieved {} chunks", question, chunks.size());
        chunks.forEach(c -> log.info("  chunk doc='{}' idx={} preview='{}'",
                c.getDocument().getFileName(),
                c.getChunkIndex(),
                c.getChunkText().substring(0, Math.min(120, c.getChunkText().length()))));

        String systemPrompt;
        if (chunks.isEmpty()) {
            log.warn("No chunks found — LLM will answer without knowledge-base context");
            systemPrompt = NO_CONTEXT_PROMPT;
        } else {
            String context = chunks.stream()
                    .map(c -> String.format("[Source: %s | Chunk %d]\n%s",
                            c.getDocument().getFileName(),
                            c.getChunkIndex(),
                            c.getChunkText()))
                    .collect(Collectors.joining("\n\n"));
            systemPrompt = String.format(SYSTEM_PROMPT_TEMPLATE, context);
        }

        String answer = chatPort.chat(systemPrompt, question);
        List<SourceChunk> sources = chunks.stream()
                .collect(Collectors.toMap(
                        c -> c.getDocument().getId(),
                        c -> new SourceChunk(
                                c.getDocument().getId(),
                                c.getDocument().getFileName(),
                                c.getChunkIndex()),
                        (a, b) -> a,
                        LinkedHashMap::new))
                .values()
                .stream()
                .toList();

        return new ChatAnswer(answer, sources);
    }
}
