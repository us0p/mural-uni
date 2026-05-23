package com.college.api.infrastructure.persistence.document;

import com.college.api.domain.document.Document;
import com.college.api.domain.document.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class DocumentRepositoryAdapter implements DocumentRepository {

    private final JpaDocumentRepository jpa;

    @Override
    public Document save(Document document) {
        return jpa.save(document);
    }

    @Override
    public Optional<Document> findById(Integer id) {
        return jpa.findById(id);
    }

    @Override
    public List<Document> findAll() {
        return jpa.findAll();
    }

    @Override
    public void deleteById(Integer id) {
        jpa.deleteById(id);
    }

    @Override
    public boolean existsById(Integer id) {
        return jpa.existsById(id);
    }
}
