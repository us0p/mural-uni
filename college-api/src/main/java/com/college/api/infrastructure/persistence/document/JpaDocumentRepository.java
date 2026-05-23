package com.college.api.infrastructure.persistence.document;

import com.college.api.domain.document.Document;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaDocumentRepository extends JpaRepository<Document, Integer> {
}
