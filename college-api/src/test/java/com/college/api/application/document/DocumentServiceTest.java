package com.college.api.application.document;

import com.college.api.application.exception.ForbiddenOperationException;
import com.college.api.application.exception.ResourceNotFoundException;
import com.college.api.domain.document.*;
import com.college.api.domain.role.Role;
import com.college.api.domain.user.User;
import com.college.api.domain.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock private DocumentRepository documentRepository;
    @Mock private DocumentEmbeddingRepository embeddingRepository;
    @Mock private DocumentRecipientRepository recipientRepository;
    @Mock private UserRepository userRepository;
    @Mock private DocumentStoragePort storagePort;
    @Mock private DocumentTextExtractor textExtractor;
    @Mock private TextSplitter textSplitter;
    @Mock private EmbeddingPort embeddingPort;

    @InjectMocks
    private DocumentService service;

    private final User admin = User.builder().id(1).username("alice")
            .role(Role.builder().id(1).name("admin").build()).build();
    private final User aluno = User.builder().id(2).username("bob")
            .role(Role.builder().id(2).name("aluno").build()).build();

    private static final byte[] CONTENT = new byte[]{1, 2, 3};
    private static final float[] EMBEDDING = new float[768];

    private Document buildDoc(User owner) {
        return Document.builder().id(1).user(owner).fileName("report.pdf")
                .fileSize(1024).bucketUrl("https://storage.example.com/uuid_report.pdf").build();
    }

    @Test
    void findAll_returnsAllDocuments() {
        Document doc = buildDoc(admin);
        when(documentRepository.findAll()).thenReturn(List.of(doc));
        when(recipientRepository.findByDocumentId(1)).thenReturn(Optional.empty());

        List<DocumentService.DocumentWithRecipient> result = service.findAll();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).document()).isEqualTo(doc);
        assertThat(result.get(0).recipient()).isNull();
    }

    @Test
    void create_withKnowledgeBase_splitsTextAndSavesChunkEmbeddings() {
        String storageUrl = "https://storage.example.com/uuid_report.pdf";
        String extractedText = "lecture notes on data structures";
        List<String> chunks = List.of("lecture notes", "on data structures");
        Document saved = Document.builder().id(1).user(admin).fileName("report.pdf")
                .fileSize(3).bucketUrl(storageUrl).knowledgeBase(true).build();

        when(userRepository.findById(1)).thenReturn(Optional.of(admin));
        when(storagePort.upload("report.pdf", CONTENT, "application/pdf")).thenReturn(storageUrl);
        when(documentRepository.save(any())).thenReturn(saved);
        when(textExtractor.extract(CONTENT, "application/pdf")).thenReturn(extractedText);
        when(textSplitter.split(extractedText)).thenReturn(chunks);
        when(embeddingPort.embed(any())).thenReturn(EMBEDDING);
        when(embeddingRepository.saveAll(any())).thenReturn(List.of());

        DocumentService.DocumentWithRecipient result =
                service.create(1, "report.pdf", "Annual report", CONTENT, "application/pdf", 3, true, false, null);

        assertThat(result.document().getBucketUrl()).isEqualTo(storageUrl);
        assertThat(result.recipient()).isNull();
        verify(textExtractor).extract(CONTENT, "application/pdf");
        verify(textSplitter).split(extractedText);
        verify(embeddingPort, times(chunks.size())).embed(any());
        verify(embeddingRepository).saveAll(argThat(list -> list.size() == chunks.size()));
    }

    @Test
    void create_withoutKnowledgeBase_skipsExtractionAndEmbedding() {
        String storageUrl = "https://storage.example.com/uuid_report.pdf";
        Document saved = Document.builder().id(1).user(admin).fileName("report.pdf")
                .fileSize(3).bucketUrl(storageUrl).knowledgeBase(false).build();

        when(userRepository.findById(1)).thenReturn(Optional.of(admin));
        when(storagePort.upload(any(), any(), any())).thenReturn(storageUrl);
        when(documentRepository.save(any())).thenReturn(saved);

        DocumentService.DocumentWithRecipient result =
                service.create(1, "report.pdf", "Annual report", CONTENT, "application/pdf", 3, false, false, null);

        assertThat(result.document().getBucketUrl()).isEqualTo(storageUrl);
        verifyNoInteractions(textExtractor, textSplitter, embeddingPort, embeddingRepository);
    }

    @Test
    void create_withRecipient_savesRecipientAndForcesKnowledgeBaseFalse() {
        String storageUrl = "https://storage.example.com/uuid_report.pdf";
        Document saved = Document.builder().id(1).user(admin).fileName("report.pdf")
                .fileSize(3).bucketUrl(storageUrl).knowledgeBase(false).build();
        DocumentRecipient savedRecipient = DocumentRecipient.builder()
                .id(1).document(saved).recipient(aluno).build();

        when(userRepository.findById(1)).thenReturn(Optional.of(admin));
        when(userRepository.findById(2)).thenReturn(Optional.of(aluno));
        when(storagePort.upload(any(), any(), any())).thenReturn(storageUrl);
        when(documentRepository.save(any())).thenReturn(saved);
        when(recipientRepository.save(any())).thenReturn(savedRecipient);

        DocumentService.DocumentWithRecipient result =
                service.create(1, "report.pdf", null, CONTENT, "application/pdf", 3, true, false, 2);

        assertThat(result.recipient()).isNotNull();
        assertThat(result.recipient().getRecipient().getUsername()).isEqualTo("bob");
        verify(recipientRepository).save(any());
        verifyNoInteractions(textExtractor, textSplitter, embeddingPort, embeddingRepository);
    }

    @Test
    void create_withNonAlunoRecipient_throwsForbiddenOperationException() {
        User professor = User.builder().id(3).username("prof")
                .role(Role.builder().id(3).name("professor").build()).build();
        when(userRepository.findById(1)).thenReturn(Optional.of(admin));
        when(userRepository.findById(3)).thenReturn(Optional.of(professor));

        assertThatThrownBy(() -> service.create(1, "f.pdf", null, CONTENT, "application/pdf", 3, false, false, 3))
                .isInstanceOf(ForbiddenOperationException.class);

        verifyNoInteractions(storagePort, documentRepository);
    }

    @Test
    void create_whenTextExtractionFails_deletesFromStorage() {
        when(userRepository.findById(1)).thenReturn(Optional.of(admin));
        when(storagePort.upload(any(), any(), any())).thenReturn("https://storage.example.com/key");
        when(documentRepository.save(any())).thenReturn(
                Document.builder().id(1).user(admin).fileName("f.pdf").fileSize(3)
                        .knowledgeBase(true)
                        .bucketUrl("https://storage.example.com/key").build());
        when(textExtractor.extract(any(), any())).thenThrow(new RuntimeException("Tika error"));

        assertThatThrownBy(() -> service.create(1, "f.pdf", null, CONTENT, "application/pdf", 3, true, false, null))
                .hasMessage("Tika error");

        verify(storagePort).delete("key");
        verifyNoInteractions(textSplitter, embeddingPort, embeddingRepository);
    }

    @Test
    void create_whenUserNotFound_throwsResourceNotFoundException() {
        when(userRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(99, "f.pdf", null, CONTENT, "application/pdf", 3, false, false, null))
                .isInstanceOf(ResourceNotFoundException.class);

        verifyNoInteractions(storagePort, textSplitter, embeddingPort, documentRepository, embeddingRepository);
    }

    @Test
    void create_whenStorageFails_throwsException() {
        when(userRepository.findById(1)).thenReturn(Optional.of(admin));
        when(storagePort.upload(any(), any(), any())).thenThrow(new RuntimeException("Storage error"));

        assertThatThrownBy(() -> service.create(1, "f.pdf", null, CONTENT, "application/pdf", 3, false, false, null))
                .hasMessage("Storage error");

        verifyNoInteractions(documentRepository, textSplitter, embeddingPort, embeddingRepository);
    }

    @Test
    void create_whenDbSaveFails_deletesFromStorage() {
        when(userRepository.findById(1)).thenReturn(Optional.of(admin));
        when(storagePort.upload(any(), any(), any())).thenReturn("https://storage.example.com/key");
        when(documentRepository.save(any())).thenThrow(new RuntimeException("DB error"));

        assertThatThrownBy(() -> service.create(1, "f.pdf", null, CONTENT, "application/pdf", 3, false, false, null))
                .hasMessage("DB error");

        verify(storagePort).delete("key");
    }

    @Test
    void create_whenEmbeddingFails_deletesFromStorage() {
        when(userRepository.findById(1)).thenReturn(Optional.of(admin));
        when(storagePort.upload(any(), any(), any())).thenReturn("https://storage.example.com/key");
        when(documentRepository.save(any())).thenReturn(
                Document.builder().id(1).user(admin).fileName("f.pdf").fileSize(3)
                        .knowledgeBase(true)
                        .bucketUrl("https://storage.example.com/key").build());
        when(textExtractor.extract(any(), any())).thenReturn("extracted text");
        when(textSplitter.split(any())).thenReturn(List.of("chunk one"));
        when(embeddingPort.embed(any())).thenThrow(new RuntimeException("Embedding error"));

        assertThatThrownBy(() -> service.create(1, "f.pdf", null, CONTENT, "application/pdf", 3, true, false, null))
                .hasMessage("Embedding error");

        verify(storagePort).delete("key");
        verifyNoInteractions(embeddingRepository);
    }

    @Test
    void download_superUser_whenExists_returnsFileNameAndContent() {
        Document doc = buildDoc(admin);
        byte[] content = new byte[]{1, 2, 3};
        when(documentRepository.findById(1)).thenReturn(Optional.of(doc));
        when(storagePort.download("uuid_report.pdf")).thenReturn(content);

        DocumentService.DocumentDownload result = service.download(1, 1, "admin");

        assertThat(result.fileName()).isEqualTo("report.pdf");
        assertThat(result.content()).isEqualTo(content);
    }

    @Test
    void download_aluno_whenIsRecipient_returnsContent() {
        Document doc = buildDoc(admin);
        DocumentRecipient dr = DocumentRecipient.builder().document(doc).recipient(aluno).build();
        byte[] content = new byte[]{1, 2, 3};
        when(documentRepository.findById(1)).thenReturn(Optional.of(doc));
        when(recipientRepository.findByDocumentId(1)).thenReturn(Optional.of(dr));
        when(storagePort.download("uuid_report.pdf")).thenReturn(content);

        DocumentService.DocumentDownload result = service.download(1, 2, "aluno");

        assertThat(result.content()).isEqualTo(content);
    }

    @Test
    void download_aluno_whenNotRecipient_throwsForbiddenOperationException() {
        Document doc = buildDoc(admin);
        when(documentRepository.findById(1)).thenReturn(Optional.of(doc));
        when(recipientRepository.findByDocumentId(1)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.download(1, 2, "aluno"))
                .isInstanceOf(ForbiddenOperationException.class);
    }

    @Test
    void download_whenNotFound_throwsResourceNotFoundException() {
        when(documentRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.download(99, 1, "admin"))
                .isInstanceOf(ResourceNotFoundException.class);

        verifyNoInteractions(storagePort);
    }

    @Test
    void download_whenStorageFails_propagatesException() {
        Document doc = buildDoc(admin);
        when(documentRepository.findById(1)).thenReturn(Optional.of(doc));
        when(storagePort.download(any())).thenThrow(new RuntimeException("Storage error"));

        assertThatThrownBy(() -> service.download(1, 1, "admin")).hasMessage("Storage error");
    }

    @Test
    void delete_whenExists_deletesFromStorageAndDb() {
        Document doc = buildDoc(admin);
        when(documentRepository.findById(1)).thenReturn(Optional.of(doc));

        service.delete(1);

        verify(storagePort).delete("uuid_report.pdf");
        verify(documentRepository).deleteById(1);
    }

    @Test
    void delete_whenNotFound_throwsResourceNotFoundException() {
        when(documentRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.delete(99))
                .isInstanceOf(ResourceNotFoundException.class);

        verifyNoInteractions(storagePort);
    }

    @Test
    void delete_whenStorageFails_doesNotDeleteFromDb() {
        Document doc = buildDoc(admin);
        when(documentRepository.findById(1)).thenReturn(Optional.of(doc));
        doThrow(new RuntimeException("Storage error")).when(storagePort).delete(any());

        assertThatThrownBy(() -> service.delete(1)).hasMessage("Storage error");

        verify(documentRepository, never()).deleteById(any());
    }
}
