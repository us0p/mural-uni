package com.college.api.infrastructure.persistence.document;

import com.college.api.domain.document.Document;
import com.college.api.domain.document.DocumentRecipient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface JpaDocumentRecipientRepository extends JpaRepository<DocumentRecipient, Integer> {
    Optional<DocumentRecipient> findByDocumentId(Integer documentId);

    @Query("SELECT dr.document FROM DocumentRecipient dr WHERE dr.recipient.id = :recipientId")
    List<Document> findDocumentsByRecipientId(@Param("recipientId") Integer recipientId);
}
