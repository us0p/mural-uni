package com.college.api.presentation.chat;

import com.college.api.application.chat.ChatService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ChatController.class)
@AutoConfigureMockMvc(addFilters = false)
class ChatControllerTest {

    @Autowired MockMvc mockMvc;
    @MockBean ChatService service;

    @Test
    void POST_chat_returnsAnswerWithSources() throws Exception {
        ChatService.ChatAnswer answer = new ChatService.ChatAnswer(
                "AI is artificial intelligence.",
                List.of(new ChatService.SourceChunk(1, "notes.pdf", 0, true)));
        when(service.ask("what is AI?", 5)).thenReturn(answer);

        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"question": "what is AI?"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answer").value("AI is artificial intelligence."))
                .andExpect(jsonPath("$.sources[0].fileName").value("notes.pdf"))
                .andExpect(jsonPath("$.sources[0].chunkIndex").value(0))
                .andExpect(jsonPath("$.sources[0].documentId").value(1));
    }

    @Test
    void POST_chat_withExplicitContextChunks_passesValueToService() throws Exception {
        ChatService.ChatAnswer answer = new ChatService.ChatAnswer("answer", List.of());
        when(service.ask("my question", 3)).thenReturn(answer);

        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"question": "my question", "contextChunks": 3}
                                """))
                .andExpect(status().isOk());

        verify(service).ask("my question", 3);
    }

    @Test
    void POST_chat_withNullContextChunks_defaultsToFive() throws Exception {
        ChatService.ChatAnswer answer = new ChatService.ChatAnswer("answer", List.of());
        when(service.ask("my question", 5)).thenReturn(answer);

        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"question": "my question"}
                                """))
                .andExpect(status().isOk());

        verify(service).ask("my question", 5);
    }

    @Test
    void POST_chat_withBlankQuestion_returns400() throws Exception {
        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"question": ""}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void POST_chat_withMissingQuestion_returns400() throws Exception {
        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void POST_chat_withContextChunksBelowMin_returns400() throws Exception {
        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"question": "question", "contextChunks": 0}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void POST_chat_withContextChunksAboveMax_returns400() throws Exception {
        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"question": "question", "contextChunks": 11}
                                """))
                .andExpect(status().isBadRequest());
    }
}
