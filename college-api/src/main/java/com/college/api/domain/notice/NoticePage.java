package com.college.api.domain.notice;

import java.util.List;

public record NoticePage(
        List<Notice> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {}
