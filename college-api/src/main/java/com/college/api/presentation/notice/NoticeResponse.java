package com.college.api.presentation.notice;

import com.college.api.domain.notice.Notice;

import java.time.OffsetDateTime;

public record NoticeResponse(
        Integer id,
        Integer userId,
        String username,
        String title,
        String markdownContent,
        String coverImgUrl,
        Integer categoryId,
        String categoryName,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        OffsetDateTime deletedAt
) {
    public static NoticeResponse from(Notice notice) {
        return new NoticeResponse(
                notice.getId(),
                notice.getUser().getId(),
                notice.getUser().getUsername(),
                notice.getTitle(),
                notice.getMarkdownContent(),
                notice.getCoverImgUrl(),
                notice.getCategory().getId(),
                notice.getCategory().getName(),
                notice.getCreatedAt(),
                notice.getUpdatedAt(),
                notice.getDeletedAt()
        );
    }
}
