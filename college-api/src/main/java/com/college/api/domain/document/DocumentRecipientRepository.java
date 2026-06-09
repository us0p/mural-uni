package com.college.api.domain.document;

import java.util.List;
import java.util.Optional;

public interface DocumentRecipientRepository {
    DocumentRecipient save(DocumentRecipient documentRecipient);
    Optional<DocumentRecipient> findByDocumentId(Integer documentId);
    List<Document> findDocumentsByRecipientId(Integer recipientId);
}
