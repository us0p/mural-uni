package com.college.api.presentation.role;

import com.college.api.domain.role.RolePage;

import java.util.List;

public record RolePageResponse(
        List<RoleResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
    public static RolePageResponse from(RolePage rolePage) {
        return new RolePageResponse(
                rolePage.content().stream().map(RoleResponse::from).toList(),
                rolePage.page(),
                rolePage.size(),
                rolePage.totalElements(),
                rolePage.totalPages()
        );
    }
}
