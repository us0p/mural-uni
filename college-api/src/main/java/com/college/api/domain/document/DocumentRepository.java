package com.college.api.domain.document;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository {
    Document save(Document document);
    Optional<Document> findById(Integer id);
    List<Document> findAll();
    void deleteById(Integer id);
    boolean existsById(Integer id);
}
