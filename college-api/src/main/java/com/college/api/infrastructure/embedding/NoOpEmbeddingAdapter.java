package com.college.api.infrastructure.embedding;

import com.college.api.domain.document.EmbeddingPort;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "ollama.enabled", havingValue = "false")
public class NoOpEmbeddingAdapter implements EmbeddingPort {

    @Override
    public float[] embed(String text) {
        throw new UnsupportedOperationException("Embedding is unavailable: Ollama is disabled on this server.");
    }
}
