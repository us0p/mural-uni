package com.college.api.infrastructure.persistence.document;

import com.college.api.domain.document.DocumentEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaDocumentEmbeddingRepository extends JpaRepository<DocumentEmbedding, Integer> {
}
