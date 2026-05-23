package com.college.api.presentation.document;

import com.college.api.domain.document.Document;

public record DocumentResponse(
        Integer id,
        Integer userId,
        String username,
        String fileName,
        String description,
        Integer fileSize,
        String bucketUrl,
        boolean knowledgeBase
) {
    public static DocumentResponse from(Document d) {
        return new DocumentResponse(
                d.getId(),
                d.getUser().getId(),
                d.getUser().getUsername(),
                d.getFileName(),
                d.getDescription(),
                d.getFileSize(),
                d.getBucketUrl(),
                d.isKnowledgeBase()
        );
    }
}
