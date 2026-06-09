package com.college.api.presentation.document;

import com.college.api.application.document.DocumentService.DocumentWithRecipient;
import com.college.api.domain.document.Document;

public record DocumentResponse(
        Integer id,
        Integer userId,
        String username,
        String fileName,
        String description,
        Integer fileSize,
        String bucketUrl,
        boolean knowledgeBase,
        boolean isPublic,
        Integer recipientId,
        String recipientUsername
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
                d.isKnowledgeBase(),
                d.isPublic(),
                null,
                null
        );
    }

    public static DocumentResponse from(DocumentWithRecipient dwr) {
        Document d = dwr.document();
        return new DocumentResponse(
                d.getId(),
                d.getUser().getId(),
                d.getUser().getUsername(),
                d.getFileName(),
                d.getDescription(),
                d.getFileSize(),
                d.getBucketUrl(),
                d.isKnowledgeBase(),
                d.isPublic(),
                dwr.recipient() != null ? dwr.recipient().getRecipient().getId() : null,
                dwr.recipient() != null ? dwr.recipient().getRecipient().getUsername() : null
        );
    }
}
