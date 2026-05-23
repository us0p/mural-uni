package com.college.api.application.chat;

import com.college.api.domain.chat.ChatPort;
import com.college.api.domain.document.Document;
import com.college.api.domain.document.DocumentEmbedding;
import com.college.api.domain.document.DocumentEmbeddingRepository;
import com.college.api.domain.document.EmbeddingPort;
import com.college.api.domain.role.Role;
import com.college.api.domain.user.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock private EmbeddingPort embeddingPort;
    @Mock private DocumentEmbeddingRepository embeddingRepository;
    @Mock private ChatPort chatPort;

    @InjectMocks
    private ChatService service;

    private static final float[] EMBEDDING = new float[768];

    private final User user = User.builder().id(1).username("alice")
            .role(Role.builder().id(1).name("student").build()).build();

    private DocumentEmbedding buildChunk(int docId, String fileName, String chunkText, int chunkIndex) {
        Document doc = Document.builder().id(docId).user(user).fileName(fileName)
                .fileSize(100).bucketUrl("https://bucket/file").knowledgeBase(true).build();
        return DocumentEmbedding.builder()
                .id(docId).document(doc).chunkText(chunkText).chunkIndex(chunkIndex).embedding(EMBEDDING).build();
    }

    @Test
    void ask_withChunks_injectsContextIntoPromptAndReturnsAnswer() {
        DocumentEmbedding chunk = buildChunk(1, "notes.pdf", "relevant content about AI", 0);

        when(embeddingPort.embed("what is AI?")).thenReturn(EMBEDDING);
        when(embeddingRepository.findSimilarChunks(EMBEDDING, 5)).thenReturn(List.of(chunk));
        when(chatPort.chat(any(), eq("what is AI?"))).thenReturn("AI is artificial intelligence.");

        ChatService.ChatAnswer result = service.ask("what is AI?", 5);

        assertThat(result.answer()).isEqualTo("AI is artificial intelligence.");
        assertThat(result.sources()).hasSize(1);
        assertThat(result.sources().get(0).fileName()).isEqualTo("notes.pdf");
        assertThat(result.sources().get(0).chunkIndex()).isZero();
        verify(chatPort).chat(
                argThat(prompt -> prompt.contains("relevant content about AI") && prompt.contains("notes.pdf")),
                eq("what is AI?"));
    }

    @Test
    void ask_withNoChunks_usesNoContextPromptAndReturnsAnswer() {
        when(embeddingPort.embed(any())).thenReturn(EMBEDDING);
        when(embeddingRepository.findSimilarChunks(EMBEDDING, 5)).thenReturn(List.of());
        when(chatPort.chat(any(), any())).thenReturn("No relevant information found.");

        ChatService.ChatAnswer result = service.ask("unknown topic", 5);

        assertThat(result.answer()).isEqualTo("No relevant information found.");
        assertThat(result.sources()).isEmpty();
        verify(chatPort).chat(
                argThat(prompt -> prompt.contains("No relevant documents")),
                eq("unknown topic"));
    }

    @Test
    void ask_withMultipleChunks_includesAllInContext() {
        DocumentEmbedding chunk1 = buildChunk(1, "doc1.pdf", "first chunk text", 0);
        DocumentEmbedding chunk2 = buildChunk(2, "doc2.pdf", "second chunk text", 1);

        when(embeddingPort.embed(any())).thenReturn(EMBEDDING);
        when(embeddingRepository.findSimilarChunks(EMBEDDING, 2)).thenReturn(List.of(chunk1, chunk2));
        when(chatPort.chat(any(), any())).thenReturn("Combined answer.");

        ChatService.ChatAnswer result = service.ask("question", 2);

        assertThat(result.sources()).hasSize(2);
        verify(chatPort).chat(
                argThat(prompt -> prompt.contains("first chunk text") && prompt.contains("second chunk text")),
                any());
    }

    @Test
    void ask_whenEmbeddingFails_throwsException() {
        when(embeddingPort.embed(any())).thenThrow(new RuntimeException("Ollama down"));

        assertThatThrownBy(() -> service.ask("question", 5))
                .hasMessage("Ollama down");

        verifyNoInteractions(embeddingRepository, chatPort);
    }

    @Test
    void ask_whenChatFails_throwsException() {
        when(embeddingPort.embed(any())).thenReturn(EMBEDDING);
        when(embeddingRepository.findSimilarChunks(any(), anyInt())).thenReturn(List.of());
        when(chatPort.chat(any(), any())).thenThrow(new RuntimeException("LLM error"));

        assertThatThrownBy(() -> service.ask("question", 5))
                .hasMessage("LLM error");
    }
}
