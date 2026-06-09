package com.college.api.application.document;

import com.college.api.application.exception.ForbiddenOperationException;
import com.college.api.application.exception.ResourceNotFoundException;
import com.college.api.domain.document.*;
import com.college.api.domain.user.User;
import com.college.api.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private static final Logger log = LoggerFactory.getLogger(DocumentService.class);

    private final DocumentRepository documentRepository;
    private final DocumentEmbeddingRepository embeddingRepository;
    private final DocumentRecipientRepository recipientRepository;
    private final UserRepository userRepository;
    private final DocumentStoragePort storagePort;
    private final DocumentTextExtractor textExtractor;
    private final TextSplitter textSplitter;
    private final EmbeddingPort embeddingPort;

    public record DocumentWithRecipient(Document document, DocumentRecipient recipient) {}
    public record DocumentDownload(String fileName, byte[] content) {}

    @Transactional(readOnly = true)
    public List<DocumentWithRecipient> findAll() {
        List<Document> docs = documentRepository.findAll();
        return enrichWithRecipients(docs);
    }

    @Transactional(readOnly = true)
    public List<Document> findAllPublic() {
        return documentRepository.findAllByIsPublicTrue();
    }

    @Transactional(readOnly = true)
    public List<DocumentWithRecipient> findForCurrentUser(Integer userId, String roleName) {
        List<Document> docs = "aluno".equals(roleName)
                ? recipientRepository.findDocumentsByRecipientId(userId)
                : documentRepository.findAll();
        return enrichWithRecipients(docs);
    }

    @Transactional(readOnly = true)
    public DocumentDownload downloadPublic(Integer id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document", id));
        if (!document.isPublic()) {
            throw new ForbiddenOperationException("Document is not publicly accessible");
        }
        String key = document.getBucketUrl().substring(document.getBucketUrl().lastIndexOf('/') + 1);
        return new DocumentDownload(document.getFileName(), storagePort.download(key));
    }

    @Transactional
    public DocumentWithRecipient create(Integer userId, String fileName, String description,
                                        byte[] content, String contentType, Integer fileSize,
                                        boolean knowledgeBase, boolean isPublic,
                                        Integer recipientId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        User recipient = null;
        if (recipientId != null) {
            recipient = userRepository.findById(recipientId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", recipientId));
            if (!"aluno".equals(recipient.getRole().getName())) {
                throw new ForbiddenOperationException("Document can only be assigned to an aluno");
            }
            knowledgeBase = false;
        }

        String bucketUrl = storagePort.upload(fileName, content, contentType);
        String key = bucketUrl.substring(bucketUrl.lastIndexOf('/') + 1);

        try {
            Document document = documentRepository.save(Document.builder()
                    .user(user)
                    .fileName(fileName)
                    .description(description)
                    .fileSize(fileSize)
                    .bucketUrl(bucketUrl)
                    .knowledgeBase(knowledgeBase)
                    .isPublic(isPublic)
                    .build());

            DocumentRecipient savedRecipient = null;
            if (recipient != null) {
                savedRecipient = recipientRepository.save(DocumentRecipient.builder()
                        .document(document)
                        .recipient(recipient)
                        .build());
            }

            if (knowledgeBase) {
                try {
                    String textContent = textExtractor.extract(content, contentType);
                    log.info("[{}] extracted {} characters", fileName, textContent.length());

                    if (textContent.isBlank()) {
                        log.warn("[{}] text extraction produced no content — no embeddings stored", fileName);
                    } else {
                        List<String> chunks = textSplitter.split(textContent);
                        log.info("[{}] split into {} chunks", fileName, chunks.size());

                        List<DocumentEmbedding> embeddings = new ArrayList<>(chunks.size());
                        for (int i = 0; i < chunks.size(); i++) {
                            float[] embedding = embeddingPort.embed(chunks.get(i));
                            embeddings.add(DocumentEmbedding.builder()
                                    .document(document)
                                    .chunkText(chunks.get(i))
                                    .chunkIndex(i)
                                    .embedding(embedding)
                                    .build());
                        }
                        embeddingRepository.saveAll(embeddings);
                        log.info("[{}] saved {} embeddings", fileName, embeddings.size());
                    }
                } catch (UnsupportedOperationException e) {
                    log.warn("[{}] embedding skipped — embedding service unavailable: {}", fileName, e.getMessage());
                }
            } else {
                log.info("[{}] uploaded without knowledgeBase flag — skipping embedding", fileName);
            }

            return new DocumentWithRecipient(document, savedRecipient);
        } catch (Exception e) {
            try {
                storagePort.delete(key);
            } catch (Exception deleteEx) {
                e.addSuppressed(deleteEx);
            }
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public DocumentDownload download(Integer id, Integer requesterId, String requesterRole) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document", id));
        if ("aluno".equals(requesterRole)) {
            boolean isRecipient = recipientRepository.findByDocumentId(id)
                    .map(dr -> dr.getRecipient().getId().equals(requesterId))
                    .orElse(false);
            if (!isRecipient) {
                throw new ForbiddenOperationException("Access denied");
            }
        }
        String key = document.getBucketUrl().substring(document.getBucketUrl().lastIndexOf('/') + 1);
        return new DocumentDownload(document.getFileName(), storagePort.download(key));
    }

    @Transactional
    public void delete(Integer id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document", id));
        String key = document.getBucketUrl().substring(document.getBucketUrl().lastIndexOf('/') + 1);
        storagePort.delete(key);
        documentRepository.deleteById(id);
    }

    private List<DocumentWithRecipient> enrichWithRecipients(List<Document> docs) {
        if (docs.isEmpty()) return List.of();
        List<Integer> ids = docs.stream().map(Document::getId).toList();
        Map<Integer, DocumentRecipient> byDocId = ids.stream()
                .map(recipientRepository::findByDocumentId)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toMap(dr -> dr.getDocument().getId(), dr -> dr));
        return docs.stream()
                .map(d -> new DocumentWithRecipient(d, byDocId.get(d.getId())))
                .toList();
    }
}
