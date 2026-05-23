package com.college.api.presentation.user;

import com.college.api.domain.user.UserPage;

import java.util.List;

public record UserPageResponse(
        List<UserResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
    public static UserPageResponse from(UserPage userPage) {
        return new UserPageResponse(
                userPage.content().stream().map(UserResponse::from).toList(),
                userPage.page(),
                userPage.size(),
                userPage.totalElements(),
                userPage.totalPages()
        );
    }
}
