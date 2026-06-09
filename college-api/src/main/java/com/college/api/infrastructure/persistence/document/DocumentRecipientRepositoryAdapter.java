package com.college.api.infrastructure.persistence.document;

import com.college.api.domain.document.Document;
import com.college.api.domain.document.DocumentRecipient;
import com.college.api.domain.document.DocumentRecipientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class DocumentRecipientRepositoryAdapter implements DocumentRecipientRepository {

    private final JpaDocumentRecipientRepository jpa;

    @Override
    public DocumentRecipient save(DocumentRecipient documentRecipient) {
        return jpa.save(documentRecipient);
    }

    @Override
    public Optional<DocumentRecipient> findByDocumentId(Integer documentId) {
        return jpa.findByDocumentId(documentId);
    }

    @Override
    public List<Document> findDocumentsByRecipientId(Integer recipientId) {
        return jpa.findDocumentsByRecipientId(recipientId);
    }
}
