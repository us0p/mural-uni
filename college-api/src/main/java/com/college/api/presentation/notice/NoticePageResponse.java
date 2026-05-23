package com.college.api.presentation.notice;

import com.college.api.domain.notice.NoticePage;

import java.util.List;

public record NoticePageResponse(
        List<NoticeResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
    public static NoticePageResponse from(NoticePage noticePage) {
        return new NoticePageResponse(
                noticePage.content().stream().map(NoticeResponse::from).toList(),
                noticePage.page(),
                noticePage.size(),
                noticePage.totalElements(),
                noticePage.totalPages()
        );
    }
}
