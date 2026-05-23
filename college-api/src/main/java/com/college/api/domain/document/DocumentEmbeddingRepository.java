package com.college.api.domain.document;

import java.util.List;

public interface DocumentEmbeddingRepository {
    List<DocumentEmbedding> saveAll(List<DocumentEmbedding> embeddings);
    List<DocumentEmbedding> findSimilarChunks(float[] queryEmbedding, int limit);
}
