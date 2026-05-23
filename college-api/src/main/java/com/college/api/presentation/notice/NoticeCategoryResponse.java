package com.college.api.presentation.notice;

import com.college.api.domain.notice.NoticeCategory;

public record NoticeCategoryResponse(Integer id, String name) {

    public static NoticeCategoryResponse from(NoticeCategory category) {
        return new NoticeCategoryResponse(category.getId(), category.getName());
    }
}
