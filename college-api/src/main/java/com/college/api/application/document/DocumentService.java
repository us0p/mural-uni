package com.college.api.application.document;

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

@Service
@RequiredArgsConstructor
public class DocumentService {

    private static final Logger log = LoggerFactory.getLogger(DocumentService.class);

    private final DocumentRepository documentRepository;
    private final DocumentEmbeddingRepository embeddingRepository;
    private final UserRepository userRepository;
    private final DocumentStoragePort storagePort;
    private final DocumentTextExtractor textExtractor;
    private final TextSplitter textSplitter;
    private final EmbeddingPort embeddingPort;

    @Transactional(readOnly = true)
    public List<Document> findAll() {
        return documentRepository.findAll();
    }

    @Transactional
    public Document create(Integer userId, String fileName, String description,
                           byte[] content, String contentType, Integer fileSize, boolean knowledgeBase) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

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
                    .build());

            if (knowledgeBase) {
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
            } else {
                log.info("[{}] uploaded without knowledgeBase flag — skipping embedding", fileName);
            }

            return document;
        } catch (Exception e) {
            try {
                storagePort.delete(key);
            } catch (Exception deleteEx) {
                e.addSuppressed(deleteEx);
            }
            throw e;
        }
    }

    public record DocumentDownload(String fileName, byte[] content) {}

    @Transactional(readOnly = true)
    public DocumentDownload download(Integer id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document", id));
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

}
