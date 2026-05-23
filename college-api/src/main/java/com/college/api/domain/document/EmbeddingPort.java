package com.college.api.domain.document;

public interface EmbeddingPort {
    float[] embed(String text);
}
