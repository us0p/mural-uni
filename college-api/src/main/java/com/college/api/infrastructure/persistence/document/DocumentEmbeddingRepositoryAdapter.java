package com.college.api.infrastructure.persistence.document;

import com.college.api.domain.document.DocumentEmbedding;
import com.college.api.domain.document.DocumentEmbeddingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class DocumentEmbeddingRepositoryAdapter implements DocumentEmbeddingRepository {

    private static final String SIMILARITY_SQL = """
            SELECT de.id
            FROM document_embedding de
            JOIN documents d ON d.id = de.document_id
            WHERE d.knowledge_base = true
              AND de.embedding <=> CAST(? AS vector) <= ?
            ORDER BY de.embedding <=> CAST(? AS vector)
            LIMIT ?
            """;

    private final JpaDocumentEmbeddingRepository jpa;
    private final JdbcTemplate jdbc;

    @Override
    public List<DocumentEmbedding> saveAll(List<DocumentEmbedding> embeddings) {
        return jpa.saveAll(embeddings);
    }

    @Override
    public List<DocumentEmbedding> findSimilarChunks(float[] queryEmbedding, int limit, double similarityThreshold) {
        String vectorStr = toVectorString(queryEmbedding);
        List<Integer> ids = jdbc.queryForList(SIMILARITY_SQL, Integer.class,
                vectorStr, similarityThreshold, vectorStr, limit);
        if (ids.isEmpty()) return List.of();
        Map<Integer, DocumentEmbedding> byId = jpa.findAllById(ids).stream()
                .collect(Collectors.toMap(DocumentEmbedding::getId, e -> e));
        return ids.stream()
                .map(byId::get)
                .filter(Objects::nonNull)
                .toList();
    }

    private String toVectorString(float[] embedding) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < embedding.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(embedding[i]);
        }
        return sb.append("]").toString();
    }
}
