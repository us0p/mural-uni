package com.college.api.infrastructure.chat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class OllamaChatAdapterTest {

    private MockRestServiceServer server;
    private OllamaChatAdapter adapter;

    @BeforeEach
    void setUp() {
        RestTemplate restTemplate = new RestTemplate();
        server = MockRestServiceServer.createServer(restTemplate);
        adapter = new OllamaChatAdapter(restTemplate, "http://localhost:11434", "llama3.2");
    }

    @Test
    void chat_sendsSystemAndUserMessagesAndReturnsAssistantContent() {
        server.expect(requestTo("http://localhost:11434/api/chat"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andRespond(withSuccess(
                        """
                        {"message":{"role":"assistant","content":"The answer is 42."},"done":true}
                        """,
                        MediaType.APPLICATION_JSON));

        String result = adapter.chat("You are a helpful assistant.", "What is the answer?");

        server.verify();
        assertThat(result).isEqualTo("The answer is 42.");
    }

    @Test
    void chat_whenOllamaReturnsServerError_throwsException() {
        server.expect(requestTo("http://localhost:11434/api/chat"))
                .andRespond(withServerError());

        assertThatThrownBy(() -> adapter.chat("system prompt", "user message"))
                .isInstanceOf(Exception.class);
    }
}
