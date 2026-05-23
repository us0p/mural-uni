package com.college.api.infrastructure.embedding;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import static org.assertj.core.api.Assertions.*;
import static org.assertj.core.api.Assertions.within;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class OllamaEmbeddingAdapterTest {

    private MockRestServiceServer server;
    private OllamaEmbeddingAdapter adapter;

    @BeforeEach
    void setUp() {
        RestTemplate restTemplate = new RestTemplate();
        server = MockRestServiceServer.createServer(restTemplate);
        adapter = new OllamaEmbeddingAdapter(restTemplate, "http://localhost:11434", "nomic-embed-text");
    }

    @Test
    void embed_sendsPostToOllamaAndReturnsFloatArray() {
        server.expect(requestTo("http://localhost:11434/api/embed"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andRespond(withSuccess(
                        "{\"embeddings\": [[0.1, 0.2, 0.3]]}",
                        MediaType.APPLICATION_JSON));

        float[] result = adapter.embed("document text");

        server.verify();
        assertThat(result).hasSize(3);
        assertThat(result[0]).isCloseTo(0.1f, within(0.001f));
        assertThat(result[1]).isCloseTo(0.2f, within(0.001f));
        assertThat(result[2]).isCloseTo(0.3f, within(0.001f));
    }

    @Test
    void embed_whenOllamaReturnsServerError_throwsException() {
        server.expect(requestTo("http://localhost:11434/api/embed"))
                .andRespond(withServerError());

        assertThatThrownBy(() -> adapter.embed("text"))
                .isInstanceOf(Exception.class);
    }
}
