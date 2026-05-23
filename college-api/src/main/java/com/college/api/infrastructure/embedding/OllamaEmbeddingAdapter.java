package com.college.api.infrastructure.embedding;

import com.college.api.domain.document.EmbeddingPort;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Component
@ConditionalOnProperty(name = "ollama.enabled", havingValue = "true", matchIfMissing = true)
public class OllamaEmbeddingAdapter implements EmbeddingPort {

    private final RestTemplate restTemplate;
    private final String baseUrl;
    private final String model;

    public OllamaEmbeddingAdapter(
            @Qualifier("ollamaRestTemplate") RestTemplate restTemplate,
            @Value("${ollama.base-url}") String baseUrl,
            @Value("${ollama.model}") String model) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
        this.model = model;
    }

    @Override
    public float[] embed(String text) {
        EmbedResponse response = restTemplate.postForObject(
                baseUrl + "/api/embed",
                new EmbedRequest(model, text),
                EmbedResponse.class);
        List<Float> floats = response.embeddings().get(0);
        float[] result = new float[floats.size()];
        for (int i = 0; i < floats.size(); i++) {
            result[i] = floats.get(i);
        }
        return result;
    }

    record EmbedRequest(String model, String input) {}

    record EmbedResponse(List<List<Float>> embeddings) {}
}
