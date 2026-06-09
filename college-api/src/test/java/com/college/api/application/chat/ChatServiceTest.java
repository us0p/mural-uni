package com.college.api.application.chat;

import com.college.api.domain.document.Document;
import com.college.api.domain.document.DocumentEmbedding;
import com.college.api.domain.document.DocumentEmbeddingRepository;
import com.college.api.domain.document.EmbeddingPort;
import com.college.api.domain.role.Role;
import com.college.api.domain.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock private EmbeddingPort embeddingPort;
    @Mock private DocumentEmbeddingRepository embeddingRepository;

    @InjectMocks
    private ChatService service;

    private static final float[] EMBEDDING = new float[768];
    private static final double THRESHOLD = 0.7;

    private final User user = User.builder().id(1).username("alice")
            .role(Role.builder().id(1).name("student").build()).build();

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "similarityThreshold", THRESHOLD);
    }

    private DocumentEmbedding buildChunk(int docId, String fileName, String chunkText, int chunkIndex, boolean isPublic) {
        Document doc = Document.builder().id(docId).user(user).fileName(fileName)
                .fileSize(100).bucketUrl("url").knowledgeBase(true).isPublic(isPublic).build();
        return DocumentEmbedding.builder()
                .id(docId).document(doc).chunkText(chunkText).chunkIndex(chunkIndex).embedding(EMBEDDING).build();
    }

    @Test
    void ask_withMatchingChunk_returnsChunkText() {
        DocumentEmbedding chunk = buildChunk(1, "notes.pdf", "relevant content about AI", 0, true);

        when(embeddingPort.embed("what is AI?")).thenReturn(EMBEDDING);
        when(embeddingRepository.findSimilarChunks(EMBEDDING, 5, THRESHOLD)).thenReturn(List.of(chunk));

        ChatService.ChatAnswer result = service.ask("what is AI?", 5);

        assertThat(result.answer()).isEqualTo("relevant content about AI");
        assertThat(result.sources()).hasSize(1);
        assertThat(result.sources().get(0).fileName()).isEqualTo("notes.pdf");
        assertThat(result.sources().get(0).chunkIndex()).isZero();
        assertThat(result.sources().get(0).isPublic()).isTrue();
    }

    @Test
    void ask_withMultipleChunks_joinsWithDoubleNewline() {
        DocumentEmbedding chunk1 = buildChunk(1, "doc1.pdf", "first chunk text", 0, true);
        DocumentEmbedding chunk2 = buildChunk(2, "doc2.pdf", "second chunk text", 1, false);

        when(embeddingPort.embed(any())).thenReturn(EMBEDDING);
        when(embeddingRepository.findSimilarChunks(EMBEDDING, 2, THRESHOLD)).thenReturn(List.of(chunk1, chunk2));

        ChatService.ChatAnswer result = service.ask("question", 2);

        assertThat(result.answer()).isEqualTo("first chunk text\n\nsecond chunk text");
        assertThat(result.sources()).hasSize(2);
    }

    @Test
    void ask_withMultipleChunksFromSameDocument_deduplicatesSources() {
        DocumentEmbedding chunk1 = buildChunk(1, "doc.pdf", "first chunk", 0, true);
        DocumentEmbedding chunk2 = buildChunk(1, "doc.pdf", "second chunk", 1, true);

        when(embeddingPort.embed(any())).thenReturn(EMBEDDING);
        when(embeddingRepository.findSimilarChunks(EMBEDDING, 5, THRESHOLD)).thenReturn(List.of(chunk1, chunk2));

        ChatService.ChatAnswer result = service.ask("question", 5);

        assertThat(result.answer()).isEqualTo("first chunk\n\nsecond chunk");
        assertThat(result.sources()).hasSize(1);
        assertThat(result.sources().get(0).documentId()).isEqualTo(1);
    }

    @Test
    void ask_withNoChunks_returnsFallbackMessage() {
        when(embeddingPort.embed(any())).thenReturn(EMBEDDING);
        when(embeddingRepository.findSimilarChunks(EMBEDDING, 5, THRESHOLD)).thenReturn(List.of());

        ChatService.ChatAnswer result = service.ask("unknown topic", 5);

        assertThat(result.answer()).isEqualTo("Eu não tenho essa informação na minha base de dados.");
        assertThat(result.sources()).isEmpty();
    }

    @Test
    void ask_whenEmbeddingFails_throwsException() {
        when(embeddingPort.embed(any())).thenThrow(new RuntimeException("Ollama down"));

        assertThatThrownBy(() -> service.ask("question", 5))
                .hasMessage("Ollama down");

        verifyNoInteractions(embeddingRepository);
    }
}
