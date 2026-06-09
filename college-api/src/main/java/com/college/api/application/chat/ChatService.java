package com.college.api.application.chat;

import com.college.api.domain.document.DocumentEmbedding;
import com.college.api.domain.document.DocumentEmbeddingRepository;
import com.college.api.domain.document.EmbeddingPort;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final EmbeddingPort embeddingPort;
    private final DocumentEmbeddingRepository embeddingRepository;

    @Value("${chat.similarity-threshold:0.7}")
    private double similarityThreshold;

    public record SourceChunk(Integer documentId, String fileName, int chunkIndex, boolean isPublic) {}

    public record ChatAnswer(String answer, List<SourceChunk> sources) {}

    @Transactional(readOnly = true)
    public ChatAnswer ask(String question, int contextChunks) {
        float[] queryEmbedding = embeddingPort.embed(question);
        List<DocumentEmbedding> chunks = embeddingRepository.findSimilarChunks(
                queryEmbedding, contextChunks, similarityThreshold);
        log.info("question='{}' retrieved {} chunks above threshold {}", question, chunks.size(), similarityThreshold);

        String answer;
        if (chunks.isEmpty()) {
            answer = "Eu não tenho essa informação na minha base de dados.";
        } else {
            answer = chunks.stream()
                    .map(DocumentEmbedding::getChunkText)
                    .collect(Collectors.joining("\n\n"));
        }

        List<SourceChunk> sources = chunks.stream()
                .collect(Collectors.toMap(
                        c -> c.getDocument().getId(),
                        c -> new SourceChunk(
                                c.getDocument().getId(),
                                c.getDocument().getFileName(),
                                c.getChunkIndex(),
                                c.getDocument().isPublic()),
                        (a, b) -> a,
                        LinkedHashMap::new))
                .values()
                .stream()
                .toList();

        return new ChatAnswer(answer, sources);
    }
}
